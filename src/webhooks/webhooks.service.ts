// src/webhooks/webhooks.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Webhook } from './schemas/webhook.schema';
import * as schedule from 'node-schedule';
import axios from 'axios';
import { WebhooksGateway } from './webhooks.gateway';
import * as crypto from 'crypto';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);
    private readonly retryJobs = new Map<string, schedule.Job>();

    private client: ClientProxy;

    constructor(@InjectModel(Webhook.name) private webhookModel: Model<Webhook>, private readonly gateway: WebhooksGateway) {this.client = ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
            urls: ['amqp://guest:guest@localhost:5672'], // ✅ RabbitMQ running in Docker
            queue: 'webhook_queue',
            queueOptions: { durable: false },
            socketOptions: {
                heartbeatIntervalInSeconds: 30, // 🔥 Increase heartbeat to prevent timeouts
                reconnectTimeInSeconds: 5, // 🔁 Auto-reconnect every 5s if disconnected
            },
        },
    });
}

    async subscribe(data: { sourceUrl: string; callbackUrl: string; authHeaders?: Record<string, string> }) {
        const webhook = new this.webhookModel({
            sourceUrl: data.sourceUrl, // Include sourceUrl
            callbackUrl: data.callbackUrl,
            authHeaders: data.authHeaders || {},
        });
        const savedWebhook = await webhook.save();
    
        // Emit update to all clients
        this.gateway.sendUpdate(savedWebhook);
    
        return savedWebhook;
    }
    


    async listWebhooks(): Promise<Webhook[]> {
        return this.webhookModel.find().exec();
    }

    async cancelWebhook(id: string): Promise<void> {
    const webhook = await this.webhookModel.findById(id);
    if (!webhook) {
        throw new NotFoundException(`Webhook with id ${id} not found`);
    }
    await webhook.deleteOne();
}

async processEventWithRetry(event: any, webhookId: string, retryCount = 0) {
    const MAX_RETRIES = 3;
    const SECRET = process.env.WEBHOOK_SECRET || 'fallback-secret'; // ✅ Ensure .env is loaded

    try {
        const webhook = await this.webhookModel.findById(webhookId);
        if (!webhook) throw new Error('Webhook not found');

        const headers = {
            'Content-Type': 'application/json',
            ...webhook.authHeaders
        };

        // 🔐 Ensure raw JSON format (no spaces)
        const rawPayload = JSON.stringify(event);

        // 🔐 Generate HMAC Signature
        const signature = crypto.createHmac('sha256', SECRET).update(rawPayload).digest('hex');
        headers['X-Hub-Signature'] = `sha256=${signature}`;

        console.log(`📩 Publishing event to RabbitMQ for retry handling: ${JSON.stringify(event)}`);

        // ✅ Publish the event to RabbitMQ instead of processing immediately
        this.client.emit('webhook_event', { event, webhookId, retryCount });

    } catch (error) {
        this.logger.error(`❌ Failed to publish event to RabbitMQ: ${error.message}`);

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