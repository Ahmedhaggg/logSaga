import { BaseRepository } from '@common/repository/repository';
import { Injectable } from '@nestjs/common';
import { Service } from '../entities/service.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@module/users/entities/user.entity';

@Injectable()
export class ServiceRepository extends BaseRepository<Service> {
  constructor(
    @InjectRepository(Service)
    repository: Repository<Service>,
  ) {
    super(repository);
  }

  async getServicesForUser(userId: string): Promise<Service[]> {
    return this.repository
      .createQueryBuilder('service')
      .innerJoin('service.users', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  async addUserToService(serviceId: string, user: User): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .relation(Service, 'users')
      .of(serviceId)
      .add(user);
  }
}
