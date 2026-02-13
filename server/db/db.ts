import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Successfully connected to MySQL");
    connection.release();
  } catch {
    console.error("❌ Error connecting to MySQL");
  }
})();
