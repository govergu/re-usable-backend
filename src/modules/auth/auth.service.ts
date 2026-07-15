import { AppError } from "@common/utils/appError.js";
import { signAccessToken, signRefreshToken } from "@common/utils/jwt.js";
import { prisma } from "@infrastructure/db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const excludeFields = <User, Key extends keyof User>(
  user: User,
  keys: Key[],
): Omit<User, Key> => {
  return Object.fromEntries(
    Object.entries(user as any).filter(([key]) => !keys.includes(key as Key)),
  ) as Omit<User, Key>;
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError(400, "Account exists already");
  }
  const hashPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
    },
  });

  const userObj = excludeFields(user, [
    "password",
    "refreshToken",
    "emailVerificationToken",
    "emailVerificationExpires",
    "passwordResetToken",
    "passwordResetExpires",
    "isBanned",
  ]);

  return { user: userObj };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    throw new AppError(404, "Invalid Credentials");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError(404, "Invalid Credentials");
  }

  if (user.isBanned) {
    throw new AppError(403, "You have been banned!!");
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, user.role);

  const hashedRefreshToken = hashToken(refreshToken);

  // save the refresh token to database
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken },
  });
  const userObj = excludeFields(user, [
    "password",
    "refreshToken",
    "emailVerificationToken",
    "emailVerificationExpires",
    "passwordResetToken",
    "passwordResetExpires",
    "isBanned",
  ]);

  return { user: userObj, accessToken, refreshToken };
};
