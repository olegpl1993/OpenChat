import { db } from "./db";
import { DBrequestType, MessageType } from "../../types/types";

export const messageRepository = {
  async save(user: string, text: string): Promise<void> {
    await db.query("INSERT INTO messages (user, text) VALUES (?, ?)", [
      user,
      text,
    ]);
  },

  async delete(id: number): Promise<void> {
    await db.query("DELETE FROM messages WHERE id = ?", [id]);
  },

  async getHistory(
    beforeId?: number,
    search?: string,
    limit = 20,
  ): Promise<MessageType[]> {
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

    const [rows] = await db.query<DBrequestType[]>(sql, params);
    return rows.reverse();
  },
};