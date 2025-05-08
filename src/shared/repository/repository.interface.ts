import { DeepPartial } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export type FindOneQuery<T> = Partial<Record<keyof T, unknown>>;

export type FindQuery<T> = {
  where: FindOneQuery<T>;
  limit?: number;
  offset?: number;
};

export type Columns<T> = (keyof T)[];

export interface IBaseRepository<T> {
  findOne(query: FindOneQuery<T>, columns?: Columns<T>): Promise<T | null>;
  find(query: FindQuery<T>, columns?: Columns<T>): Promise<T[]>;
  findById(id: string, columns?: Columns<T>): Promise<T | null>;
  deleteById(id: string): Promise<boolean>;
  updateById(id: string, data: QueryDeepPartialEntity<T>): Promise<T | null>;
  create(data: DeepPartial<T>): Promise<T>;
  count(query: FindOneQuery<T>): Promise<number>;
}
