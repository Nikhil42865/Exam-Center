import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../modules/auth/auth.tokens.js";
import { UserModel } from "../modules/users/user.model.js";
import { AppError } from "../shared/errors.js";

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw AppError.unauthorized("Authentication required");
    }

    const payload = verifyAccessToken(token);
    const user = await UserModel.findById(payload.userId);

    if (!user) {
      throw AppError.unauthorized("User no longer exists");
    }

    if (user.status !== "active") {
      throw AppError.forbidden("Account is disabled");
    }

    req.user = user.toDto();
    next();
  } catch (error) {
    if ((error as any).name === "JsonWebTokenError" || (error as any).name === "TokenExpiredError") {
      next(AppError.unauthorized("Invalid or expired session"));
      return;
    }
    next(error);
  }
}
