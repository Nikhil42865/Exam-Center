import { UserDto } from "@examcenter/contracts";

declare global {
  namespace Express {
    interface Request {
      user?: UserDto;
    }
  }
}
export {};
