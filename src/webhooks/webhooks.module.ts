import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { Webhook, WebhookSchema } from './schemas/webhook.schema';
import { WebhooksGateway } from './webhooks.gateway';
import { WebhookConsumerService } from './webhook.consumer';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WebhookConsumerController } from './webhook-consumer.controller';

@Module({
    imports: [MongooseModule.forFeature([{ name: Webhook.name, schema: WebhookSchema }])],
    
    providers: [WebhooksService, WebhooksGateway, WebhookConsumerService],
    controllers: [WebhooksController,WebhookConsumerController],
    exports: [WebhooksService],
})
export class WebhooksModule {}
