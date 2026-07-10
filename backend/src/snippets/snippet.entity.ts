import { ObjectId } from 'mongodb';
import { v4 as uuid } from 'uuid';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('snippets')
export class Snippet {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  id: string = uuid();

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
