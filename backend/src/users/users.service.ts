import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpsertUserDto } from './dto/upsert-user.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly aiService: AiService,
  ) {}

  /** Create or update a user record keyed by Firebase UID */
  async upsert(uid: string, dto: UpsertUserDto): Promise<User> {
    let user = await this.repo.findOne({ where: { id: uid } });
    
    let resumeAnalysis: string | null = user?.resumeAnalysis ?? null;
    
    if (dto.resumeText && (dto.forceAnalyze || !user || user.resumeText !== dto.resumeText || !user.resumeAnalysis)) {
      try {
        resumeAnalysis = await this.aiService.analyzeResume(dto.resumeText);
      } catch (err) {
        console.error('Error analyzing resume with AI:', err);
        throw new InternalServerErrorException(`Failed to analyze resume with AI: ${err.message}`);
      }
    } else if (dto.resumeText === '') {
      resumeAnalysis = null;
    }

    if (user) {
      // Copy only defined properties to avoid overwriting existing columns with undefined
      for (const [key, val] of Object.entries(dto)) {
        if (val !== undefined) {
          (user as any)[key] = val;
        }
      }
      user.resumeAnalysis = resumeAnalysis;
      return this.repo.save(user);
    }

    user = this.repo.create({ 
      id: uid, 
      ...dto, 
      email: dto.email ?? null, 
      photoUrl: dto.photoUrl ?? null,
      resumeText: dto.resumeText ?? null,
      resumeAnalysis
    });
    return this.repo.save(user);
  }

  async findOne(uid: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id: uid } });
    if (!user) throw new NotFoundException(`User ${uid} not found`);
    return user;
  }

  findAll(): Promise<User[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async remove(uid: string): Promise<void> {
    const user = await this.findOne(uid);
    await this.repo.remove(user);
  }
}
