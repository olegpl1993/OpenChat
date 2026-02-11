import http from "http";
import type { AuthBody } from "../../types/types";
import { authService } from "./auth.service";
import { parseBody } from "./parseBody.util";

export async function authRoutes(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<boolean> {
  if (req.method === "POST" && req.url === "/api/register") {
    try {
      const body = await parseBody<AuthBody>(req);
      const result = await authService.register(body);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.writeHead(err.message === "User exists" ? 409 : 400);
        res.end(err.message);
        return true;
      }
    }
  }

  if (req.method === "POST" && req.url === "/api/login") {
    try {
      const body = await parseBody<AuthBody>(req);
      const { user, token } = await authService.login(body);

      res.writeHead(200, {
        "Content-Type": "application/json",
        "Set-Cookie": authService.buildAuthCookie(token),
      });

      res.end(JSON.stringify(user));
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.writeHead(401);
        res.end(err.message);
        return true;
      }
    }
  }

  if (req.method === "GET" && req.url === "/api/me") {
    const cookie = req.headers.cookie ?? "";
    const token = cookie.match(/token=([^;]+)/)?.[1];

    if (!token) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ loggedIn: false }));
      return true;
    }

    try {
      const payload = authService.verifyToken(token);

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
      "Set-Cookie": authService.clearCookie(),
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ success: true }));
    return true;
  }

  return false;
}
