import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSnippetDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  code: string;

  @IsString()
  language: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}
