import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { FilesModule } from './files/files.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AiProviderModule } from './ai-provider/ai-provider.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [PrismaModule, AuthModule, ProjectsModule, FilesModule, ReviewsModule, AiProviderModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
