import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AiProviderModule } from '../ai-provider/ai-provider.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [AiProviderModule, FilesModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}