import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { WebhookEventService } from './webhook-event.service';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhooksController {
    constructor(
        private webhooksService: WebhooksService,
        private webhookEventService: WebhookEventService,
        private rabbitMQService: RabbitMQService,
      ) {}
      
    @Post('subscribe')
  async subscribe(
    @Request() req,
    @Body() body: { sourceUrl: string; callbackUrl: string; eventTypes: string[] }
  ) {
    return this.webhooksService.subscribe(req.user.username, body.sourceUrl, body.callbackUrl, body.eventTypes);
  }

    @Get('all')
    async listWebhooks() {
        return this.webhooksService.listWebhooks();
    }

    @Get()
    async getUserWebhooks(@Request() req) {
      return this.webhooksService.getUserWebhooks(req.user.username);
    }


    @Delete(':id')
  async deleteWebhook(@Request() req, @Param('id') webhookId: string) {
    return this.webhooksService.deleteWebhook(req.user.username, webhookId);
  }

    // @Post('events')
    // async handleEvent(@Body() event: any) {
    // const { webhookId } = event;

    // if (!webhookId) {
    //     throw new Error('webhookId is missing in the event payload');
    // }

    // console.log('Event received:', event);
    // console.log('Webhook ID received:', webhookId);

    // return this.webhooksService.processEventWithRetry(event, webhookId);
    // }

    @Post('handle')
    async handleWebhook(
      @Body() body: { sourceUrl: string; eventType: string; payload: any; signature?: string },
    ) {
      const webhook = await this.webhooksService.findBySourceUrl(body.sourceUrl);
    
      if (!webhook) {
        throw new BadRequestException('Webhook not found');
      }
    
      if (!webhook.secret) {
        throw new BadRequestException('Webhook secret is missing');  // ✅ Handle missing `secret`
      }
    
      // Verify Signature
      if (!this.verifySignature(body.payload, webhook.secret, body.signature)) {
        throw new BadRequestException('Invalid signature');
      }
    
      if (!webhook.eventTypes.includes(body.eventType)) {
        throw new BadRequestException('Event type not subscribed');
      }
    
      const event = await this.webhookEventService.createEvent(webhook.webhookId, body.eventType, body.payload);
    
      await this.rabbitMQService.publishToQueue({ eventId: event._id, webhook });
    
      return { message: 'Webhook received' };
    }

  private verifySignature(payload: any, secret: string, signature?: string): boolean {
    if (!signature) return false;
    const crypto = require('crypto');
    const computedSignature = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    return computedSignature === signature;
  }

}
