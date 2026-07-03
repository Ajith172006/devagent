import { IsArray, IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { LeetcodeDifficulty, LeetcodeStatus } from '../leetcode-entry.entity';

export class CreateEntryDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsEnum(LeetcodeDifficulty)
  difficulty: LeetcodeDifficulty;

  @IsOptional()
  @IsEnum(LeetcodeStatus)
  status?: LeetcodeStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
