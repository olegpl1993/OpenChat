import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "./db";

export interface Dialog {
  id: number;
  user1_id: number;
  user2_id: number;
  created_at: string;
}

export type DialogDBRow = RowDataPacket & Dialog;

export interface DialogListItem {
  dialog_id: number;
  user_id: number;
  username: string;
  public_key: string;
}

export type DialogListItemRow = RowDataPacket & DialogListItem;

export const dialogRepository = {
  async create(user1Id: number, user2Id: number): Promise<Dialog> {
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO dialogs (user1_id, user2_id) VALUES (?, ?)",
      [user1Id, user2Id],
    );

    const dialog = await dialogRepository.findById(result.insertId);

    if (!dialog) {
      throw new Error("Failed to create dialog");
    }

    return dialog;
  },

  async findById(id: number): Promise<Dialog | null> {
    const [rows] = await db.query<DialogDBRow[]>(
      "SELECT * FROM dialogs WHERE id = ?",
      [id],
    );

    return rows[0] ?? null;
  },

  async deleteById(id: number): Promise<boolean> {
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM dialogs WHERE id = ?",
      [id],
    );

    return result.affectedRows > 0;
  },

  async findDialogsByUserId(userId: number): Promise<DialogListItem[]> {
    const [rows] = await db.query<DialogListItemRow[]>(
      `
    SELECT 
      d.id AS dialog_id,
      u.id AS user_id,
      u.username,
      u.public_key
    FROM dialogs d
    JOIN users u 
      ON u.id = IF(d.user1_id = ?, d.user2_id, d.user1_id)
    WHERE d.user1_id = ? OR d.user2_id = ?
    `,
      [userId, userId, userId],
    );

    return rows;
  },

  async findDialogBetweenUsers(
    user1Id: number,
    user2Id: number,
  ): Promise<Dialog | null> {
    const [rows] = await db.query<DialogDBRow[]>(
      `
    SELECT * FROM dialogs
    WHERE 
      (user1_id = ? AND user2_id = ?)
      OR
      (user1_id = ? AND user2_id = ?)
    LIMIT 1
    `,
      [user1Id, user2Id, user2Id, user1Id],
    );

    return rows[0] ?? null;
  },
};
