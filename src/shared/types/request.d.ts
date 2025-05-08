import { JwtPayload } from './jwtPayload.type';

// Extend Express Request type to include our user field
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
