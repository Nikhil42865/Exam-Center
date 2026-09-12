import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import { sendSuccess } from "../../shared/response.js";
import { config } from "../../config/index.js";
import { AppError } from "../../shared/errors.js";

const isProduction = config.NODE_ENV === "production";

function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  // 15 minutes
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
  });

  // 7 days
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res: Response): void {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 200);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        throw AppError.unauthorized("Refresh token required");
      }
      const result = await authService.refresh(token);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      sendSuccess(res, { user: result.user, accessToken: result.accessToken });
    } catch (error) {
      clearAuthCookies(res);
      next(error);
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    clearAuthCookies(res);
    sendSuccess(res, { message: "Successfully logged out" });
  }

  async getMe(req: Request, res: Response): Promise<void> {
    sendSuccess(res, { user: req.user });
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await authService.updateProfile(req.user!.id, req.body.name);
      sendSuccess(res, { user: updated });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
