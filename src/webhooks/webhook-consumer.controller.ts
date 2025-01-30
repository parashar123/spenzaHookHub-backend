import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import axios from 'axios';
import * as crypto from 'crypto';

@Controller()
export class WebhookConsumerController {
    private readonly logger = new Logger(WebhookConsumerController.name);
    private client: ClientProxy;

    constructor() {
        this.client = ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://guest:guest@localhost:5672'],
                queue: 'webhook_queue',
                queueOptions: { durable: false },
            },
        });
    }

@EventPattern('webhook_event')
async handleEvent(@Payload() data: any) {
    this.logger.log(`Received webhook event: ${JSON.stringify(data)}`);

    const { event, webhookId, retryCount = 0 } = data;
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 5000;

    try {
        await this.processWebhook(event.event || event); 

        this.logger.log(`Successfully processed event for webhookId: ${webhookId}`);
    } catch (error) {
        this.logger.error(`Error processing event for webhookId ${webhookId}: ${error.message}`);

        if (retryCount < MAX_RETRIES) {
            const newRetryCount = retryCount + 1;
            this.logger.log(`Retrying event for webhookId: ${webhookId} (Attempt ${newRetryCount}/${MAX_RETRIES})`);

            setTimeout(() => {
                this.client.emit('webhook_event', { event, webhookId, retryCount: newRetryCount });
            }, RETRY_DELAY_MS);
        } else {
            this.logger.error(`Max retry attempts reached for webhookId: ${webhookId}.`);
        }
    }
}

async processWebhook(event: any) {
    const SECRET = process.env.WEBHOOK_SECRET || 'fallback-secret';

    const actualEvent = event.event || event;

    if (!actualEvent || !actualEvent.callbackUrl) {
        throw new Error(`Missing callback URL in event: ${JSON.stringify(actualEvent)}`);
    }

    const headers = {
        'Content-Type': 'application/json',
        ...actualEvent.authHeaders
    };

    // Trying to generate an HMAC signature for security purpose
    const rawPayload = JSON.stringify(actualEvent);
    const signature = crypto.createHmac('sha256', SECRET).update(rawPayload).digest('hex');
    headers['X-Hub-Signature'] = `sha256=${signature}`;

    this.logger.log(`Sending event to: ${actualEvent.callbackUrl}`);

    try {
        const response = await axios.post(actualEvent.callbackUrl, rawPayload, { headers });

        if (response.status >= 200 && response.status < 300) {
            this.logger.log(`Webhook delivered successfully: ${response.status}`);
        } else {
            throw new Error(`Unexpected response status: ${response.status}`);
        }
    } catch (error) {
        throw new Error(`HTTP request failed: ${error.response?.status || 'Unknown'} - ${error.message}`);
    }
}
    
}
