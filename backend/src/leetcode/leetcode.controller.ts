import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LeetcodeService } from './leetcode.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { LeetcodeDifficulty, LeetcodeStatus } from './leetcode-entry.entity';

@Controller('leetcode')
export class LeetcodeController {
  constructor(private readonly leetcodeService: LeetcodeService) {}

  @Post()
  create(@Body() dto: CreateEntryDto) {
    return this.leetcodeService.create(dto);
  }

  @Get()
  findAll(
    @Query('status') status?: LeetcodeStatus,
    @Query('difficulty') difficulty?: LeetcodeDifficulty,
    @Query('topic') topic?: string,
  ) {
    return this.leetcodeService.findAll({ status, difficulty, topic });
  }

  @Get('stats')
  stats() {
    return this.leetcodeService.stats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leetcodeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEntryDto) {
    return this.leetcodeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leetcodeService.remove(id);
  }
}
