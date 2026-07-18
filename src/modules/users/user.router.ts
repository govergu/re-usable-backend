import { protect } from "@common/middleware/auth.middleware.js";
import express from "express";
import { updateProfileController } from "./user.controller.js";

export const userRoutes = express.Router();

userRoutes.patch("/profile", protect, updateProfileController);
