import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class ExplainCodeDto {
  @IsString()
  @MinLength(1)
  code: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'expert'])
  level?: 'beginner' | 'intermediate' | 'expert';
}
