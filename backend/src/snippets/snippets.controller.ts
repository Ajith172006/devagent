import {
  Body, Controller, Delete, Get,
  Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { SnippetsService } from './snippets.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('snippets')
@UseGuards(FirebaseAuthGuard)
export class SnippetsController {
  constructor(private readonly snippetsService: SnippetsService) {}

  @Post()
  create(@CurrentUser() uid: string, @Body() dto: CreateSnippetDto) {
    return this.snippetsService.create(uid, dto);
  }

  @Get()
  findAll(
    @CurrentUser() uid: string,
    @Query('language') language?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.snippetsService.findAll(uid, { language, tag, search, page: pageNum, limit: limitNum });
  }

  @Get(':id')
  findOne(@CurrentUser() uid: string, @Param('id') id: string) {
    return this.snippetsService.findOne(uid, id);
  }

  @Patch(':id')
  update(@CurrentUser() uid: string, @Param('id') id: string, @Body() dto: UpdateSnippetDto) {
    return this.snippetsService.update(uid, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() uid: string, @Param('id') id: string) {
    return this.snippetsService.remove(uid, id);
  }
}
