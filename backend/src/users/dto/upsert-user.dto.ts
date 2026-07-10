import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpsertUserDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  profession: string;

  @IsString()
  age: string;

  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  resumeText?: string;

  @IsOptional()
  @IsString()
  resumeAnalysis?: string;

  @IsOptional()
  @IsBoolean()
  forceAnalyze?: boolean;
}
