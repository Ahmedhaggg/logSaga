import { faker } from '@faker-js/faker';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';
import { RefreshToken } from '../entities/refreshToken.entity';
import { GoogleUserInfo } from '../types/googleAuthUser.type';
import { UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '@module/users/user.repository';
import { BaseRepository } from '@common/repository/repository';
import { RefreshTokenRepository } from '../repositories/refreshToken.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { createTestDatabaseModule } from '@common/test/database';
import {
  seedGoogleUserInfo,
  seedRefreshTokenData,
  seedUserData,
} from './user.seed';

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
};
describe('AuthService (Integration)', () => {
  let authService: AuthService;
  let userRepository: BaseRepository<User>;
  let refreshTokenRepository: BaseRepository<RefreshToken>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        createTestDatabaseModule(),
        TypeOrmModule.forFeature([User, RefreshToken]),
      ],
      providers: [
        UserRepository,
        AuthService,
        RefreshTokenRepository,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    refreshTokenRepository = module.get<RefreshTokenRepository>(
      RefreshTokenRepository,
    );
  });

  afterAll(async () => {
    await refreshTokenRepository.clear();
    await userRepository.clear();
  });

  describe('loginWithGoogle', () => {
    beforeAll(() => {
      mockJwtService.sign.mockReturnValue(faker.string.alpha({ length: 30 }));
    });
    it('should login an active user', async () => {
      const mockGoogleUser: GoogleUserInfo = seedGoogleUserInfo();

      await userRepository.create({
        ...seedUserData('ACTIVE'),
        email: mockGoogleUser.email,
      });

      const result = await authService.loginWithGoogle(mockGoogleUser);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should activate an invited user', async () => {
      const mockGoogleUser: GoogleUserInfo = seedGoogleUserInfo();

      const user = await userRepository.create({
        ...seedUserData('INVITED'),
        email: mockGoogleUser.email,
      });

      const result = await authService.loginWithGoogle(mockGoogleUser);
      const updated = await userRepository.findOneOrThrow({ id: user.id });

      expect(updated.status).toBe('ACTIVE');
      expect(updated.photo).toBe(mockGoogleUser.picture);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw if user not found', async () => {
      const mockGoogleUser: GoogleUserInfo = seedGoogleUserInfo();
      console.log(mockGoogleUser.email);
      const user = await userRepository.findOne({
        email: mockGoogleUser.email,
      });
      console.log(user);
      await expect(authService.loginWithGoogle(mockGoogleUser)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateRefreshToken', () => {
    it('should issue new token pair for valid refresh token', async () => {
      const user = await userRepository.create(seedUserData('ACTIVE'));

      const token = faker.string.alpha({ length: 24 });

      const refreshTokenData = seedRefreshTokenData(user.id, token);

      await refreshTokenRepository.create(refreshTokenData);

      const result = await authService.validateRefreshToken(token);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw on invalid token', async () => {
      await expect(
        authService.validateRefreshToken('invalid_token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw on expired token', async () => {
      const user = await userRepository.create(seedUserData('ACTIVE'));
      const token = faker.string.alpha({ length: 24 });

      await refreshTokenRepository.create({
        ...seedRefreshTokenData(user.id, token),
        token: faker.string.alpha({ length: 24 }),
      });

      await expect(authService.validateRefreshToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    const token = faker.string.alpha({ length: 24 });
    it('should revoke refresh token', async () => {
      const user = await userRepository.create(seedUserData('ACTIVE'));

      const refreshTokenData = seedRefreshTokenData(user.id, token);

      await refreshTokenRepository.create(refreshTokenData);

      await authService.logout(token);

      const refreshToken = await refreshTokenRepository.findOne({
        token: refreshTokenData.token,
      });
      expect(refreshToken?.isRevoked).toBe(true);
    });
  });
});
