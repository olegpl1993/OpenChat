import { ResultSetHeader } from "mysql2";
import { DBrequestType, MessageType } from "../../types/types";
import { db } from "./db";

export const messageRepository = {
  async saveMessage(
    user: { userId: number; username: string },
    text: string,
    dialog_id?: number,
  ): Promise<number> {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO messages (user, text, user_id, dialog_id)
     VALUES (?, ?, ?, ?)`,
      [user.username, text, user.userId, dialog_id ?? null],
    );

    return result.insertId;
  },

  async getMessageById(id: number): Promise<MessageType | null> {
    const [rows] = await db.query<DBrequestType[]>(
      "SELECT * FROM messages WHERE id = ?",
      [id],
    );
    return rows[0] ?? null;
  },

  async delete(id: number): Promise<void> {
    await db.query("DELETE FROM messages WHERE id = ?", [id]);
  },

  async deleteByDialogId(dialog_id: number): Promise<void> {
    await db.query("DELETE FROM messages WHERE dialog_id = ?", [dialog_id]);
  },

  async update(id: number, text: string) {
    await db.query("UPDATE messages SET text = ?, edited = 1 WHERE id = ?", [
      text,
      id,
    ]);
  },

  async getHistory(
    beforeId?: number,
    search?: string,
    dialog_id?: number,
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

    if (dialog_id !== undefined) {
      conditions.push("dialog_id = ?");
      params.push(dialog_id);
    } else {
      conditions.push("dialog_id IS NULL");
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
