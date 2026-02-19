import { pool } from "./db";
import { OrderDTO } from "@shared/types";

export const createOrder = async (order: OrderDTO) => {
  const { userId, productId, quantity, amount } = order;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const query = `
      INSERT INTO orders (user_id, product_id, quantity, amount)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
      RETURNING *;
    `;

    const res = await client.query(query, [
      userId,
      productId,
      quantity,
      amount,
    ]);

    if (res.rows.length === 0) {
      throw new Error("Duplicate order detected");
    }

    const newOrder = res.rows[0];
    const payload = JSON.stringify(newOrder);

    const outboxQuery = `
      INSERT INTO outbox (aggregate_id, aggregate_type, event_type, payload)
      VALUES ($1, 'ORDER', 'ORDER.CREATED', $2)
    `;

    await client.query(outboxQuery, [newOrder.id, payload]);

    await client.query("COMMIT");
    return newOrder;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transaction failed, rolled back:", error);
    throw error;
  } finally {
    client.release();
  }
};
