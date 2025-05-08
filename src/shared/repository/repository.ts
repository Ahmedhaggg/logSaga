import {
  FindOptionsWhere,
  Repository,
  BaseEntity,
  FindOptionsSelect,
  DeepPartial,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {
  Columns,
  FindOneQuery,
  FindQuery,
  IBaseRepository,
} from './repository.interface';

export class BaseRepository<T extends BaseEntity>
  implements IBaseRepository<T>
{
  constructor(protected readonly repository: Repository<T>) {}

  private buildSelect(columns?: Columns<T>): FindOptionsSelect<T> | undefined {
    if (!columns) return undefined;

    return columns.reduce((acc, column) => {
      (acc as Record<string, boolean>)[column as string] = true;
      return acc;
    }, {} as FindOptionsSelect<T>);
  }

  async findOne(
    query: FindOneQuery<T>,
    columns?: Columns<T>,
  ): Promise<T | null> {
    return await this.repository.findOne({
      where: query as FindOptionsWhere<T>,
      select: this.buildSelect(columns),
    });
  }

  async find(query: FindQuery<T>, columns?: Columns<T>): Promise<T[]> {
    return this.repository.find({
      where: query.where as FindOptionsWhere<T>,
      take: query.limit,
      skip: query.offset,
      select: this.buildSelect(columns),
    });
  }

  async findById(id: string, columns?: Columns<T>): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      select: this.buildSelect(columns),
    });
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  async updateById(
    id: string,
    data: QueryDeepPartialEntity<T>,
  ): Promise<T | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    return this.repository.save(data);
  }

  async count(query: FindOneQuery<T>): Promise<number> {
    return this.repository.count({
      where: query as FindOptionsWhere<T>,
    });
  }
}
