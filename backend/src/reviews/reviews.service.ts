import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiProviderService } from '../ai-provider/ai-provider.service';
import { FilesService } from '../files/files.service';
import { CreateReviewDto, SearchReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private aiProvider: AiProviderService,
    private filesService: FilesService,
  ) {}

  private getSystemPrompt(template: string): string {
    const prompts = {
      security: `You are a security-focused code reviewer. Analyze the code for:
- Hardcoded credentials, API keys, or secrets
- Authentication and authorization issues
- Input validation and sanitization problems
- SQL injection, XSS, and other injection risks
- Insecure dependencies or configurations
Return a JSON object with: { summary, issues: [{title, description, severity, file, line}], recommendations: [{title, description}], overallSeverity }`,

      performance: `You are a performance-focused code reviewer. Analyze the code for:
- Slow or blocking operations
- Inefficient algorithms or data structures
- Unnecessary database queries or N+1 problems
- Memory leaks or excessive memory usage
- Inefficient rendering or re-renders
Return a JSON object with: { summary, issues: [{title, description, severity, file, line}], recommendations: [{title, description}], overallSeverity }`,

      quality: `You are a code quality reviewer. Analyze the code for:
- Naming conventions and readability
- Code structure and organization
- Duplicated or dead code
- Missing error handling
- Maintainability and testability
Return a JSON object with: { summary, issues: [{title, description, severity, file, line}], recommendations: [{title, description}], overallSeverity }`,

      documentation: `You are a documentation generator. Analyze the codebase and generate:
- README with project overview, setup instructions, and usage
- API documentation for all endpoints
- Key architectural decisions
Return a JSON object with: { summary, issues: [], recommendations: [{title, description}], overallSeverity: "low", readme, apiDocs }`,

      techdebt: `You are a technical debt analyzer. Analyze the code for:
- Outdated patterns or deprecated APIs
- Missing tests or test coverage gaps
- Complex or hard-to-maintain code
- Inconsistent coding styles
- TODO/FIXME comments that need addressing
Categorize each item as High/Medium/Low priority.
Return a JSON object with: { summary, issues: [{title, description, severity, file, line, priority}], recommendations: [{title, description}], overallSeverity }`,
    };

    return prompts[template] || prompts.quality;
  }

  async create(userId: string, dto: CreateReviewDto) {
    const { client, provider } = await this.aiProvider.getProviderWithClient(userId, dto.providerId);

    let files;
    if (dto.fileId) {
      files = await this.filesService.getFilesContent(dto.projectId, [dto.fileId]);
    } else if (dto.fileIds?.length) {
      files = await this.filesService.getFilesContent(dto.projectId, dto.fileIds);
    } else {
      files = await this.filesService.getFilesContent(dto.projectId);
    }

    if (!files.length) throw new NotFoundException('No files found to review');

    const codeContext = files
      .map(f => `// File: ${f.path}\n${f.content}`)
      .join('\n\n---\n\n');

    const systemPrompt = this.getSystemPrompt(dto.template);

    const response = await client.chat.completions.create({
      model: provider.modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Review this code:\n\n${codeContext}` },
      ],
      temperature: 0.3,
    });

    const rawOutput = response.choices[0].message.content || '';

    let parsed;
    try {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawOutput);
    } catch {
      parsed = {
        summary: rawOutput,
        issues: [],
        recommendations: [],
        overallSeverity: 'medium',
      };
    }

    const review = await this.prisma.review.create({
      data: {
        title: `${dto.template} review — ${new Date().toLocaleDateString()}`,
        template: dto.template,
        summary: parsed.summary || '',
        issues: parsed.issues || [],
        recommendations: parsed.recommendations || [],
        severity: parsed.overallSeverity || 'medium',
        rawOutput,
        userId,
        projectId: dto.projectId,
        fileId: dto.fileId || null,
      },
    });

    return review;
  }

  async findAll(userId: string, dto: SearchReviewDto) {
    const where: any = { userId };
    if (dto.projectId) where.projectId = dto.projectId;
    if (dto.template) where.template = dto.template;
    if (dto.query) {
      where.OR = [
        { title: { contains: dto.query, mode: 'insensitive' } },
        { summary: { contains: dto.query, mode: 'insensitive' } },
      ];
    }
    return this.prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { project: { select: { name: true } } },
    });
  }

  async findOne(userId: string, id: string) {
    const review = await this.prisma.review.findFirst({
      where: { id, userId },
      include: { project: { select: { name: true } }, file: { select: { name: true, path: true } } },
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.review.delete({ where: { id } });
  }
}
