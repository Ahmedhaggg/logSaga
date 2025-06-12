// src/shared/utils/transform.util.ts
import { plainToInstance } from 'class-transformer';

export function transformToDto<T, V>(dto: new () => T, data: V[]): T[];
export function transformToDto<T, V>(dto: new () => T, data: V): T;
export function transformToDto<T, V>(dto: new () => T, data: V | V[]): T | T[] {
  return plainToInstance(dto, data, { excludeExtraneousValues: true });
}
