import dotenv from "dotenv";
import mysql from "mysql2";
import { DBrequestType, MessageType } from "../types/types";

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err.message);
    return;
  }
  console.log("✅ MySQL connected");
});

export function getMessages(beforeId?: number, limit = 20): Promise<MessageType[]> {
  return new Promise((resolve, reject) => {
    let sql: string;
    let params: number[] = [];

    if (beforeId) {
      sql = "SELECT * FROM messages WHERE id < ? ORDER BY id DESC LIMIT ?";
      params = [beforeId, limit];
    } else {
      sql = "SELECT * FROM messages ORDER BY id DESC LIMIT ?";
      params = [limit];
    }

    connection.query<DBrequestType[]>(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows.reverse());
    });
  });
}

export function saveMessage(user: string, text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.query("INSERT INTO messages (user, text) VALUES (?, ?)", [user, text], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function deleteMessage(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.query("DELETE FROM messages WHERE id = ?", [id], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
