import { IsOptional, IsString, MinLength } from 'class-validator';

export class DebugCodeDto {
  @IsString()
  @MinLength(1)
  code: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsString()
  context?: string;
}
