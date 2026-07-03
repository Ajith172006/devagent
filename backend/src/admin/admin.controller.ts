import {
  Controller, Delete, Get, Param,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { SnippetsService } from '../snippets/snippets.service';
import { NotesService } from '../notes/notes.service';
import { GoalsService } from '../goals/goals.service';
import { LeetcodeService } from '../leetcode/leetcode.service';
import { UsersService } from '../users/users.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly snippets: SnippetsService,
    private readonly notes: NotesService,
    private readonly goals: GoalsService,
    private readonly leetcode: LeetcodeService,
    private readonly users: UsersService,
  ) {}

  // ── Overview ──────────────────────────────────────────────────────────────
  @Get('overview')
  async overview() {
    const [userList, snippetList, noteList, goalList, leetcodeList] = await Promise.all([
      this.users.findAll(),
      this.snippets.findAllAdmin(),
      this.notes.findAllAdmin(),
      this.goals.findAllAdmin(),
      this.leetcode.findAllAdmin(),
    ]);
    return {
      counts: {
        users: userList.length,
        snippets: snippetList.length,
        notes: noteList.length,
        goals: goalList.length,
        leetcode: leetcodeList.length,
      },
    };
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  @Get('users')
  getAllUsers() {
    return this.users.findAll();
  }

  @Get('users/:uid')
  getUser(@Param('uid') uid: string) {
    return this.users.findOne(uid);
  }

  /** Per-user data summary for the Users panel */
  @Get('users/:uid/data')
  async getUserData(@Param('uid') uid: string) {
    const [snippetList, noteList, goalList, leetcodeList, streak] = await Promise.all([
      this.snippets.findAll(uid, {}),
      this.notes.findAll(uid),
      this.goals.findAll(uid),
      this.leetcode.findAll(uid, {}),
      this.goals.getStreak(uid),
    ]);
    return {
      snippets: snippetList,
      notes: noteList,
      goals: goalList,
      leetcode: leetcodeList,
      streak,
      counts: {
        snippets: snippetList.length,
        notes: noteList.length,
        goals: goalList.length,
        leetcode: leetcodeList.length,
      },
    };
  }

  @Delete('users/:uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('uid') uid: string) {
    // Delete all user data first
    const [s, n, g, l] = await Promise.all([
      this.snippets.findAll(uid, {}),
      this.notes.findAll(uid),
      this.goals.findAll(uid),
      this.leetcode.findAll(uid, {}),
    ]);
    await Promise.all([
      ...s.map(x => this.snippets.adminRemove(x.id)),
      ...n.map(x => this.notes.adminRemove(x.id)),
      ...g.map(x => this.goals.adminRemove(x.id)),
      ...l.map(x => this.leetcode.adminRemove(x.id)),
    ]);
    await this.users.remove(uid);
  }

  // ── Snippets ──────────────────────────────────────────────────────────────
  @Get('snippets')
  getAllSnippets() { return this.snippets.findAllAdmin(); }

  @Delete('snippets/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSnippet(@Param('id') id: string) { return this.snippets.adminRemove(id); }

  @Delete('snippets')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllSnippets() {
    const all = await this.snippets.findAllAdmin();
    await Promise.all(all.map(s => this.snippets.adminRemove(s.id)));
  }

  // ── Notes ─────────────────────────────────────────────────────────────────
  @Get('notes')
  getAllNotes() { return this.notes.findAllAdmin(); }

  @Delete('notes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteNote(@Param('id') id: string) { return this.notes.adminRemove(id); }

  @Delete('notes')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllNotes() {
    const all = await this.notes.findAllAdmin();
    await Promise.all(all.map(n => this.notes.adminRemove(n.id)));
  }

  // ── Goals ─────────────────────────────────────────────────────────────────
  @Get('goals')
  getAllGoals() { return this.goals.findAllAdmin(); }

  @Delete('goals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteGoal(@Param('id') id: string) { return this.goals.adminRemove(id); }

  @Delete('goals')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllGoals() {
    const all = await this.goals.findAllAdmin();
    await Promise.all(all.map(g => this.goals.adminRemove(g.id)));
  }

  // ── LeetCode ──────────────────────────────────────────────────────────────
  @Get('leetcode')
  getAllLeetcode() { return this.leetcode.findAllAdmin(); }

  @Delete('leetcode/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLeetcode(@Param('id') id: string) { return this.leetcode.adminRemove(id); }

  @Delete('leetcode')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllLeetcode() {
    const all = await this.leetcode.findAllAdmin();
    await Promise.all(all.map(e => this.leetcode.adminRemove(e.id)));
  }
}
