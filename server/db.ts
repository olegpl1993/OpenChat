import dotenv from "dotenv";
import mysql, { Connection } from "mysql2";
import { DBrequestType, MessageType } from "../types/types";

dotenv.config();

let connection: Connection | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

function createConnection() {
  if (connection) return;

  connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  connection.connect((err) => {
    if (err) {
      console.error("❌ MySQL connection error:", err.message);
      scheduleReconnect();
      return;
    }
    console.log("✅ MySQL connected");
  });

  connection.on("error", (err) => {
    console.error("⚠️ MySQL error:", err.code || err.message);

    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.fatal) {
      console.log("♻️ MySQL disconnected, reconnecting...");
      connection = null;
      scheduleReconnect();
    } else {
      console.error("Unhandled MySQL error, but server continues running");
    }
  });
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    createConnection();
  }, 2000);
}

createConnection();

export async function getMessages(
  beforeId?: number,
  search?: string,
  limit = 20,
): Promise<MessageType[]> {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM messages";
    const conditions: string[] = [];
    const params: (number | string)[] = [];

    if (beforeId !== undefined) {
      conditions.push("id < ?");
      params.push(beforeId);
    }
    if (search) {
      conditions.push("user = ?");
      params.push(search);
    }
    if (conditions.length) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY id DESC LIMIT ?";
    params.push(limit);

    if (!connection) {
      return reject(new Error("MySQL connection is not established"));
    }

    connection.query<DBrequestType[]>(sql, params, (err, rows) => {
      if (err) return reject(err);

      resolve(rows.reverse());
    });
  });
}

export function saveMessage(user: string, text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!connection) {
      return reject(new Error("MySQL connection is not established"));
    }
    connection.query(
      "INSERT INTO messages (user, text) VALUES (?, ?)",
      [user, text],
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });
}

export function deleteMessage(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!connection) {
      return reject(new Error("MySQL connection is not established"));
    }
    connection.query("DELETE FROM messages WHERE id = ?", [id], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
