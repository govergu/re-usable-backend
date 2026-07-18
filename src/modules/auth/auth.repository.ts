import { IBaseRepository } from "@common/types/repository.types.js";
import { Prisma, User } from "@generated/prisma/client.js";
import { prisma } from "@infrastructure/db.js";

export class AuthRepository implements IBaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  async updateRefreshToken(
    userId: string,
    hashedRefreshToken: string | null,
  ): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  async findByVerificationToken(hashedToken: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { gt: new Date() },
      },
    });
  }

  async findByResetToken(hashedToken: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });
  }

  async updateVerificationSuccess(
    userId: string,
    hashedRefreshToken: string,
  ): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        refreshToken: hashedRefreshToken,
      },
    });
  }

  async updateVerificationToken(
    userId: string,
    hashedToken: string,
    expiry: Date,
  ): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: expiry,
      },
    });
  }

  async updateResetToken(
    userId: string,
    hashedToken: string,
    expiry: Date,
  ): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiry,
      },
    });
  }

  async updatePasswordAndClearTokens(
    userId: string,
    hashPassword: string,
  ): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        password: hashPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        refreshToken: null, // Clear active sessions on password change
      },
    });
  }
}
