import {
  Body, Controller, Delete, Get, Headers,
  Param, Post, Put, UnauthorizedException,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { LogProgressDto } from './dto/log-progress.dto';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  private uid(h: string): string {
    if (!h) throw new UnauthorizedException('x-user-id header is required');
    return h;
  }

  @Post()
  setGoal(@Headers('x-user-id') uid: string, @Body() dto: CreateGoalDto) {
    return this.goalsService.setGoal(this.uid(uid), dto);
  }

  @Get()
  findAll(@Headers('x-user-id') uid: string) {
    return this.goalsService.findAll(this.uid(uid));
  }

  @Get('streak')
  getStreak(@Headers('x-user-id') uid: string) {
    return this.goalsService.getStreak(this.uid(uid));
  }

  @Get(':date')
  findByDate(@Headers('x-user-id') uid: string, @Param('date') date: string) {
    return this.goalsService.findByDate(this.uid(uid), date);
  }

  @Put(':date/progress')
  logProgress(@Headers('x-user-id') uid: string, @Param('date') date: string, @Body() dto: LogProgressDto) {
    return this.goalsService.logProgress(this.uid(uid), date, dto);
  }

  @Delete(':date')
  remove(@Headers('x-user-id') uid: string, @Param('date') date: string) {
    return this.goalsService.remove(this.uid(uid), date);
  }
}
