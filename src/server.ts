import { ENV } from "@config/env.js";
import app from "./app.js";
import { connectDB } from "@infrastructure/db.js";

const startServer = async () => {
  await connectDB();

  app.listen(ENV.PORT, () => {
    console.log(`Server is running at port: ${ENV.PORT}`);
  });
};

startServer();
