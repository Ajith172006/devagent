import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { LogProgressDto } from './dto/log-progress.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly repo: Repository<Goal>,
  ) {}

  async setGoal(dto: CreateGoalDto): Promise<Goal> {
    let goal = await this.repo.findOne({ where: { date: dto.date } });
    if (goal) {
      goal.targetMinutes = dto.targetMinutes;
      goal.focus = dto.focus ?? goal.focus;
      goal.completed = goal.minutesLogged >= goal.targetMinutes;
      return this.repo.save(goal);
    }
    goal = this.repo.create({
      date: dto.date,
      targetMinutes: dto.targetMinutes,
      focus: dto.focus ?? null,
      minutesLogged: 0,
      completed: false,
    });
    return this.repo.save(goal);
  }

  findAll(): Promise<Goal[]> {
    return this.repo.find({ order: { date: 'DESC' } });
  }

  async findByDate(date: string): Promise<Goal> {
    const goal = await this.repo.findOne({ where: { date } });
    if (!goal) throw new NotFoundException(`No goal set for ${date}`);
    return goal;
  }

  async logProgress(date: string, dto: LogProgressDto): Promise<Goal> {
    const goal = await this.findByDate(date);
    goal.minutesLogged += dto.minutes;
    goal.completed = goal.minutesLogged >= goal.targetMinutes;
    return this.repo.save(goal);
  }

  async remove(date: string): Promise<void> {
    const goal = await this.findByDate(date);
    await this.repo.remove(goal);
  }

  /**
   * Current streak = consecutive completed days counting back from the
   * most recent completed day (today or earlier). Breaks on the first
   * gap or incomplete day.
   */
  async getStreak(): Promise<{ currentStreak: number; longestStreak: number; totalCompletedDays: number }> {
    const goals = await this.repo.find({ order: { date: 'ASC' } });
    const completedDates = goals.filter((g) => g.completed).map((g) => g.date).sort();

    if (completedDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalCompletedDays: 0 };
    }

    const toDay = (d: string) => Math.floor(new Date(d + 'T00:00:00Z').getTime() / 86400000);

    let longest = 1;
    let running = 1;
    for (let i = 1; i < completedDates.length; i++) {
      const diff = toDay(completedDates[i]) - toDay(completedDates[i - 1]);
      running = diff === 1 ? running + 1 : 1;
      longest = Math.max(longest, running);
    }

    // current streak: walk backwards from the last completed date, requiring
    // that it be today or yesterday to still be "live", then count consecutive days back
    const today = toDay(new Date().toISOString().slice(0, 10));
    const lastCompletedDay = toDay(completedDates[completedDates.length - 1]);
    let current = 0;
    if (today - lastCompletedDay <= 1) {
      current = 1;
      for (let i = completedDates.length - 1; i > 0; i--) {
        const diff = toDay(completedDates[i]) - toDay(completedDates[i - 1]);
        if (diff === 1) current++;
        else break;
      }
    }

    return {
      currentStreak: current,
      longestStreak: longest,
      totalCompletedDays: completedDates.length,
    };
  }
}
