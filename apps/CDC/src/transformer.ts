import { producer } from "./kafka-producer";

import { KafkaJSError } from "kafkajs";

class InvalidEventError extends Error {}

import { eventExportDTO } from "@shared/types";
import {
  LogicalReplicationService,
  PgoutputPlugin,
} from "pg-logical-replication";

import { OutboxEvent } from "@shared/types";

import dotenv from "dotenv";

dotenv.config();

const slot = "order_outbox_slot";

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await service.stop();
  process.exit();
});

const plugin = new PgoutputPlugin({
  publicationNames: ["order_publication"],
  protoVersion: 1,
});

const service = new LogicalReplicationService(
  {
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    user: process.env.PG_USER,
    password: "1234",
    database: process.env.PG_DATABASE,
  },
  {
    acknowledge: {
      auto: false,
      timeoutSeconds: 10,
    },
  },
);

service.on("data", async (lsn: string, message: any) => {
  try {
    if (message.tag !== "insert") {
      await service.acknowledge(lsn);
      return;
    }

    if (message.relation.name !== "outbox") {
      await service.acknowledge(lsn);
      return;
    }

    const rawEvent = message.new;

    const event: OutboxEvent = {
      ...rawEvent,
      payload:
        typeof rawEvent.payload === "string"
          ? JSON.parse(rawEvent.payload)
          : rawEvent.payload,
    };

    if (!event.event_type || !event.payload) {
      throw new InvalidEventError("Invalid event format");
    }
    console.log(event);
    console.log("topic", event.event_type);

    await producer.send({
      topic: event.event_type,
      messages: [
        {
          key: event.id,
          value: JSON.stringify(event.payload),
        },
      ],
    });

    await service.acknowledge(lsn);
    console.log(`Acknowledged LSN: ${lsn}`);
  } catch (error: any) {
    if (error instanceof InvalidEventError) {
      console.error("Invalid event. Sending to dead letter.");

      await producer.send({
        topic: "dead_letter",
        messages: [
          {
            key: "invalid",
            value: JSON.stringify(message.new),
          },
        ],
      });

      await service.acknowledge(lsn);
      return;
    }

    if (error instanceof KafkaJSError) {
      console.error("Kafka error. Will retry via replay.");
      return;
    }

    console.error("Unknown error:", error);
  }
});
export const startStreaming = async () => {
  service
    .subscribe(plugin, slot)
    .then(() => console.log(`Streaming started on slot: ${slot}`))
    .catch((err) => console.error("Streaming Error:", err));
};
