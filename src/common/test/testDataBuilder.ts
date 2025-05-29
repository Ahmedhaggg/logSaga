import { BaseRepository } from '@common/repository/repository';
import { faker } from '@faker-js/faker';
import { BaseEntity, DeepPartial } from 'typeorm';

export class TestDataBuilder<T extends BaseEntity> {
  private data: Partial<T> = {};

  constructor(private repository: BaseRepository<T>) {}

  static for<T extends BaseEntity>(
    repository: BaseRepository<T>,
  ): TestDataBuilder<T> {
    return new TestDataBuilder(repository);
  }

  with<K extends keyof T>(field: K, value: T[K]): TestDataBuilder<T> {
    this.data[field] = value;
    return this;
  }

  withDefaults(defaults: Partial<T>): TestDataBuilder<T> {
    this.data = { ...defaults, ...this.data };
    return this;
  }

  async build(): Promise<T> {
    const entity = await this.repository.create(this.data as DeepPartial<T>);
    return entity;
  }

  async create(): Promise<T> {
    return await this.build();
  }

  async createMany(count: number): Promise<T[]> {
    const entities: T[] = [];
    for (let i = 0; i < count; i++) {
      const entity = await this.create();
      entities.push(entity);
    }
    return entities;
  }

  // Helper method for common fake data
  static faker = faker;
}
