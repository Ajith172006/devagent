import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
  date: string;

  @IsInt()
  @Min(1)
  targetMinutes: number;

  @IsOptional()
  @IsString()
  focus?: string;
}
