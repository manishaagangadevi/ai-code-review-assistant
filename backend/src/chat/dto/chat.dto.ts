import { IsString, IsOptional } from 'class-validator';

export class CreateChatSessionDto {
  @IsString()
  projectId: string;
}

export class SendMessageDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  providerId?: string;
}