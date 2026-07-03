import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly repo: Repository<Note>,
  ) {}

  create(dto: CreateNoteDto): Promise<Note> {
    const note = this.repo.create({
      ...dto,
      tags: dto.tags ?? [],
      pinned: dto.pinned ?? false,
    });
    return this.repo.save(note);
  }

  async findAll(search?: string): Promise<Note[]> {
    const all = await this.repo.find({
      order: { pinned: 'DESC', updatedAt: 'DESC' },
    });
    if (!search) return all;
    const needle = search.toLowerCase();
    return all.filter((n) =>
      `${n.title} ${n.content}`.toLowerCase().includes(needle),
    );
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.repo.findOne({ where: { id } });
    if (!note) throw new NotFoundException(`Note ${id} not found`);
    return note;
  }

  async update(id: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(id);
    Object.assign(note, dto);
    return this.repo.save(note);
  }

  async remove(id: string): Promise<void> {
    const note = await this.findOne(id);
    await this.repo.remove(note);
  }
}
