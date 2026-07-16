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

  create(userId: string, dto: CreateNoteDto): Promise<Note> {
    const note = this.repo.create({
      ...dto,
      userId,
      tags: dto.tags ?? [],
      pinned: dto.pinned ?? false,
    });
    return this.repo.save(note);
  }

  async findAll(
    userId: string,
    params: { search?: string; page?: number; limit?: number } = {},
  ): Promise<Note[]> {
    const all = await this.repo.find({
      where: { userId },
      order: { pinned: 'DESC', updatedAt: 'DESC' },
    });
    let filtered = all;
    if (params.search) {
      const needle = params.search.toLowerCase();
      filtered = all.filter((n) => `${n.title} ${n.content}`.toLowerCase().includes(needle));
    }

    if (params.page && params.limit) {
      const start = (params.page - 1) * params.limit;
      return filtered.slice(start, start + params.limit);
    }
    return filtered;
  }

  /** Admin: find all without userId filter */
  findAllAdmin(): Promise<Note[]> {
    return this.repo.find({ order: { updatedAt: 'DESC' } });
  }

  async findOne(userId: string, id: string): Promise<Note> {
    const note = await this.repo.findOne({ where: { id, userId } });
    if (!note) throw new NotFoundException(`Note ${id} not found`);
    return note;
  }

  async update(userId: string, id: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(userId, id);
    Object.assign(note, dto);
    return this.repo.save(note);
  }

  async remove(userId: string, id: string): Promise<void> {
    const note = await this.findOne(userId, id);
    await this.repo.remove(note);
  }

  /** Admin: remove by id only */
  async adminRemove(id: string): Promise<void> {
    const note = await this.repo.findOne({ where: { id } });
    if (!note) throw new NotFoundException(`Note ${id} not found`);
    await this.repo.remove(note);
  }
}
