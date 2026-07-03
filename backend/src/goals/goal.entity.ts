import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ default: '' })
  userId: string;

  // ISO date string, e.g. "2026-07-02" — one goal entry per calendar day per user
  @Column()
  date: string;

  @Column()
  targetMinutes: number;

  @Column({ default: 0 })
  minutesLogged: number;

  @Column('text', { nullable: true })
  focus: string | null;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
