import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "./db";

export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
  public_key: string;
}

export type UserDBRow = RowDataPacket & User;

export const userRepository = {
  async create(
    username: string,
    passwordHash: string,
    publicKey: string,
  ): Promise<User> {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO users (username, password_hash, public_key)
       VALUES (?, ?, ?)`,
      [username, passwordHash, publicKey],
    );

    const user = await userRepository.findById(result.insertId);

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  },

  async findById(id: number): Promise<User | null> {
    const [rows] = await db.query<UserDBRow[]>(
      "SELECT * FROM users WHERE id = ?",
      [id],
    );

    return rows[0] ?? null;
  },

  async deleteById(id: number): Promise<boolean> {
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM users WHERE id = ?",
      [id],
    );

    return result.affectedRows > 0;
  },

  async findByUsername(username: string): Promise<User | null> {
    const [rows] = await db.query<UserDBRow[]>(
      "SELECT * FROM users WHERE LOWER(username) = LOWER(?)",
      [username],
    );

    return rows[0] ?? null;
  },

  async updatePublicKey(userId: number, publicKey: string): Promise<boolean> {
    const [result] = await db.query<ResultSetHeader>(
      "UPDATE users SET public_key = ? WHERE id = ?",
      [publicKey, userId],
    );

    return result.affectedRows > 0;
  },
};
