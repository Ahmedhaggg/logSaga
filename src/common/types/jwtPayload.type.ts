import { Role } from './user.type';

export interface JwtPayload {
  userId?: string;
  serviceId?: string;
  role: Role;
}
