import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatSessionDto, SendMessageDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('sessions')
  createSession(@Request() req, @Body() dto: CreateChatSessionDto) {
    return this.chatService.createSession(req.user.sub, dto);
  }

  @Get('sessions')
  getSessions(@Request() req) {
    return this.chatService.getSessions(req.user.sub);
  }

  @Get('sessions/:sessionId')
  getMessages(@Request() req, @Param('sessionId') sessionId: string) {
    return this.chatService.getMessages(req.user.sub, sessionId);
  }

  @Post('sessions/:sessionId/messages')
  sendMessage(@Request() req, @Param('sessionId') sessionId: string, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.sub, sessionId, dto);
  }

  @Delete('sessions/:sessionId')
  deleteSession(@Request() req, @Param('sessionId') sessionId: string) {
    return this.chatService.deleteSession(req.user.sub, sessionId);
  }
}