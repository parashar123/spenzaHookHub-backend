import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhooksController {
    constructor(private webhooksService: WebhooksService) {}

    @Post('subscribe')
    async subscribe(@Body() data: { sourceUrl: string; callbackUrl: string }) {
        return this.webhooksService.subscribe(data);
    }

    @Get()
    async listWebhooks() {
        return this.webhooksService.listWebhooks();
    }

    @Delete(':id')
    async cancelWebhook(@Param('id') id: string) {
        await this.webhooksService.cancelWebhook(id);
        return { message: 'Webhook deleted successfully' };
    }

    @Post('events')
    async handleEvent(@Body() event: any) {
    const { webhookId } = event;

    if (!webhookId) {
        throw new Error('webhookId is missing in the event payload');
    }

    console.log('Event received:', event);
    console.log('Webhook ID received:', webhookId);

    return this.webhooksService.processEventWithRetry(event, webhookId);
    }

}
