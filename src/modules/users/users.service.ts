import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { InviteUserDto } from './dto/inviteUser.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async inviteUser({ email, role }: InviteUserDto): Promise<void> {
    // Check if user already exists
    let user = await this.userRepository.findOne({ email });

    if (user)
      throw new ConflictException(`User with email ${email} already exists.`);

    user = await this.userRepository.create({
      email,
      role,
      isDeleted: false,
    });
    // TODO: Send invite link via email (mocked)
    // e.g., sendEmail(email, `https://your-frontend.com/invite?email=${email}`)
  }
}
