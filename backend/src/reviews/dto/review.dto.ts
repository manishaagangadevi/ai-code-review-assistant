import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  fileId?: string;

  @IsOptional()
  @IsArray()
  fileIds?: string[];

  @IsString()
  template: string;

  @IsOptional()
  @IsString()
  providerId?: string;
}

export class SearchReviewDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  template?: string;
}