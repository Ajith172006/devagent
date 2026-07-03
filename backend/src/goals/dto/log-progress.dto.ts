import { IsInt, Min } from 'class-validator';

export class LogProgressDto {
  @IsInt()
  @Min(1)
  minutes: number;
}
