export {};
const slot = "order_outbox_slot";
import {
  LogicalReplicationService,
  PgoutputPlugin,
} from "pg-logical-replication";
import { OutboxEvent } from "@shared/types";
import dotenv from "dotenv";
dotenv.config();

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
  if (message.tag === "insert" && message.relation.name === "outbox") {
    try {
      const event: OutboxEvent = message.new;

      console.log(`Processing Event [${event.event_type}] at LSN: ${lsn}`);
      console.log("Payload:", event.payload);

      // await service.acknowledge(lsn);
      console.log(`Successfully acknowledged LSN: ${lsn}`);
    } catch (error) {
      console.error("Failed to process event:");
    }
  }
});

// Start the subscription
export const startStreaming = async () => {
  service
    .subscribe(plugin, slot)
    .then(() => console.log(`Streaming started on slot: ${slot}`))
    .catch((err) => console.error("Streaming Error:", err));
};
