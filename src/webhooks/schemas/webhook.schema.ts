// src/webhooks/schemas/webhook.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Webhook extends Document {
    @Prop({ required: true })
    sourceUrl: string;

    @Prop({ required: true })
    callbackUrl: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: Object }) // Explicitly define as a key-value object
    authHeaders: Record<string, string>;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);
