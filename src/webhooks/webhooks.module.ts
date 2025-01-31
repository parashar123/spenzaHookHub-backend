import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { Webhook, WebhookSchema } from './schemas/webhook.schema';
import { WebhooksGateway } from './webhooks.gateway';
import { WebhookConsumerService } from './webhook.consumer';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WebhookConsumerController } from './webhook-consumer.controller';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { WebhookEventService } from './webhook-event.service';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { WebhookEvent, WebhookEventSchema } from './schemas/webhook-event.schema';

@Module({
    imports: [AuthModule, MongooseModule.forFeature([{ name: Webhook.name, schema: WebhookSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: WebhookEvent.name, schema: WebhookEventSchema }]),

],
    
    providers: [WebhooksService, WebhooksGateway, WebhookConsumerService, WebhookEventService, RabbitMQService],
    controllers: [WebhooksController,WebhookConsumerController],
    exports: [WebhooksService,WebhookEventService],
})
export class WebhooksModule {}
