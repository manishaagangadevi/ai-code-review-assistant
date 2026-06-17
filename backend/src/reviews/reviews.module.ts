import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { AiProviderModule } from '../ai-provider/ai-provider.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [AiProviderModule, FilesModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}