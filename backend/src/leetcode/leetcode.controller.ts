import {
  Body, Controller, Delete, Get,
  Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { LeetcodeService } from './leetcode.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { LeetcodeDifficulty, LeetcodeStatus } from './leetcode-entry.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('leetcode')
@UseGuards(FirebaseAuthGuard)
export class LeetcodeController {
  constructor(private readonly leetcodeService: LeetcodeService) {}

  @Post()
  create(@CurrentUser() uid: string, @Body() dto: CreateEntryDto) {
    return this.leetcodeService.create(uid, dto);
  }

  @Get()
  findAll(
    @CurrentUser() uid: string,
    @Query('status') status?: LeetcodeStatus,
    @Query('difficulty') difficulty?: LeetcodeDifficulty,
    @Query('topic') topic?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.leetcodeService.findAll(uid, {
      status,
      difficulty,
      topic,
      page: pageNum,
      limit: limitNum,
    });
  }

  @Get('stats')
  stats(@CurrentUser() uid: string) {
    return this.leetcodeService.stats(uid);
  }

  @Get(':id')
  findOne(@CurrentUser() uid: string, @Param('id') id: string) {
    return this.leetcodeService.findOne(uid, id);
  }

  @Patch(':id')
  update(@CurrentUser() uid: string, @Param('id') id: string, @Body() dto: UpdateEntryDto) {
    return this.leetcodeService.update(uid, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() uid: string, @Param('id') id: string) {
    return this.leetcodeService.remove(uid, id);
  }
}
