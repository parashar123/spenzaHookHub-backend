import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private channel: amqp.Channel;

  async onModuleInit() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    this.channel = await connection.createChannel();
    await this.channel.assertQueue('webhookQueue', { durable: true });
  }

  async publishToQueue(data: any) {
    this.channel.sendToQueue('webhookQueue', Buffer.from(JSON.stringify(data)), { persistent: true });
  }

  async consumeQueue(callback: (data: any) => Promise<void>) {
    this.channel.consume('webhookQueue', async (msg) => {
      if (msg) {
        const eventData = JSON.parse(msg.content.toString());
        await callback(eventData);
        this.channel.ack(msg);
      }
    });
  }
}
