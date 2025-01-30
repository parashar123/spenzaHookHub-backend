import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport, MessagePattern } from '@nestjs/microservices';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class WebhookConsumerService implements OnModuleInit {
    private readonly logger = new Logger(WebhookConsumerService.name);
    private client: ClientProxy;

    constructor() {
        this.client = ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://guest:guest@localhost:5672'], // ✅ RabbitMQ in Docker
                queue: 'webhook_queue',
                queueOptions: { durable: false },
            },
        });
    }

    async onModuleInit() {
        this.logger.log('📡 Connecting to RabbitMQ...');
        await this.client.connect();
        this.logger.log('✅ Connected to RabbitMQ! Waiting for events...');
    }

    // ✅ Fix the Consumer
    @MessagePattern('webhook_event') 
    async handleEvent(data: any) {
        this.logger.log('🔔 Received event:', data);
        const { event, webhookId, retryCount } = data;
        await this.sendWebhook(event, webhookId, retryCount);
    }

    async sendWebhook(event: any, webhookId: string, retryCount = 0) {
        const MAX_RETRIES = 3;
        const SECRET = process.env.WEBHOOK_SECRET || 'fallback-secret';

        try {
            const headers = {
                'Content-Type': 'application/json',
                ...event.authHeaders
            };

            const rawPayload = JSON.stringify(event);
            const signature = crypto.createHmac('sha256', SECRET).update(rawPayload).digest('hex');
            headers['X-Hub-Signature'] = `sha256=${signature}`;

            console.log(`📩 Sending event to: ${event.callbackUrl}`);
            const response = await axios.post(event.callbackUrl, rawPayload, { headers });

            this.logger.log(`✅ Webhook delivered successfully: ${response.status}`);

        } catch (error) {
            this.logger.error(`❌ Failed to send webhook: ${error.message}`);

            if (retryCount < MAX_RETRIES) {
                this.logger.log(`🔁 Retrying event... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
                this.client.emit('webhook_event', { event, webhookId, retryCount: retryCount + 1 });
            } else {
                this.logger.error('🚨 Max retry attempts reached. Webhook failed.');
            }
        }
    }
}
