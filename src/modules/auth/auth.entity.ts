// src/modules/auth/auth.entity.ts

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  password: string;
  role: "USER" | "ADMIN" | "MODERATOR";
  isBanned: boolean;
  isVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  refreshToken?: string | null;
}
