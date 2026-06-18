import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAiProviderDto, UpdateAiProviderDto } from './dto/ai-provider.dto';
import OpenAI from 'openai';

@Injectable()
export class AiProviderService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateAiProviderDto) {
    if (dto.isDefault) {
      await this.prisma.aiProvider.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.aiProvider.create({ data: { ...dto, userId } });
  }

  async findAll(userId: string) {
    return this.prisma.aiProvider.findMany({ where: { userId } });
  }

  async findOne(userId: string, id: string) {
    const provider = await this.prisma.aiProvider.findFirst({ where: { id, userId } });
    if (!provider) throw new NotFoundException('Provider not found');
    return provider;
  }

  async update(userId: string, id: string, dto: UpdateAiProviderDto) {
    await this.findOne(userId, id);
    if (dto.isDefault) {
      await this.prisma.aiProvider.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.aiProvider.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.aiProvider.delete({ where: { id } });
  }

  async getDefaultProvider(userId: string) {
    const provider = await this.prisma.aiProvider.findFirst({
      where: { userId, isDefault: true },
    });
    if (!provider) throw new NotFoundException('No default AI provider configured');
    return provider;
  }

  async getOpenAIClient(userId: string, providerId?: string) {
    const provider = providerId
      ? await this.findOne(userId, providerId)
      : await this.getDefaultProvider(userId);

    return new OpenAI({
      apiKey: provider.apiKey || 'not-needed',
      baseURL: provider.baseUrl,
    });
  }

  async getProviderWithClient(userId: string, providerId?: string) {
  const provider = providerId
    ? await this.findOne(userId, providerId)
    : await this.getDefaultProvider(userId);

  const client = new OpenAI({
    apiKey: provider.apiKey || 'not-needed',
    baseURL: provider.baseUrl,
    defaultHeaders: {
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI Code Review Assistant',
    },
  });

  return { provider, client };
}
}