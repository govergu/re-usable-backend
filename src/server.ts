import app from "./app.js";

const startServer = async () => {
  //   await connectDB();

  const PORT = 5000;

  app.listen(PORT, () => {
    console.log(`Server is running at port: ${PORT}`);
  });
};

startServer();
