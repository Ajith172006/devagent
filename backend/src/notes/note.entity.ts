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

@Entity('notes')
export class Note {
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
  content: string;

  @Column('simple-array', { default: '' })
  tags: string[];

  @Column({ default: false })
  pinned: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
