import { connectDB } from "./models/db";

import { connectKafka } from "./kafka";
const startServer = async () => {
  try {
    await connectDB();
    await connectKafka();
    console.log("Server Started");
  } catch (error) {
    console.error("Error starting server:", error);
    throw error;
  }
};

startServer();
