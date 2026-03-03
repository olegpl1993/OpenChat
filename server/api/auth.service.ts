import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../db/user.repository";

export type RegisterDTO = {
  username: string;
  password: string;
  publicKey: string;
};

export type LoginDTO = {
  username: string;
  password: string;
};

export type JWTPayload = {
  userId: number;
  username: string;
  publicKey: string;
};

const SECRET = process.env.JWT_SECRET!;
const TOKEN_AGE = 7 * 24 * 60 * 60;

export class AuthService {
  async register({ username, password, publicKey }: RegisterDTO) {
    if (!username || !password || !publicKey) {
      throw new Error("Missing fields");
    }

    const existing = await userRepository.findByUsername(username);
    if (existing) {
      throw new Error("User already exists");
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userRepository.create(username, hash, publicKey);

    return {
      id: user.id,
      username: user.username,
      publicKey: user.public_key,
    };
  }

  async login({ username, password }: LoginDTO) {
    const user = await userRepository.findByUsername(username);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      publicKey: user.public_key,
    };

    const token = jwt.sign(payload, SECRET, {
      expiresIn: TOKEN_AGE,
    });

    return { user: payload, token };
  }

  async updatePublicKey(userId: number, publicKey: string) {
    const updated = await userRepository.updatePublicKey(userId, publicKey);

    if (!updated) {
      throw new Error("User not found");
    }

    return true;
  }

  verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, SECRET) as JWTPayload;
    } catch {
      return null;
    }
  }

  buildAuthCookie(token: string) {
    return `token=${token}; HttpOnly; Path=/; Max-Age=${TOKEN_AGE}; SameSite=Strict; Secure`;
  }

  clearCookie() {
    return "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure";
  }
}

export const authService = new AuthService();
