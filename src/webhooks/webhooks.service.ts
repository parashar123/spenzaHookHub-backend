import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Webhook } from './schemas/webhook.schema';
import * as schedule from 'node-schedule';
import axios from 'axios';
import { WebhooksGateway } from './webhooks.gateway';
import * as crypto from 'crypto';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { User } from 'src/auth/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);
    private readonly retryJobs = new Map<string, schedule.Job>();

    private client: ClientProxy;

    constructor(@InjectModel(Webhook.name) private webhookModel: Model<Webhook>,    @InjectModel(User.name) private userModel: Model<User>,
    private readonly gateway: WebhooksGateway) {this.client = ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
            urls: ['amqp://guest:guest@localhost:5672'],
            queue: 'webhook_queue',
            queueOptions: { durable: false },
            socketOptions: {
                heartbeatIntervalInSeconds: 30,
                reconnectTimeInSeconds: 5,
            },
        },
    });
}

async subscribe(username: string, sourceUrl: string, callbackUrl: string, eventTypes: string[]) {
    const user = await this.userModel.findOne({ username });
    if (!user) throw new NotFoundException('User not found');
  
    const existingWebhook = await this.webhookModel.findOne({ sourceUrl, username });
    if (existingWebhook) throw new ConflictException('Webhook already subscribed');

    const secret = crypto.randomBytes(32).toString('hex');
  const webhookId = uuidv4();
  
    const webhook = new this.webhookModel({ username, sourceUrl, callbackUrl, eventTypes, secret, webhookId  });
    await webhook.save();
    return { message: 'Webhook subscribed successfully', webhook };
  }
    
    async listWebhooks(): Promise<Webhook[]> {
        return this.webhookModel.find().exec();
    }

    async getUserWebhooks(username: string) {
        return this.webhookModel.find({ username });
      }

      async deleteWebhook(username: string, webhookId: string) {
        const webhook = await this.webhookModel.findOneAndDelete({ _id: webhookId, username });
        if (!webhook) throw new NotFoundException('Webhook not found');
        return { message: 'Webhook deleted successfully' };
      }

      async findBySourceUrl(sourceUrl: string) {
        return this.webhookModel.findOne({ sourceUrl }).select('+secret');
      }

    async processEventWithRetry(event: any, webhookId: string, retryCount = 0) {
    const MAX_RETRIES = 3;
    const SECRET = process.env.WEBHOOK_SECRET || 'fallback-secret';

    try {
        const webhook = await this.webhookModel.findById(webhookId);
        if (!webhook) throw new Error('Webhook not found');

        const headers = {
            'Content-Type': 'application/json',
            ...webhook
        };

        const rawPayload = JSON.stringify(event);

        const signature = crypto.createHmac('sha256', SECRET).update(rawPayload).digest('hex');
        headers['X-Hub-Signature'] = `sha256=${signature}`;

        console.log(`Publishing event to RabbitMQ for retry handling: ${JSON.stringify(event)}`);

        this.client.emit('webhook_event', { event, webhookId, retryCount });

    } catch (error) {
        this.logger.error(`Failed to publish event to RabbitMQ: ${error.message}`);

        if (retryCount < MAX_RETRIES) {
            setTimeout(() => {
                this.processEventWithRetry(event, webhookId, retryCount + 1);
            }, 5000);
        } else {
            this.logger.error('Max retry attempts reached. Event delivery failed.');
        }
    }
}
}
