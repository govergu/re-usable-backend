import express from "express";
import cookieParser from "cookie-parser";
import { morganMiddleware } from "@common/middleware/morgan.middleware.js";
import { authRoutes } from "@modules/auth/auth.routes.js";
import { notFound } from "@common/middleware/notFound.middleware.js";
import { globalErrorHandler } from "@common/middleware/error.middleware.js";
import { userRoutes } from "@modules/users/user.routes.js";

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());

app.use(morganMiddleware);

// routes will be here
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
