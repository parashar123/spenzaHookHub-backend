import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { WebhookEventService } from './webhook-event.service';
import axios from 'axios';

@Injectable()
export class WebhookProcessor implements OnModuleInit {
  constructor(
    private rabbitMQService: RabbitMQService,
    private webhookEventService: WebhookEventService,
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.consumeQueue(async (data) => {
      const { eventId, webhook } = data;

      try {
        await axios.post(webhook.callbackUrl, { eventId, eventType: webhook.eventType, payload: webhook.payload });
        await this.webhookEventService.markAsProcessed(eventId);
      } catch (error) {
        console.error('Webhook delivery failed:', error.message);
        await this.webhookEventService.markAsFailed(eventId);
      }
    });
  }
}
