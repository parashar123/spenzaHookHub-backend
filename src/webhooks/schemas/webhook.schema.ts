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

    @Prop({ type: Object })
    authHeaders: Record<string, string>;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);
