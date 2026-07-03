import {
  Body, Controller, Delete, Get, Headers,
  Param, Patch, Post, Query, UnauthorizedException,
} from '@nestjs/common';
import { SnippetsService } from './snippets.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';

@Controller('snippets')
export class SnippetsController {
  constructor(private readonly snippetsService: SnippetsService) {}

  private uid(h: string): string {
    if (!h) throw new UnauthorizedException('x-user-id header is required');
    return h;
  }

  @Post()
  create(@Headers('x-user-id') uid: string, @Body() dto: CreateSnippetDto) {
    return this.snippetsService.create(this.uid(uid), dto);
  }

  @Get()
  findAll(
    @Headers('x-user-id') uid: string,
    @Query('language') language?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ) {
    return this.snippetsService.findAll(this.uid(uid), { language, tag, search });
  }

  @Get(':id')
  findOne(@Headers('x-user-id') uid: string, @Param('id') id: string) {
    return this.snippetsService.findOne(this.uid(uid), id);
  }

  @Patch(':id')
  update(@Headers('x-user-id') uid: string, @Param('id') id: string, @Body() dto: UpdateSnippetDto) {
    return this.snippetsService.update(this.uid(uid), id, dto);
  }

  @Delete(':id')
  remove(@Headers('x-user-id') uid: string, @Param('id') id: string) {
    return this.snippetsService.remove(this.uid(uid), id);
  }
}
