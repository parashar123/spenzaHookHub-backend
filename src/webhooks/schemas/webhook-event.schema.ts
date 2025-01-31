import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class WebhookEvent extends Document {
  @Prop({ required: true })
  webhookId: string;

  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true, type: Object })
  payload: Record<string, any>;

  @Prop({ required: true, default: 'pending' })
  status: 'pending' | 'processed' | 'failed';

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);
