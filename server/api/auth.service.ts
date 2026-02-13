import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import type { AuthBody } from "../../types/types";
import { userRepository } from "../db/user.repository";

dotenv.config();

const SECRET = process.env.JWT_SECRET!;
const TOKEN_AGE = 7 * 24 * 60 * 60;

export class AuthService {
  async register({ username, password }: AuthBody) {
    if (!username || !password) throw new Error("Missing fields");

    const existing = await userRepository.findByUsername(username);
    if (existing) throw new Error("User exists");

    const hash = await bcrypt.hash(password, 10);
    await userRepository.create(username, hash);

    return { username };
  }

  async login({ username, password }: AuthBody) {
    const user = await userRepository.findByUsername(username);

    if (!user || !user.password_hash) {
      throw new Error("Invalid credentials");
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error("Invalid credentials");

    const payload = { username: user.username };
    const token = jwt.sign(payload, SECRET, { expiresIn: "7d" });

    return { user: payload, token };
  }

  verifyToken(token: string) {
    return jwt.verify(token, SECRET) as { username: string };
  }

  buildAuthCookie(token: string) {
    return `token=${token}; HttpOnly; Path=/; Max-Age=${TOKEN_AGE}; SameSite=Strict`;
  }

  clearCookie() {
    return "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict";
  }
}

export const authService = new AuthService();
