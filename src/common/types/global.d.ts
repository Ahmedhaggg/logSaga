import { JwtPayload } from './jwtPayload.type';

declare global {
  namespace Express {
    export interface User extends JwtPayload {}
    interface Request {
      user?: JwtPayload;
    }
  }
}
