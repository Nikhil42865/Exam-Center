import { Request, Response, NextFunction } from "express";
import { UserRole } from "@examcenter/contracts";
import { AppError } from "../shared/errors.js";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized("Authentication required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(AppError.forbidden(`Access restricted to: ${roles.join(", ")}`));
      return;
    }

    next();
  };
}
