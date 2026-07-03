import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  /** Firebase UID — used as the primary key */
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  profession: string;

  @Column()
  age: string;

  @Column()
  gender: string;

  @Column({ nullable: true })
  email: string | null;

  @Column({ nullable: true })
  photoUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
