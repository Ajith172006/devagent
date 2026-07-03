import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Snippet } from './snippet.entity';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';

@Injectable()
export class SnippetsService {
  constructor(
    @InjectRepository(Snippet)
    private readonly repo: Repository<Snippet>,
  ) {}

  create(dto: CreateSnippetDto): Promise<Snippet> {
    const snippet = this.repo.create({
      ...dto,
      tags: dto.tags ?? [],
      description: dto.description ?? null,
    });
    return this.repo.save(snippet);
  }

  async findAll(params: { language?: string; tag?: string; search?: string }): Promise<Snippet[]> {
    const all = await this.repo.find({ order: { updatedAt: 'DESC' } });
    return all.filter((s) => {
      if (params.language && s.language.toLowerCase() !== params.language.toLowerCase()) {
        return false;
      }
      if (params.tag && !s.tags.map((t) => t.toLowerCase()).includes(params.tag.toLowerCase())) {
        return false;
      }
      if (params.search) {
        const needle = params.search.toLowerCase();
        const haystack = `${s.title} ${s.code} ${s.description ?? ''}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }

  async findOne(id: string): Promise<Snippet> {
    const snippet = await this.repo.findOne({ where: { id } });
    if (!snippet) throw new NotFoundException(`Snippet ${id} not found`);
    return snippet;
  }

  async update(id: string, dto: UpdateSnippetDto): Promise<Snippet> {
    const snippet = await this.findOne(id);
    Object.assign(snippet, dto);
    return this.repo.save(snippet);
  }

  async remove(id: string): Promise<void> {
    const snippet = await this.findOne(id);
    await this.repo.remove(snippet);
  }
}
