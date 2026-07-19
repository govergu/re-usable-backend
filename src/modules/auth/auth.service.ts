import { AppError } from "@common/utils/appError.js";
import { retryWithBackoff } from "@common/utils/emailRetry.js";
import { signAccessToken, signRefreshToken } from "@common/utils/jwt.js";
import { generateToken } from "@common/utils/token.js";
import { ENV } from "@config/env.js";
import { sendMail } from "@infrastructure/services/email.service.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { AuthRepository } from "./auth.repository.js";
import { Prisma, User } from "@generated/prisma/client.js";
import { LoginRequestDTO, RegisterRequestDTO } from "./auth.dto.js";
import { HTTP_STATUS } from "@common/constants/httpStatusCode.js";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export class AuthService {
  constructor(private authRepository: AuthRepository) {
    // this.authRepository = new AuthRepository();
  }

  async registerUser(inputData: RegisterRequestDTO): Promise<User> {
    const existingUser = await this.authRepository.findByEmail(inputData.email);

    if (existingUser) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, "Account exists already");
    }
    const hashPassword = await bcrypt.hash(inputData.password, 10);

    const { rawToken, hashedToken } = generateToken();

    const user = await this.authRepository.create({
      ...inputData,
      password: hashPassword,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
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

    return user;
  }

  async loginUser(
    credentials: LoginRequestDTO,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // 1. Fetch raw identity via repository
    const user = await this.authRepository.findByEmail(credentials.email);
    if (!user) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Invalid Credentials");
    }

    // 2. Validate cryptographic hash
    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Invalid Credentials");
    }

    // 3. Evaluate platform ban safety gates
    if (user.isBanned) {
      throw new AppError(HTTP_STATUS.FORBIDDEN, "You have been banned!!");
    }

    // 4. Generate security tokens
    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);
    const hashedRefreshToken = hashToken(refreshToken);

    // 5. Commit state change to database
    await this.authRepository.updateRefreshToken(user.id, hashedRefreshToken);

    return { user, accessToken, refreshToken };
  }

  // 1. Verify Email Token Flow
  async verifyEmailToken(
    token: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await this.authRepository.findByVerificationToken(hashedToken);

    if (!user) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Invalid or expired verification token",
      );
    }

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);
    const hashedRefreshToken = hashToken(refreshToken);

    const updatedUser = await this.authRepository.updateVerificationSuccess(
      user.id,
      hashedRefreshToken,
    );

    return { user: updatedUser, accessToken, refreshToken };
  }

  // 2. Resend Verification Email Link
  async resendVerificationEmail(email: string): Promise<boolean> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "No account found with this email address",
      );
    }

    if (user.isVerified) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "This account is already verified",
      );
    }

    const { rawToken, hashedToken } = generateToken();
    const expiryWindow = new Date(Date.now() + 10 * 60 * 1000); // 10 Min Window

    await this.authRepository.updateVerificationToken(
      user.id,
      hashedToken,
      expiryWindow,
    );

    const verifyURL = `${ENV.FRONTEND_URL}/verify-email/${rawToken}`;

    await retryWithBackoff(
      () =>
        sendMail(
          user.email,
          "Verify your email (New Link)",
          `<h3>Click to verify:</h3><a href="${verifyURL}">${verifyURL}</a>`,
        ),
      { retries: 3, delay: 500 },
    );

    return true;
  }

  // 3. Dual Refresh Token Rotation
  async refreshUserToken(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!token) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, "No refresh token provided");
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token");
    }

    const incomingHash = hashToken(token);
    const user = await this.authRepository.findById(decoded.id);

    if (!user || user.refreshToken !== incomingHash) {
      throw new AppError(
        HTTP_STATUS.UNAUTHORIZED,
        "Token mismatch or session expired",
      );
    }

    if (user.isBanned) {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        "Your account has been banned!!",
      );
    }

    const newAccessToken = signAccessToken(user.id, user.role);
    const newRefreshToken = signRefreshToken(user.id, user.role);
    const hashedNewRefreshToken = hashToken(newRefreshToken);

    await this.authRepository.updateRefreshToken(
      user.id,
      hashedNewRefreshToken,
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  // 4. Logout Session Termination
  async logOutUser(userId: string): Promise<void> {
    await this.authRepository.updateRefreshToken(userId, null);
  }

  // 5. Trigger Forgot Password Link Request
  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.authRepository.findByEmail(email);

    // Fail silently to prevent account harvesting vulnerabilities
    if (!user) return true;

    const { rawToken, hashedToken } = generateToken();
    const expiryWindow = new Date(Date.now() + 10 * 60 * 1000);

    await this.authRepository.updateResetToken(
      user.id,
      hashedToken,
      expiryWindow,
    );

    const resetURL = `${ENV.FRONTEND_URL}/reset-password/${rawToken}`;

    await retryWithBackoff(
      () =>
        sendMail(
          user.email,
          "Reset your password",
          `<h3>Reset Password</h3><p>Click below:</p><a href="${resetURL}">${resetURL}</a>`,
        ),
      { retries: 3, delay: 1000 },
    );

    return true;
  }

  // 6. Complete Reset Password Update
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await this.authRepository.findByResetToken(hashedToken);

    if (!user) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Invalid or expired password reset token",
      );
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    await this.authRepository.updatePasswordAndClearTokens(
      user.id,
      hashPassword,
    );

    return true;
  }

  // 7. Context Identity Fetch
  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");
    }
    return user;
  }
}
