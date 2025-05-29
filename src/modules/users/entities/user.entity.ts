import { Role } from '@common/types/user.type';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ enum: ['Admin', 'Viewer'] })
  role: Role;

  @Column({ type: 'text', default: null })
  photo: string;

  @CreateDateColumn({ default: null })
  lastLogin?: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: ['INVITED', 'ACTIVE'],
    default: 'INVITED',
  })
  status: 'INVITED' | 'ACTIVE';
}
