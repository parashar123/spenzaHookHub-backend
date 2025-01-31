import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookEvent } from './schemas/webhook-event.schema';

@Injectable()
export class WebhookEventService {
  constructor(@InjectModel(WebhookEvent.name) private webhookEventModel: Model<WebhookEvent>) {}

  async createEvent(webhookId: string, eventType: string, payload: any) {
    const event = new this.webhookEventModel({ webhookId, eventType, payload });
    return event.save();
  }

  async markAsProcessed(eventId: string) {
    await this.webhookEventModel.findByIdAndUpdate(eventId, { status: 'processed' });
  }

  async markAsFailed(eventId: string) {
    await this.webhookEventModel.findByIdAndUpdate(eventId, { status: 'failed' });
  }
}
