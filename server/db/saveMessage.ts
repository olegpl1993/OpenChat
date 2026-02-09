import { db } from "./db";

export async function saveMessage(user: string, text: string): Promise<void> {
  await db.query("INSERT INTO messages (user, text) VALUES (?, ?)", [
    user,
    text,
  ]);
}