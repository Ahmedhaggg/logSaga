import { Role } from '@common/types/user.type';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn } from 'class-validator';

export class InviteUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: ['ADMIN', 'VIEWER'],
    description: 'User role (only ADMIN or VIEWER allowed)',
    example: 'ADMIN',
  })
  @IsIn(['ADMIN', 'VIEWER'])
  role: Role;
}
