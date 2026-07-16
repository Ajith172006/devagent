import {
  Body, Controller, Delete, Get,
  Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('notes')
@UseGuards(FirebaseAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@CurrentUser() uid: string, @Body() dto: CreateNoteDto) {
    return this.notesService.create(uid, dto);
  }

  @Get()
  findAll(
    @CurrentUser() uid: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.notesService.findAll(uid, { search, page: pageNum, limit: limitNum });
  }

  @Get(':id')
  findOne(@CurrentUser() uid: string, @Param('id') id: string) {
    return this.notesService.findOne(uid, id);
  }

  @Patch(':id')
  update(@CurrentUser() uid: string, @Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.update(uid, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() uid: string, @Param('id') id: string) {
    return this.notesService.remove(uid, id);
  }
}
