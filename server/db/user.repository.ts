import { db } from "./db";
import { UserRow } from "../../types/types";

export const userRepository = {
  async findByUsername(username: string) {
    const [rows] = await db.query<UserRow[]>(
      "SELECT id, username, password_hash FROM users WHERE LOWER(username) = LOWER(?)",
      [username],
    );
    return rows[0] ?? null;
  },

  async create(username: string, passwordHash: string) {
    await db.query(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, passwordHash],
    );
  },
};