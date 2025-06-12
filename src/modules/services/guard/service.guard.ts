// // src/shared/guards/custom-roles.guard.ts
// import { RolesGuard } from '@common/guards/roles.guard';
// import { BaseRepository } from '@common/repository/repository';
// import { ExecutionContext, Injectable } from '@nestjs/common';

// @Injectable()
// export class CustomRolesGuard extends RolesGuard {
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const baseAccess = await super.canActivate(context);
//     if (!baseAccess) return false;

//     const request = context.switchToHttp().getRequest<Express.Request>();
//     const user = request.user;

//     if (user?.role == "ADMIN")
//         return true;

//     const userServices = await BaseRepository.get
//     if (user.) {
//       return false;
//     }

//     // more custom checks...
//     return true;
//   }
// }
