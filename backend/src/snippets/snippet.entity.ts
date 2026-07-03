import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('snippets')
export class Snippet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ default: '' })
  userId: string;

  @Column()
  title: string;

  @Column('text')
  code: string;

  @Column()
  language: string;

  @Column('simple-array', { default: '' })
  tags: string[];

  @Column('text', { nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
