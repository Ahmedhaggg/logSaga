import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  token: string; // Hashed refresh token

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt?: Date;

  @Column({ default: false })
  isRevoked: boolean;
}
