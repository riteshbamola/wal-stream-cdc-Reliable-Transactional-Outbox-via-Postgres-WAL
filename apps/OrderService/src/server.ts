import { connectDB } from "./models/db";
const startServer = async () => {
  try {
    await connectDB();
    console.log("Server Started");
  } catch (error) {
    console.error("Error starting server:", error);
    throw error;
  }
};

startServer();
