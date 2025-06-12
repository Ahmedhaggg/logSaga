import { Role } from '@common/types/user.type';
import { Service } from '@module/services/entities/service.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class User {
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
  createdAt?: Date;

  @Column({
    type: 'enum',
    enum: ['INVITED', 'ACTIVE'],
    default: 'INVITED',
  })
  status: 'INVITED' | 'ACTIVE';

  @ManyToMany(() => Service, (service) => service.users)
  @JoinTable({ name: 'user_services' })
  services: Service[];
}
