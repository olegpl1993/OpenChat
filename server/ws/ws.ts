import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { WSData } from "../../types/types";
import { chatService } from "./chat.service";

export function setupWebSocket(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  const broadcastUsers = () => {
    const users = chatService.getOnlineUsers();
    wss.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN) {
        c.send(JSON.stringify({ type: "users", users }));
      }
    });
  };

  server.on("upgrade", (req, socket, head) => {
    if (req.url?.startsWith("/ws")) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else socket.destroy();
  });

  wss.on("connection", async (ws: WebSocket) => {
    try {
      const history = await chatService.getInitialHistory();
      ws.send(
        JSON.stringify({ type: "history", messages: history, initial: true }),
      );
    } catch (err) {
      console.error("History load failed:", err);
      ws.send(JSON.stringify({ type: "error", code: "HISTORY_LOAD_FAILED" }));
      ws.close(1011, "Server error");
    }

    ws.on("message", async (data: Buffer) => {
      let wsData: WSData;

      try {
        wsData = JSON.parse(data.toString());
      } catch {
        ws.send(JSON.stringify({ type: "error" }));
        return;
      }

      try {
        if (wsData.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
          return;
        }

        if (wsData.type === "auth") {
          chatService.auth(ws, wsData.user);
          broadcastUsers();
          return;
        }

        if (wsData.type === "chat") {
          const message = await chatService.saveMessage(ws, wsData.messages[0]);

          wss.clients.forEach((c) => {
            if (c.readyState === WebSocket.OPEN) {
              c.send(JSON.stringify({ type: "chat", messages: [message] }));
            }
          });
          return;
        }

        if (wsData.type === "getHistory") {
          const history = await chatService.getHistory(
            wsData.beforeId,
            wsData.search,
          );
          ws.send(
            JSON.stringify({
              type: "history",
              messages: history,
              initial: !wsData.beforeId,
            }),
          );
        }
      } catch {
        ws.send(JSON.stringify({ type: "error" }));
      }
    });

    ws.on("close", () => {
      chatService.disconnect(ws);
      broadcastUsers();
    });
  });

  return wss;
}
