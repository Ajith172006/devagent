import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpsertUserDto } from './dto/upsert-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  /** Create or update a user record keyed by Firebase UID */
  async upsert(uid: string, dto: UpsertUserDto): Promise<User> {
    let user = await this.repo.findOne({ where: { id: uid } });
    if (user) {
      Object.assign(user, dto);
      return this.repo.save(user);
    }
    user = this.repo.create({ id: uid, ...dto, email: dto.email ?? null, photoUrl: dto.photoUrl ?? null });
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
