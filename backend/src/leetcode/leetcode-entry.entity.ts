import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LeetcodeDifficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export enum LeetcodeStatus {
  ATTEMPTED = 'Attempted',
  SOLVED = 'Solved',
  REVIEW = 'Review',
}

@Entity('leetcode_entries')
export class LeetcodeEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ default: '' })
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  url: string | null;

  @Column({ type: 'simple-enum', enum: LeetcodeDifficulty })
  difficulty: LeetcodeDifficulty;

  @Column({ type: 'simple-enum', enum: LeetcodeStatus, default: LeetcodeStatus.ATTEMPTED })
  status: LeetcodeStatus;

  @Column('simple-array', { default: '' })
  topics: string[];

  @Column('text', { nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true })
  solvedAt: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
