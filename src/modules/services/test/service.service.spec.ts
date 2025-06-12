import { Test, TestingModule } from '@nestjs/testing';
import { ServiceService } from '../service.service';
import { ServiceRepository } from '../repositories/service.repository';
import { createTestDatabaseModule } from '@common/test/database';
import { Service } from '../entities/service.entity';
import { User } from '@module/users/entities/user.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { CreateServiceDto } from '../dto/createService.dto';
import { UserRepository } from '@module/users/user.repository';

describe('ServiceService (Integration)', () => {
  let serviceService: ServiceService;
  let serviceRepository: ServiceRepository;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...createTestDatabaseModule(Service, User)],
      providers: [ServiceService, ServiceRepository, UserRepository],
    }).compile();

    serviceService = module.get<ServiceService>(ServiceService);
    serviceRepository = module.get<ServiceRepository>(ServiceRepository);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterAll(async () => {
    await serviceRepository.clear();
    await userRepository.clear();
  });

  describe('createService', () => {
    it('should create a new service', async () => {
      const serviceData: CreateServiceDto = {
        name: faker.company.name(),
        metadata: { description: faker.lorem.sentence() },
      };

      const result = await serviceService.createService(serviceData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(serviceData.name);
      expect(result.metadata).toEqual(serviceData.metadata);
    });
  });

  describe('getAllServices', () => {
    let adminUser: User;
    let viewerUser: User;
    let services: Service[];

    beforeAll(async () => {
      await serviceRepository.clear();
      // Create test users
      adminUser = await userRepository.create({
        email: faker.internet.email(),
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      viewerUser = await userRepository.create({
        email: faker.internet.email(),
        role: 'VIEWER',
        status: 'ACTIVE',
      });

      // Create test services
      services = await Promise.all([
        serviceRepository.create({
          name: faker.company.name(),
          metadata: { description: faker.lorem.sentence() },
        }),
        serviceRepository.create({
          name: faker.company.name(),
          metadata: { description: faker.lorem.sentence() },
        }),
      ]);

      // Associate one service with the viewer
      await serviceRepository.addUserToService(services[0].id, viewerUser);
    });

    it('should return all services for admin user', async () => {
      const result = await serviceService.getAllServices({
        userId: adminUser.id,
        role: 'ADMIN',
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('metadata');
    });

    it('should return only associated services for viewer user', async () => {
      const result = await serviceService.getAllServices({
        userId: viewerUser.id,
        role: 'VIEWER',
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(services[0].id);
    });

    it('should throw ForbiddenException for invalid role', async () => {
      await expect(
        serviceService.getAllServices({
          userId: faker.string.uuid(),
          role: 'INVALID_ROLE' as any,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getServiceById', () => {
    let testService: Service;

    beforeAll(async () => {
      testService = await serviceRepository.create({
        name: faker.company.name(),
        metadata: { description: faker.lorem.sentence() },
      });
    });

    it('should return service by id', async () => {
      const result = await serviceService.getServiceById(testService.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(testService.id);
      expect(result?.name).toBe(testService.name);
      expect(result?.metadata).toEqual(testService.metadata);
    });

    it('should throw NotFoundException for non-existent service', async () => {
      const nonExistentId = faker.string.uuid();
      await expect(
        serviceService.getServiceById(nonExistentId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
