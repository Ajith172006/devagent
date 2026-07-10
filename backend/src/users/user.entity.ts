import { ObjectId } from 'mongodb';
import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  /** Firebase UID — used as the primary key */
  @Column()
  id: string;

  @Column()
  name: string;

  @Column()
  profession: string;

  @Column()
  age: string;

  @Column()
  gender: string;

  @Column({ type: 'text', nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  photoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  resumeText: string | null;

  @Column({ type: 'text', nullable: true })
  resumeAnalysis: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
