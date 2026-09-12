import { z } from "zod";

export type UserRole = "candidate" | "admin";
export type UserStatus = "active" | "disabled";

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80, "Name must be at most 80 characters"),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export type RegisterRequestDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequestDto = z.infer<typeof loginSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export interface AuthResponseDto {
  user: UserDto;
  accessToken?: string; // Optional if using cookie-based token
}
