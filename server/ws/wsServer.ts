import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { authService } from "../api/auth.service";
import { chatService } from "./chat.service";
import { wsRoutes } from "./ws.routes";

export function wsServer(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  const broadcastUsers = () => {
    const users = chatService.getOnlineUsers();
    wss.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN) {
        c.send(JSON.stringify({ type: "server_users", users }));
      }
    });
  };

  server.on("upgrade", (req, socket, head) => {
    if (!req.url?.startsWith("/ws")) {
      socket.destroy();
      return;
    }
    const cookie = req.headers.cookie;
    const match = cookie?.match(/token=([^;]+)/);
    const token = match?.[1];
    if (!token) {
      socket.destroy();
      return;
    }
    try {
      const payload = authService.verifyToken(token);
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, payload);
      });
    } catch {
      socket.destroy();
    }
  });

  wsRoutes(wss, broadcastUsers);

  return wss;
}
