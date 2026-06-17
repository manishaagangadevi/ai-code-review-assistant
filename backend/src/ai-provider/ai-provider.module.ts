import { Module } from '@nestjs/common';
import { AiProviderService } from './ai-provider.service';
import { AiProviderController } from './ai-provider.controller';

@Module({
  providers: [AiProviderService],
  controllers: [AiProviderController]
})
export class AiProviderModule {}
