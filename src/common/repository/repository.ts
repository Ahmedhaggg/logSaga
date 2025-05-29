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

  async updateById(id: string, data: QueryDeepPartialEntity<T>): Promise<void> {
    const result = await this.repository.update(id, data);

    if (result.affected == 0) throw new Error();
    return;
  }

  async create(data: DeepPartial<T>): Promise<T> {
    return this.repository.save(data);
  }

  async count(query: FindOneQuery<T>): Promise<number> {
    return this.repository.count({
      where: query as FindOptionsWhere<T>,
    });
  }

  async update(
    query: FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<T>,
  ): Promise<boolean> {
    const result = await this.repository.update(query, data);
    return (result.affected || 0) > 0 ? true : false;
  }
  async clear() {
    const tableName = this.repository.metadata.tableName;
    return this.repository.manager.query(
      `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`,
    );
  }

  async findOneOrThrow(query: FindOneQuery<T>): Promise<T> {
    const result = await this.repository.findOne({
      where: query as FindOptionsWhere<T>,
    });

    if (!result) throw new Error("Row isn't Found");

    return result;
  }
}
