import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeetcodeEntry, LeetcodeDifficulty, LeetcodeStatus } from './leetcode-entry.entity';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';

@Injectable()
export class LeetcodeService {
  constructor(
    @InjectRepository(LeetcodeEntry)
    private readonly repo: Repository<LeetcodeEntry>,
  ) {}

  create(dto: CreateEntryDto): Promise<LeetcodeEntry> {
    const entry = this.repo.create({
      ...dto,
      url: dto.url ?? null,
      status: dto.status ?? LeetcodeStatus.ATTEMPTED,
      topics: dto.topics ?? [],
      notes: dto.notes ?? null,
      solvedAt:
        dto.status === LeetcodeStatus.SOLVED
          ? new Date().toISOString().slice(0, 10)
          : null,
    });
    return this.repo.save(entry);
  }

  async findAll(params: { status?: LeetcodeStatus; difficulty?: LeetcodeDifficulty; topic?: string }) {
    const all = await this.repo.find({ order: { updatedAt: 'DESC' } });
    return all.filter((e) => {
      if (params.status && e.status !== params.status) return false;
      if (params.difficulty && e.difficulty !== params.difficulty) return false;
      if (
        params.topic &&
        !e.topics.map((t) => t.toLowerCase()).includes(params.topic.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }

  async findOne(id: string): Promise<LeetcodeEntry> {
    const entry = await this.repo.findOne({ where: { id } });
    if (!entry) throw new NotFoundException(`LeetCode entry ${id} not found`);
    return entry;
  }

  async update(id: string, dto: UpdateEntryDto): Promise<LeetcodeEntry> {
    const entry = await this.findOne(id);
    const wasSolved = entry.status === LeetcodeStatus.SOLVED;
    Object.assign(entry, dto);
    if (!wasSolved && entry.status === LeetcodeStatus.SOLVED && !entry.solvedAt) {
      entry.solvedAt = new Date().toISOString().slice(0, 10);
    }
    return this.repo.save(entry);
  }

  async remove(id: string): Promise<void> {
    const entry = await this.findOne(id);
    await this.repo.remove(entry);
  }

  async stats() {
    const all = await this.repo.find();
    const solved = all.filter((e) => e.status === LeetcodeStatus.SOLVED);

    const byDifficulty = (difficulty: LeetcodeDifficulty) => ({
      solved: solved.filter((e) => e.difficulty === difficulty).length,
      attempted: all.filter((e) => e.difficulty === difficulty).length,
    });

    const topicCounts: Record<string, number> = {};
    for (const e of solved) {
      for (const t of e.topics) {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      }
    }

    return {
      totalProblems: all.length,
      totalSolved: solved.length,
      easy: byDifficulty(LeetcodeDifficulty.EASY),
      medium: byDifficulty(LeetcodeDifficulty.MEDIUM),
      hard: byDifficulty(LeetcodeDifficulty.HARD),
      topTopics: Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([topic, count]) => ({ topic, count })),
    };
  }
}
