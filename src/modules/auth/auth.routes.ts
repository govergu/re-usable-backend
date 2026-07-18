import express from "express";
import {
  forgotPasswordController,
  login,
  logout,
  me,
  refresh,
  register,
  resendVerificationEmailController,
  resetPasswordController,
  verifyEmail,
} from "./auth.controller.js";
import { validate } from "@common/middleware/validation.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendEmailVerificationSchema,
  resetPasswordSchema,
} from "./auth.validation.js";
import { protect } from "@common/middleware/auth.middleware.js";

// const authRoutes = express.authRoutes();

// authRoutes.post("/register", register);
// authRoutes.post("/login", login);

// export default authRoutes;

export const authRoutes = express.Router();

authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post("/login", validate(loginSchema), login);

authRoutes.get("/refresh", refresh);

// Email verification
authRoutes.get("/verify-email", verifyEmail);
authRoutes.post(
  "/resend-verification",
  validate(resendEmailVerificationSchema),
  resendVerificationEmailController,
);

// Password Management
authRoutes.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordController,
);
authRoutes.post(
  "/reset-password",
  //   authRateLimiter,
  validate(resetPasswordSchema),
  resetPasswordController,
);

// Protected User session actions
authRoutes.get("/me", protect, me);
authRoutes.post("/logout", protect, logout);
