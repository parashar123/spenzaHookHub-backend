import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*', // ✅ Allow all origins (update for production)
        methods: ['GET', 'POST'],
        credentials: true,
    },
})
export class WebhooksGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger = new Logger('WebhooksGateway');

    afterInit() {
        this.logger.log('WebSocket Gateway Initialized');
    }

    handleConnection(client: any) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: any) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    sendUpdate(data: any) {
        this.server.emit('webhookUpdate', data);
    }
}
