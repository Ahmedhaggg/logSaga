import { Role } from './user.type';

export type JwtPayload = {
  userId?: string;
  serviceId?: string;
  role: Role;
};
