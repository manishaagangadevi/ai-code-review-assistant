import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateAiProviderDto {
  @IsString()
  name: string;

  @IsString()
  baseUrl: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsString()
  modelName: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAiProviderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  modelName?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}