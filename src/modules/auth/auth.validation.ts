import { z } from "zod";

// 🔐 Password rule (reusable)
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(50)
  .regex(/[A-Z]/, "Must include at least one uppercase letter")
  .regex(/[0-9]/, "Must include at least one number");

// 🧑 Register
export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: passwordSchema,
});

// 🔑 Login
export const loginSchema = z.object({
  email: z.email(),
  password: passwordSchema,
});

// 🔁 Change password
export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
});

export const resendEmailVerificationSchema = z.object({
  email: z.email(),
});
