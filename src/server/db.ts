import dotenv from "dotenv";
import mysql from "mysql2";
import { Message } from "./types";

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

export function getMessages(): Promise<Message[]> {
  return new Promise((resolve, reject) => {
    connection.query<Message[]>("SELECT * FROM messages ORDER BY created_at ASC", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
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
