import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { LogProgressDto } from './dto/log-progress.dto';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  setGoal(@Body() dto: CreateGoalDto) {
    return this.goalsService.setGoal(dto);
  }

  @Get()
  findAll() {
    return this.goalsService.findAll();
  }

  @Get('streak')
  getStreak() {
    return this.goalsService.getStreak();
  }

  @Get(':date')
  findByDate(@Param('date') date: string) {
    return this.goalsService.findByDate(date);
  }

  @Put(':date/progress')
  logProgress(@Param('date') date: string, @Body() dto: LogProgressDto) {
    return this.goalsService.logProgress(date, dto);
  }

  @Delete(':date')
  remove(@Param('date') date: string) {
    return this.goalsService.remove(date);
  }
}
