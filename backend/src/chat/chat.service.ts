import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiProviderService } from '../ai-provider/ai-provider.service';
import { FilesService } from '../files/files.service';
import { CreateChatSessionDto, SendMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private aiProvider: AiProviderService,
    private filesService: FilesService,
  ) {}

  async createSession(userId: string, dto: CreateChatSessionDto) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, userId },
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.chatSession.create({
      data: { userId, projectId: dto.projectId },
    });
  }

  async getSessions(userId: string) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMessages(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async sendMessage(userId: string, sessionId: string, dto: SendMessageDto) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) throw new NotFoundException('Session not found');

    await this.prisma.message.create({
      data: { sessionId, role: 'user', content: dto.message },
    });

    const files = await this.filesService.getFilesContent(session.projectId);
    const codeContext = files
      .slice(0, 10)
      .map(f => `// File: ${f.path}\n${f.content?.slice(0, 2000)}`)
      .join('\n\n---\n\n');

    const history = session.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const { client, provider } = await this.aiProvider.getProviderWithClient(userId, dto.providerId);

    const response = await client.chat.completions.create({
      model: provider.modelName,
      messages: [
        {
          role: 'system',
          content: `You are a helpful code assistant. You have access to the following codebase:\n\n${codeContext}\n\nAnswer questions about this code clearly and concisely.`,
        },
        ...history,
        { role: 'user', content: dto.message },
      ],
      temperature: 0.5,
    });

    const assistantMessage = response.choices[0].message.content || '';

    const saved = await this.prisma.message.create({
      data: { sessionId, role: 'assistant', content: assistantMessage },
    });

    return { message: saved, content: assistantMessage };
  }

  async deleteSession(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException('Session not found');
    return this.prisma.chatSession.delete({ where: { id: sessionId } });
  }
}