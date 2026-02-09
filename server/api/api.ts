import http from "http";
import { parseBody } from "./parseBody.util";
import { register, login } from "./auth";
import { AuthBody } from "../../types/types";

export async function api(
  req: http.IncomingMessage,
  res: http.ServerResponse
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

      res.writeHead(200, { "Content-Type": "application/json" });
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

  return false;
}