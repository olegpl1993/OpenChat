import { ResultSetHeader, RowDataPacket } from "mysql2";
import { MessageType } from "../../types/types";
import { db } from "./db";

export type MessageDBRow = RowDataPacket & MessageType;

export const messageRepository = {
async create(
  user: { userId: number; username: string },
  text: string,
  dialog_id?: number,
): Promise<MessageType> {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO messages (user, text, user_id, dialog_id)
     VALUES (?, ?, ?, ?)`,
    [user.username, text, user.userId, dialog_id ?? null],
  );

  const message = await messageRepository.findById(result.insertId);

  if (!message) {
    throw new Error("Failed to create message");
  }

  return message;
},

  async findById(id: number): Promise<MessageType | null> {
    const [rows] = await db.query<MessageDBRow[]>(
      "SELECT * FROM messages WHERE id = ?",
      [id],
    );
    return rows[0] ?? null;
  },

  async deleteById(id: number): Promise<boolean> {
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM messages WHERE id = ?",
      [id],
    );

    return result.affectedRows > 0;
  },

  async deleteByDialogId(dialogId: number): Promise<number> {
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM messages WHERE dialog_id = ?",
      [dialogId],
    );

    return result.affectedRows;
  },

  async updateText(id: number, text: string): Promise<boolean> {
    const [result] = await db.query<ResultSetHeader>(
      "UPDATE messages SET text = ?, edited = 1 WHERE id = ?",
      [text, id],
    );

    return result.affectedRows > 0;
  },

  async findHistory(params: {
    beforeId?: number;
    search?: string;
    dialogId?: number;
    limit?: number;
  }): Promise<MessageType[]> {
    const { beforeId, search, dialogId, limit = 20 } = params;

    let sql = "SELECT * FROM messages";
    const conditions: string[] = [];
    const queryParams: (number | string)[] = [];

    if (beforeId !== undefined) {
      conditions.push("id < ?");
      queryParams.push(beforeId);
    }

    if (search) {
      conditions.push("user = ?");
      queryParams.push(search);
    }

    if (dialogId !== undefined) {
      conditions.push("dialog_id = ?");
      queryParams.push(dialogId);
    } else {
      conditions.push("dialog_id IS NULL");
    }

    if (conditions.length) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY id DESC LIMIT ?";
    queryParams.push(limit);

    const [rows] = await db.query<MessageDBRow[]>(sql, queryParams);

    return rows.reverse();
  },
};
