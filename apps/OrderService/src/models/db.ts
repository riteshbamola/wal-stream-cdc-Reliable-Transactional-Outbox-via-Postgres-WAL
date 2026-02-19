import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT),
});

export const connectDB = async () => {
  try {
    await pool.connect();
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
};
