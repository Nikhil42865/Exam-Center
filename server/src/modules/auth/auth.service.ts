import bcrypt from "bcrypt";
import { RegisterRequestDto, LoginRequestDto, UserDto } from "@examcenter/contracts";
import { UserModel, IUser } from "../users/user.model.js";
import { AppError } from "../../shared/errors.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from "./auth.tokens.js";

const SALT_ROUNDS = 10;

export class AuthService {
  async register(data: RegisterRequestDto): Promise<{ user: UserDto; accessToken: string; refreshToken: string }> {
    const existing = await UserModel.findOne({ email: data.email });
    if (existing) {
      throw AppError.conflict("An account with this email address already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Registration is candidate-only (FR-AUTH-07)
    const user = await UserModel.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: "candidate",
      status: "active",
    });

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: user.toDto(),
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginRequestDto): Promise<{ user: UserDto; accessToken: string; refreshToken: string }> {
    const user = await UserModel.findOne({ email: data.email });
    if (!user) {
      // Generic auth error to prevent account enumeration
      throw AppError.unauthorized("Invalid email or password");
    }

    if (user.status !== "active") {
      throw AppError.forbidden("Your account has been disabled. Please contact an administrator.");
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: user.toDto(),
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; user: UserDto }> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await UserModel.findById(payload.userId);

      if (!user || user.status !== "active") {
        throw AppError.unauthorized("Session expired or user inactive");
      }

      const tokenPayload: TokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: user.toDto(),
      };
    } catch {
      throw AppError.unauthorized("Invalid or expired refresh token");
    }
  }

  async updateProfile(userId: string, name?: string): Promise<UserDto> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    if (name) {
      user.name = name;
      await user.save();
    }

    return user.toDto();
  }
}

export const authService = new AuthService();
