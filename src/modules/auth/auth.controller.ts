import { asyncHandler } from "@common/utils/asyncHandler.js";
import {
  forgotPassword,
  getCurrentUser,
  loginUser,
  logOutUser,
  refreshUserToken,
  registerUser,
  resendVerificationEmail,
  resetPassword,
  verifyEmailToken,
} from "./auth.service.js";
import { ApiResponse } from "@common/utils/apiResponse.js";
import { HTTP_STATUS } from "@common/constants/httpStatusCode.js";
import { Request, Response } from "express";
import { setTokenCookie } from "@common/utils/cookies.js";
import { ENV } from "@config/env.js";
import { AppError } from "@common/utils/appError.js";

const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRY = Number(ENV.COOKIE_EXPIRES_DAYS) * 24 * 60 * 60;

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const user = await registerUser(name, email, password);

  return ApiResponse.success(
    res,
    user,
    "Check you email for verification",
    HTTP_STATUS.CREATED,
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUser(email, password);

  setTokenCookie(res, "accessToken", accessToken, ACCESS_TOKEN_EXPIRY);
  setTokenCookie(res, "refreshToken", refreshToken, REFRESH_TOKEN_EXPIRY);
  //   setCsrfCookie(res);
  return ApiResponse.success(
    res,
    user,
    "Successfully logged in",
    HTTP_STATUS.OK,
  );
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token) {
    throw new AppError(400, "Token missing");
  }

  const { user, accessToken, refreshToken } = await verifyEmailToken(
    token as string,
  );

  setTokenCookie(res, "accessToken", accessToken, ACCESS_TOKEN_EXPIRY);
  setTokenCookie(res, "refreshToken", refreshToken, REFRESH_TOKEN_EXPIRY);
  // setCsrfCookie(res);

  return ApiResponse.success(res, user, "Email Verified Successfully");
});

export const resendVerificationEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    // 1. Try to get email from logged-in session, fallback to request body
    const email = req.user?.email || req.body.email;

    if (!email) {
      throw new AppError(400, "Email address is required");
    }

    // 2. Call the service layer function
    await resendVerificationEmail(email);

    // 3. Return a standard unified api response
    return ApiResponse.success(res, "Verification Link sent successfully");
  },
);

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  const { accessToken, refreshToken } = await refreshUserToken(token);

  setTokenCookie(res, "accessToken", accessToken, ACCESS_TOKEN_EXPIRY);
  setTokenCookie(res, "refreshToken", refreshToken, REFRESH_TOKEN_EXPIRY);
  // setCsrfCookie(res);
  return ApiResponse.success(res, "Token refresh Success");
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await logOutUser(req.user.id);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return ApiResponse.success(res, "Logout Success!!");
});

export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    await forgotPassword(email);

    return ApiResponse.success(res, "Password reset link sent!!");
  },
);

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.query;
    const { newPassword } = req.body;

    if (!token) {
      throw new AppError(400, "Token missing");
    }

    await resetPassword(token as string, newPassword);

    return ApiResponse.success(res, "Password reset success");
  },
);

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentUser(req.user.id);

  return ApiResponse.success(res, user, "Hey it's you!!");

  // res.status(201).json({
  //   success: true,
  //   data: user,
  // });
});
