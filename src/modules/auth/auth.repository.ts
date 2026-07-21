import { Prisma, User } from "@generated/prisma/client.js";
import { prisma } from "@infrastructure/db.js";
import { BaseRepository } from "@infrastructure/repositories/base.repository.js";
import { AuthUser } from "./auth.entity.js";

export class AuthRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor() {
    // Pass the actual Prisma delegate instance here
    super(prisma.user);
  }
  private toEntity(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role as "USER" | "ADMIN" | "MODERATOR",
      isBanned: user.isBanned,
      isVerified: user.isVerified,
      emailVerificationToken: user.emailVerificationToken,
      emailVerificationExpires: user.emailVerificationExpires,
      passwordResetToken: user.passwordResetToken,
      passwordResetExpires: user.passwordResetExpires,
      refreshToken: user.refreshToken,
    };
  }

  // async findByEmail(email: string): Promise<AuthUser | null> {
  //   const user = prisma.user.findUnique({
  //     where: { email },
  //   })
  //   return user ? this.toEntity(user) : null;
  // }
  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? this.toEntity(user) : null;
  }

  async updateRefreshToken(
    userId: string,
    hashedRefreshToken: string | null,
  ): Promise<AuthUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
    return this.toEntity(user);
  }

  async findByVerificationToken(hashedToken: string): Promise<AuthUser | null> {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { gt: new Date() },
      },
    });
    return user ? this.toEntity(user) : null;
  }

  async findByResetToken(hashedToken: string): Promise<AuthUser | null> {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });
    return user ? this.toEntity(user) : null;
  }

  async updateVerificationSuccess(
    userId: string,
    hashedRefreshToken: string,
  ): Promise<AuthUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        refreshToken: hashedRefreshToken,
      },
    });
    return this.toEntity(user);
  }

  async updateVerificationToken(
    userId: string,
    hashedToken: string,
    expiry: Date,
  ): Promise<AuthUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: expiry,
      },
    });
    return this.toEntity(user);
  }

  async updateResetToken(
    userId: string,
    hashedToken: string,
    expiry: Date,
  ): Promise<AuthUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiry,
      },
    });
    return this.toEntity(user);
  }

  async updatePasswordAndClearTokens(
    userId: string,
    hashPassword: string,
  ): Promise<AuthUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        refreshToken: null, // Clear active sessions on password change
      },
    });
    return this.toEntity(user);
  }
}
