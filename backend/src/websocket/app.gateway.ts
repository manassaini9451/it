import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL||'http://localhost:3000', credentials: true }, namespace: 'ws' })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('WS');
  private clients = new Map<string, any>();

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
    setInterval(() => { this.server.emit('analytics:active-visitors', { count: this.clients.size, timestamp: new Date() }); }, 30000);
  }
  handleConnection(client: Socket) {
    this.clients.set(client.id, {});
    this.logger.log(`Client connected: ${client.id} (total: ${this.clients.size})`);
    this.server.emit('stats:connected', { count: this.clients.size });
  }
  handleDisconnect(client: Socket) {
    this.clients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id} (total: ${this.clients.size})`);
    this.server.emit('stats:connected', { count: this.clients.size });
  }
  @SubscribeMessage('ping') handlePing(@ConnectedSocket() client: Socket) { client.emit('pong', { ts: new Date() }); }
  @SubscribeMessage('join-room') handleJoin(@MessageBody() room: string, @ConnectedSocket() c: Socket) { c.join(room); }
  @SubscribeMessage('leave-room') handleLeave(@MessageBody() room: string, @ConnectedSocket() c: Socket) { c.leave(room); }
  broadcast(event: string, data: any) { this.server.emit(event, data); }
  broadcastToAdmins(event: string, data: any) { this.server.to('admin-room').emit(event, data); }
}
