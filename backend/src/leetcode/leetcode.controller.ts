import {
  Body, Controller, Delete, Get, Headers,
  Param, Patch, Post, Query, UnauthorizedException,
} from '@nestjs/common';
import { LeetcodeService } from './leetcode.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { LeetcodeDifficulty, LeetcodeStatus } from './leetcode-entry.entity';

@Controller('leetcode')
export class LeetcodeController {
  constructor(private readonly leetcodeService: LeetcodeService) {}

  private uid(h: string): string {
    if (!h) throw new UnauthorizedException('x-user-id header is required');
    return h;
  }

  @Post()
  create(@Headers('x-user-id') uid: string, @Body() dto: CreateEntryDto) {
    return this.leetcodeService.create(this.uid(uid), dto);
  }

  @Get()
  findAll(
    @Headers('x-user-id') uid: string,
    @Query('status') status?: LeetcodeStatus,
    @Query('difficulty') difficulty?: LeetcodeDifficulty,
    @Query('topic') topic?: string,
  ) {
    return this.leetcodeService.findAll(this.uid(uid), { status, difficulty, topic });
  }

  @Get('stats')
  stats(@Headers('x-user-id') uid: string) {
    return this.leetcodeService.stats(this.uid(uid));
  }

  @Get(':id')
  findOne(@Headers('x-user-id') uid: string, @Param('id') id: string) {
    return this.leetcodeService.findOne(this.uid(uid), id);
  }

  @Patch(':id')
  update(@Headers('x-user-id') uid: string, @Param('id') id: string, @Body() dto: UpdateEntryDto) {
    return this.leetcodeService.update(this.uid(uid), id, dto);
  }

  @Delete(':id')
  remove(@Headers('x-user-id') uid: string, @Param('id') id: string) {
    return this.leetcodeService.remove(this.uid(uid), id);
  }
}
