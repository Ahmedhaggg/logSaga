import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UserRepository } from '../user.repository';
import { createTestDatabaseModule } from '@common/test/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { seedUserData } from '@module/auth/test/user.seed';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { faker } from '@faker-js/faker';

describe('User Service Test', () => {
  let userService: UsersService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [
        ...createTestDatabaseModule(User),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService, UserRepository],
    }).compile();

    userService = testingModule.get<UsersService>(UsersService);
    userRepository = testingModule.get<UserRepository>(UserRepository);
  });

  describe('inviteUser', () => {
    test('should throw ConflictException because there is a user with existing email', async () => {
      const userData = seedUserData('INVITED');
      await userRepository.create(userData);

      await expect(
        userService.inviteUser({ email: userData.email, role: 'VIEWER' }),
      ).rejects.toThrow(
        new ConflictException(
          `User with email ${userData.email} already exists.`,
        ),
      );
    });

    test('should save the user in database', async () => {
      const email = faker.internet.email();

      await userService.inviteUser({ email, role: 'VIEWER' });

      const user = await userRepository.findOne({ email });

      expect(user).toBeDefined();
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user?.role).toBe('VIEWER');
      expect(user?.isDeleted).toBe(false);
      expect(user).toHaveProperty('createdAt');
    });
  });

  describe('deleteUserByEmail', () => {
    test('should throw NotFoundException if user does not exist', async () => {
      const nonExistentEmail = faker.internet.email();

      await expect(
        userService.deleteUserByEmail(nonExistentEmail),
      ).rejects.toThrow(NotFoundException);
    });

    test('should throw ForbiddenException if user is an ADMIN', async () => {
      const adminUser = await userRepository.create({
        ...seedUserData('INVITED'),
        role: 'ADMIN',
      });

      await expect(
        userService.deleteUserByEmail(adminUser.email),
      ).rejects.toThrow(ForbiddenException);
    });

    test('should delete user successfully', async () => {
      const normalUser = await userRepository.create(seedUserData('INVITED'));

      await userService.deleteUserByEmail(normalUser.email);

      const deletedUser = await userRepository.findOne({
        email: normalUser.email,
      });

      expect(deletedUser).toBeNull();
    });
  });

  describe('findAll', () => {
    test('should return all users', async () => {
      // Clear users
      await userRepository.clear();

      await userRepository.create(seedUserData('INVITED'));
      await userRepository.create(seedUserData('INVITED'));
      await userRepository.create(seedUserData('INVITED'));

      const users = await userService.findAll();

      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBe(3);
      users.forEach((user) => {
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('createdAt');
      });
    });
  });
});
