import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "order-service",
  brokers: ["localhost:9092"],
});

const createTopics = async () => {
  const admin = kafka.admin();
  await admin.connect();

  await admin.createTopics({
    topics: [{ topic: "Order_Created", numPartitions: 1 }],
  });

  await admin.disconnect();
};

const consumer = kafka.consumer({ groupId: "order-service" });

const connectKafka = async () => {
  await createTopics();
  await consumer.connect();

  await consumer.subscribe({ topic: "Order_Created", fromBeginning: false });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      switch (topic) {
        case "Order_Created":
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
