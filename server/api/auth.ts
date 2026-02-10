import bcrypt from "bcryptjs";
import { ResultSetHeader } from "mysql2";
import { AuthBody, UserRow } from "../../types/types";
import { db } from "../db/db";

export async function register({ username, password }: AuthBody) {
  if (!username || !password) throw new Error("Missing fields");
  const [existing] = await db.query<UserRow[]>(
    "SELECT id FROM users WHERE LOWER(username) = LOWER(?)",
    [username],
  );
  if (existing.length) throw new Error("User exists");
  const hash = await bcrypt.hash(password, 10);
  await db.query<ResultSetHeader>(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    [username, hash],
  );

  return { username };
}

export async function login({ username, password }: AuthBody) {
  const [rows] = await db.query<UserRow[]>(
    "SELECT password_hash, username FROM users WHERE LOWER(username) = LOWER(?)",
    [username],
  );
  if (!rows.length || !rows[0].password_hash)
    throw new Error("Invalid credentials");
  const valid = await bcrypt.compare(password, rows[0].password_hash);
  if (!valid) throw new Error("Invalid credentials");

  return { username: rows[0].username };
}
