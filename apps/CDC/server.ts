import { startStreaming } from "./src/transformer";
import { connectKafka } from "src/kafka-producer";
const startCDC = async () =>
  await connectKafka();

  await startStreaming();
  console.log("Started");
};

startCDC();
