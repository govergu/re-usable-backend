import express from "express";
import { login, register } from "./auth.controller.js";

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);

// export default router;

export const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
