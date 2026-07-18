import express from "express";
import cookieParser from "cookie-parser";
import { morganMiddleware } from "@common/middleware/morgan.middleware.js";
import { authRoutes } from "@modules/auth/auth.routes.js";
import { notFound } from "@common/middleware/notFound.middleware.js";
import { globalErrorHandler } from "@common/middleware/error.middleware.js";

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());

app.use(morganMiddleware);

// routes will be here
app.use("/api/v1/auth", authRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
