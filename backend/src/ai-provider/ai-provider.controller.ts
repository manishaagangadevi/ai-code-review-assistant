import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AiProviderService } from './ai-provider.service';
import { CreateAiProviderDto, UpdateAiProviderDto } from './dto/ai-provider.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ai-providers')
export class AiProviderController {
  constructor(private aiProviderService: AiProviderService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateAiProviderDto) {
    return this.aiProviderService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.aiProviderService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.aiProviderService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateAiProviderDto) {
    return this.aiProviderService.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.aiProviderService.remove(req.user.sub, id);
  }
}