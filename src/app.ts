import { globalErrorHandler } from "@common/middleware/error.middleware.js";
import express from "express";

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use(globalErrorHandler);

export default app;
