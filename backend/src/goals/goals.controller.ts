import {
  Body, Controller, Delete, Get,
  Param, Post, Put, UseGuards,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { LogProgressDto } from './dto/log-progress.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('goals')
@UseGuards(FirebaseAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  setGoal(@CurrentUser() uid: string, @Body() dto: CreateGoalDto) {
    return this.goalsService.setGoal(uid, dto);
  }

  @Get()
  findAll(@CurrentUser() uid: string) {
    return this.goalsService.findAll(uid);
  }

  @Get('streak')
  getStreak(@CurrentUser() uid: string) {
    return this.goalsService.getStreak(uid);
  }

  @Get(':date')
  findByDate(@CurrentUser() uid: string, @Param('date') date: string) {
    return this.goalsService.findByDate(uid, date);
  }

  @Put(':date/progress')
  logProgress(@CurrentUser() uid: string, @Param('date') date: string, @Body() dto: LogProgressDto) {
    return this.goalsService.logProgress(uid, date, dto);
  }

  @Delete(':date')
  remove(@CurrentUser() uid: string, @Param('date') date: string) {
    return this.goalsService.remove(uid, date);
  }
}
