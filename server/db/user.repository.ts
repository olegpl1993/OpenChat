import { RowDataPacket } from "mysql2";
import { db } from "./db";

export type UserRow = RowDataPacket & {
  id: number;
  username: string;
  password_hash: string;
  created_at: Date;
  public_key: string;
};

export const userRepository = {
  async findByUsername(username: string) {
    const [rows] = await db.query<UserRow[]>(
      "SELECT * FROM users WHERE LOWER(username) = LOWER(?)",
      [username],
    );
    return rows[0] ?? null;
  },

  async create(username: string, passwordHash: string, publicKey: string) {
    await db.query(
      "INSERT INTO users (username, password_hash, public_key) VALUES (?, ?, ?)",
      [username, passwordHash, publicKey],
    );
  },

  async updatePublicKey(userId: number, publicKey: string) {
    await db.query("UPDATE users SET public_key = ? WHERE id = ?", [
      publicKey,
      userId,
    ]);
  },
};
