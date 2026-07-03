import {
  Body, Controller, Delete, Get, Headers,
  Param, Patch, Post, Query, UnauthorizedException,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  private uid(h: string): string {
    if (!h) throw new UnauthorizedException('x-user-id header is required');
    return h;
  }

  @Post()
  create(@Headers('x-user-id') uid: string, @Body() dto: CreateNoteDto) {
    return this.notesService.create(this.uid(uid), dto);
  }

  @Get()
  findAll(@Headers('x-user-id') uid: string, @Query('search') search?: string) {
    return this.notesService.findAll(this.uid(uid), search);
  }

  @Get(':id')
  findOne(@Headers('x-user-id') uid: string, @Param('id') id: string) {
    return this.notesService.findOne(this.uid(uid), id);
  }

  @Patch(':id')
  update(@Headers('x-user-id') uid: string, @Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.update(this.uid(uid), id, dto);
  }

  @Delete(':id')
  remove(@Headers('x-user-id') uid: string, @Param('id') id: string) {
    return this.notesService.remove(this.uid(uid), id);
  }
}
