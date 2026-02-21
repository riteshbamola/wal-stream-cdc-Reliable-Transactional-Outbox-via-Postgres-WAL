import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "order-service",
  brokers: ["localhost:9092"],
});

const createTopics = async () => {
  const admin = kafka.admin();
  await admin.connect();

  await admin.createTopics({
    topics: [{ topic: "ORDER_CREATED", numPartitions: 1 }],
  });

  await admin.disconnect();
};

const consumer = kafka.consumer({ groupId: "order-service" });

export const connectKafka = async () => {
  await createTopics();
  await consumer.connect();

  await consumer.subscribe({ topic: "ORDER_CREATED", fromBeginning: false });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      switch (topic) {
        case "ORDER_CREATED":
          console.log({
            value: message.value?.toString(),
          });
          break;
      }
      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (Number(message.offset) + 1).toString(),
        },
      ]);
      await consumer.disconnect();
    },
  });
};
