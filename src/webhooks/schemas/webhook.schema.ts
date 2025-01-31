import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // ✅ Import UUID to generate unique webhookId

@Schema()
export class Webhook extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  sourceUrl: string;

  @Prop({ required: true })
  callbackUrl: string;

  @Prop({ default: [] })
  eventTypes: string[];

  @Prop({ required: true, unique: true, default: uuidv4 })
  webhookId: string;

  @Prop({ required: true })
  secret: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);
