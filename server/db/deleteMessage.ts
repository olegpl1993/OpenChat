import { db } from "./db";

export async function deleteMessage(id: number): Promise<void> {
  await db.query("DELETE FROM messages WHERE id = ?", [id]);
}