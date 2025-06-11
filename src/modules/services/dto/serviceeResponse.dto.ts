import { Exclude, Expose } from 'class-transformer';

@Expose()
export class ServiceResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  metadata: Record<string, any>;

  @Expose()
  createdAt: Date;

  @Exclude()
  users?: any;
}
