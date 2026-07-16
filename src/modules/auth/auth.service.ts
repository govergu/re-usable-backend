import { AppError } from "@common/utils/appError.js";
import { retryWithBackoff } from "@common/utils/emailRetry.js";
import { signAccessToken, signRefreshToken } from "@common/utils/jwt.js";
import { generateToken } from "@common/utils/token.js";
import { ENV } from "@config/env.js";
import { prisma } from "@infrastructure/db.js";
import { sendMail } from "@infrastructure/services/email.service.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

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

  const { rawToken, hashedToken } = generateToken();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  //  Verification link
  const verifyURL = `${ENV.FRONTEND_URL}/verify-email/${rawToken}`;

  // email with retry logic implemented
  await retryWithBackoff(
    () =>
      sendMail(
        user.email,
        "Verify your email",
        `<h3>Click to verify:</h3><a href="${verifyURL}">${verifyURL}</a>`,
      ),
    { retries: 3, delay: 1000 },
  );

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

export const verifyEmailToken = async (token: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find the user with matching hashed token unexpired
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { gt: new Date() }, // Prisma uses Date objects
    },
  });

  if (!user) {
    throw new AppError(400, "Invalid or expired token");
  }
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id, user.role);

  const hashedRefreshToken = hashToken(refreshToken);

  // Update user verification status and clear tokens
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      emailVerificationToken: null, // Prisma uses null instead of undefined
      emailVerificationExpires: null,
      refreshToken: hashedRefreshToken,
    },
  });

  //remove the fields
  const userObj = excludeFields(updatedUser, [
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

export const resendVerificationEmail = async (email: string) => {
  // 1. Find user by email
  const user = await prisma.user.findUnique({ where: { email } });

  // 2. Fail silently or openly (Openly is easier for devs, silently is safer against email harvesting)
  if (!user) {
    throw new AppError(404, "No account found with this email address");
  }

  // 3. If they are already verified, don't waste system resources
  if (user.isVerified) {
    throw new AppError(400, "This account is already verified");
  }

  // 4. Generate new token details
  const { rawToken, hashedToken } = generateToken();

  // 5. Update user record with the fresh token and expiration time
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // Fresh 10 min window
    },
  });

  // 6. Send the new link
  const verifyURL = `${ENV.FRONTEND_URL}/verify-email/${rawToken}`;
  // wrapped with retry logic
  await retryWithBackoff(
    () =>
      sendMail(
        user.email,
        "Verify your email (New Link)",
        `<h3>Click to verify:</h3><a href="${verifyURL}">${verifyURL}</a>`,
      ),
    { retries: 3, delay: 500 }, // You can customize configuration per call site!
  );

  return true;
};

export const refreshUserToken = async (token: string) => {
  if (!token) {
    throw new AppError(401, "No refresh token");
  }
  let decoded: any;

  try {
    decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET as string);
  } catch {
    throw new AppError(401, "Invalid refresh token");
  }
  const incomingHash = hashToken(token);

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user || user.refreshToken !== incomingHash) {
    throw new AppError(401, "Token mismatch");
  }

  if (user.isBanned) {
    throw new AppError(403, "Your account has been banned!!");
  }

  const newAccessToken = signAccessToken(user.id, user.role);
  const newRefreshToken = signRefreshToken(user.id, user.role);

  const hashedRefreshToken = hashToken(newRefreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logOutUser = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return true;
  }

  const { rawToken, hashedToken } = generateToken();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const resetURL = `${ENV.FRONTEND_URL}/reset-password/${rawToken}`;
  // rerty logic implemented
  await retryWithBackoff(
    () =>
      sendMail(
        user.email,
        "Reset your password",
        `<h3>Reset Password</h3><p>Click below:</p><a href="${resetURL}">${resetURL}</a>`,
      ),
    { retries: 3, delay: 1000 },
  );
  // await sendMail(
  //   user.email,
  //   "Reset your password",
  //   `<h3>Reset Password</h3>
  //    <p>Click below to reset your password:</p>
  //    <a href="${resetURL}">${resetURL}</a>`,
  // );

  return true;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError(400, "Invalid or expired token");
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshToken: null,
    },
  });

  return true;
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, "User not found");
  }
  const userObj = excludeFields(user, [
    "password",
    "refreshToken",
    "emailVerificationToken",
    "emailVerificationExpires",
    "passwordResetToken",
    "passwordResetExpires",
    "isBanned",
  ]);
  // const { password: _, ...userWithoutPassword } = user;
  return userObj;
};
