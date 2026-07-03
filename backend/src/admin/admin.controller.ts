import {
  Controller,
  Delete,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { SnippetsService } from '../snippets/snippets.service';
import { NotesService } from '../notes/notes.service';
import { GoalsService } from '../goals/goals.service';
import { LeetcodeService } from '../leetcode/leetcode.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly snippets: SnippetsService,
    private readonly notes: NotesService,
    private readonly goals: GoalsService,
    private readonly leetcode: LeetcodeService,
  ) {}

  // ── Overview ────────────────────────────────────────────────────────────────

  @Get('overview')
  async overview() {
    const [snippetList, noteList, goalList, leetcodeList, streak, leetcodeStats] =
      await Promise.all([
        this.snippets.findAll({}),
        this.notes.findAll(),
        this.goals.findAll(),
        this.leetcode.findAll({}),
        this.goals.getStreak(),
        this.leetcode.stats(),
      ]);

    return {
      counts: {
        snippets: snippetList.length,
        notes: noteList.length,
        goals: goalList.length,
        leetcode: leetcodeList.length,
      },
      streak,
      leetcodeStats,
    };
  }

  // ── Snippets ─────────────────────────────────────────────────────────────────

  @Get('snippets')
  getAllSnippets() {
    return this.snippets.findAll({});
  }

  @Delete('snippets/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSnippet(@Param('id') id: string) {
    return this.snippets.remove(id);
  }

  @Delete('snippets')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllSnippets() {
    const all = await this.snippets.findAll({});
    await Promise.all(all.map((s) => this.snippets.remove(s.id)));
  }

  // ── Notes ────────────────────────────────────────────────────────────────────

  @Get('notes')
  getAllNotes() {
    return this.notes.findAll();
  }

  @Delete('notes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteNote(@Param('id') id: string) {
    return this.notes.remove(id);
  }

  @Delete('notes')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllNotes() {
    const all = await this.notes.findAll();
    await Promise.all(all.map((n) => this.notes.remove(n.id)));
  }

  // ── Goals ────────────────────────────────────────────────────────────────────

  @Get('goals')
  getAllGoals() {
    return this.goals.findAll();
  }

  @Delete('goals/:date')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteGoal(@Param('date') date: string) {
    return this.goals.remove(date);
  }

  @Delete('goals')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllGoals() {
    const all = await this.goals.findAll();
    await Promise.all(all.map((g) => this.goals.remove(g.date)));
  }

  // ── LeetCode ─────────────────────────────────────────────────────────────────

  @Get('leetcode')
  getAllLeetcode() {
    return this.leetcode.findAll({});
  }

  @Delete('leetcode/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLeetcode(@Param('id') id: string) {
    return this.leetcode.remove(id);
  }

  @Delete('leetcode')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllLeetcode() {
    const all = await this.leetcode.findAll({});
    await Promise.all(all.map((e) => this.leetcode.remove(e.id)));
  }
}
