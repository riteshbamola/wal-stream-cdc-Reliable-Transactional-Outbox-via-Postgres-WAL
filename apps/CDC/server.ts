import { startStreaming } from "./src/transformer";

const startCDC = async () => {
  await startStreaming();
  console.log("Started");
};

startCDC();
