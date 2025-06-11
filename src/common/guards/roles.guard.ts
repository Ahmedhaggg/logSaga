import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';
import { Role } from '../types/user.type';
import { JwtPayload } from '@common/types/jwtPayload.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): Promise<boolean> | boolean {
    const requiredRoles = this.reflector.get<Role[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role restrictions on this route
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;
    console.log(user);
    console.log(request.headers);
    if (!user || !user.role || !requiredRoles.includes(user?.role)) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
