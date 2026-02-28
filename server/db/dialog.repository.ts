import { ResultSetHeader } from "mysql2";
import { DialogDBRow } from "../../types/types";
import { db } from "./db";

export const dialogRepository = {
  async getUserDialogs(userId: number) {
    const [rows] = await db.query<[]>(
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

  async getDialogById(id: number) {
    const [rows] = await db.query<DialogDBRow[]>(
      "SELECT * FROM dialogs WHERE id = ?",
      [id],
    );

    return rows[0] ?? null;
  },

  async createDialog(user1Id: number, user2Id: number) {
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO dialogs (user1_id, user2_id) VALUES (?, ?)",
      [user1Id, user2Id],
    );

    return {
      id: result.insertId,
      user1_id: user1Id,
      user2_id: user2Id,
    };
  },

  async deleteDialog(id: number) {
    await db.query("DELETE FROM dialogs WHERE id = ?", [id]);
  },

  async findDialogBetweenUsers(user1Id: number, user2Id: number) {
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
