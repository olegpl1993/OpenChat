import jwt from "jsonwebtoken";
import { ResultSetHeader } from "mysql2";
import { db } from "../db/db";
import { AuthBody, UserRow } from "../../types/types";
import bcrypt from "bcryptjs";

const SECRET = "SECRET_KEY";

export async function register({ username, password }: AuthBody) {
  if (!username || !password) throw new Error("Missing fields");

  const [existing] = await db.query<UserRow[]>(
    "SELECT id FROM users WHERE username = ?",
    [username]
  );

  if (existing.length) throw new Error("User exists");

  const hash = await bcrypt.hash(password, 10);

  await db.query<ResultSetHeader>(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    [username, hash]
  );

  const token = jwt.sign({ username }, SECRET, { expiresIn: "7d" });

  return { token, username };
}

export async function login({ username, password }: AuthBody) {
  const [rows] = await db.query<UserRow[]>(
    "SELECT password_hash FROM users WHERE username = ?",
    [username]
  );

  if (!rows.length || !rows[0].password_hash) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, rows[0].password_hash);
  if (!valid) throw new Error("Invalid credentials");

  const token = jwt.sign({ username }, SECRET, { expiresIn: "7d" });

  return { token, username };
}