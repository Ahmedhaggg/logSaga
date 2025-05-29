import { faker } from '@faker-js/faker/.';
import { GoogleUserInfo } from '../types/googleAuthUser.type';
import { User } from '@module/users/entities/user.entity';
import * as crypto from 'crypto';
import { RefreshToken } from '../entities/refreshToken.entity';

export const seedUserData = (status: User['status']): Partial<User> => ({
  email: faker.internet.email(),
  status,
  isDeleted: false,
  role: 'VIEWER',
  photo: faker.image.url(),
});

export const seedGoogleUserInfo = (): GoogleUserInfo => ({
  email: faker.internet.email(),
  name: faker.internet.displayName(),
  firstName: faker.string.alpha({ length: 6 }),
  lastName: faker.string.alpha({ length: 6 }),
  picture: faker.image.url(),
});

export const seedRefreshTokenData = (
  userId: string,
  token: string,
): Partial<RefreshToken> => ({
  userId,
  token: crypto.createHash('sha256').update(token).digest('hex'),
  expiresAt: new Date(Date.now() + 100000),
  isRevoked: false,
});
