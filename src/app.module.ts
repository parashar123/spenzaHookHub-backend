import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/spenzaWebHook'),
        AuthModule,
        WebhooksModule,
    ],
    providers: [RabbitMQService],

})
export class AppModule {}
