import dotenv from "dotenv";
import http from "http";
import jwt from "jsonwebtoken";
import { AuthBody } from "../../types/types";
import { login, register } from "./auth";
import { parseBody } from "./parseBody.util";

dotenv.config();
export const SECRET = process.env.JWT_SECRET!;

export async function api(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<boolean> {
  if (req.method === "POST" && req.url === "/api/register") {
    try {
      const body = await parseBody<AuthBody>(req);
      const result = await register(body);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
      return true;
    } catch (err: unknown) {
      let message = "Server error";
      if (err instanceof Error) message = err.message;

      res.writeHead(message === "User exists" ? 409 : 400);
      res.end(message);
      return true;
    }
  }

  if (req.method === "POST" && req.url === "/api/login") {
    try {
      const body = await parseBody<AuthBody>(req);
      const result = await login(body);

      const token = jwt.sign(result, SECRET, {
        expiresIn: "7d",
      });

      res.writeHead(200, {
        "Content-Type": "application/json",
        "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`,
      });
      res.end(JSON.stringify(result));
      return true;
    } catch (err: unknown) {
      let message = "Invalid credentials";
      if (err instanceof Error) message = err.message;

      res.writeHead(401);
      res.end(message);
      return true;
    }
  }

  if (req.method === "GET" && req.url === "/api/me") {
    const cookie = req.headers.cookie;
    if (!cookie) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ loggedIn: false }));
      return true;
    }

    const match = cookie.match(/token=([^;]+)/);
    const token = match?.[1];

    if (!token) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ loggedIn: false }));
      return true;
    }

    try {
      const payload = jwt.verify(token, SECRET) as { username: string };
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ loggedIn: true, username: payload.username }));
      return true;
    } catch {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ loggedIn: false }));
      return true;
    }
  }

  if (req.method === "POST" && req.url === "/api/logout") {
    res.writeHead(200, {
      "Set-Cookie": "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict",
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ success: true }));
    return true;
  }

  return false;
}
