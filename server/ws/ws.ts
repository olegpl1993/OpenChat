import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { ClientWSData } from "../../types/types";
import { authService } from "../api/auth.service";
import { chatService } from "./chat.service";

export function setupWebSocket(server: http.Server): WebSocketServer {
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
        wss.emit("connection", ws, payload.username);
      });
    } catch {
      socket.destroy();
    }
  });

  wss.on("connection", async (ws: WebSocket, username: string) => {
    chatService.auth(ws, username);
    broadcastUsers();
    try {
      const history = await chatService.getInitialHistory();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "server_history",
            messages: history,
            initial: true,
          }),
        );
      }
    } catch (err: unknown) {
      console.error("History load failed:", err);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "server_error",
            message: "History load failed",
            error: err,
          }),
        );
        ws.close(1011, "Server error");
      }
    }

    ws.on("message", async (data: Buffer) => {
      let wsData: ClientWSData;
      try {
        wsData = JSON.parse(data.toString());
      } catch (err: unknown) {
        ws.send(
          JSON.stringify({
            type: "server_error",
            message: "Invalid data",
            error: err,
          }),
        );
        return;
      }

      try {
        if (wsData.type === "client_chat") {
          const message = await chatService.saveMessage(ws, wsData.messageText);
          wss.clients.forEach((c) => {
            if (c.readyState === WebSocket.OPEN) {
              c.send(JSON.stringify({ type: "server_chat", message: message }));
            }
          });
          return;
        }

        if (wsData.type === "client_history") {
          const history = await chatService.getHistory(
            wsData.beforeId,
            wsData.search,
          );
          ws.send(
            JSON.stringify({
              type: "server_history",
              messages: history,
              initial: !wsData.beforeId,
            }),
          );
        }

        if (wsData.type === "client_deleteMessage") {
          await chatService.deleteMessage(ws, wsData.id);
          wss.clients.forEach((c) => {
            if (c.readyState === WebSocket.OPEN) {
              c.send(
                JSON.stringify({ type: "server_deleteMessage", id: wsData.id }),
              );
            }
          });
          return;
        }

        if (wsData.type === "client_editMessage") {
          const updated = await chatService.editMessage(
            ws,
            wsData.id,
            wsData.text,
          );
          wss.clients.forEach((c) => {
            if (c.readyState === WebSocket.OPEN) {
              c.send(
                JSON.stringify({
                  type: "server_editMessage",
                  message: updated,
                }),
              );
            }
          });
          return;
        }
      } catch (err: unknown) {
        ws.send(
          JSON.stringify({
            type: "server_error",
            message: "Server error",
            error: err,
          }),
        );
      }
    });

    ws.on("close", () => {
      chatService.disconnect(ws);
      broadcastUsers();
    });
  });

  return wss;
}
