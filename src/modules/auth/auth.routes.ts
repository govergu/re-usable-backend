import express from "express";
import { login, register } from "./auth.controller.js";
import { validate } from "@common/middleware/validation.middleware.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);

// export default router;

export const authRoutes = express.Router();

authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post("/login", validate(loginSchema), login);
