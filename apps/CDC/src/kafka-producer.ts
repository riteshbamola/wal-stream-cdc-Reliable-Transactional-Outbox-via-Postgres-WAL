import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "wal-stream-cdc",
  brokers: ["localhost:9092"],
});

export const producer = kafka.producer({
  allowAutoTopicCreation: false,
});

export const connectKafka = async () => {
  await producer.connect();
};
