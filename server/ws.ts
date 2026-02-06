import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { WSData } from "../types/types";
import { getMessages, saveMessage } from "./db";

export function setupWebSocket(server: http.Server): WebSocketServer {
  const clients = new Map<WebSocket, string>();
  const wss = new WebSocketServer({ server });

  function broadcastUsers() {
    const users = [...clients.values()];

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "users", users }));
      }
    });
  }

  wss.on("connection", async (ws: WebSocket) => {
    console.log("User connected");

    try {
      const history = await getMessages();
      ws.send(
        JSON.stringify({
          type: "history",
          messages: history,
          initial: true,
        }),
      );
    } catch (err) {
      console.error("Failed to load history:", err);
    }

    ws.on("message", async (data: Buffer) => {
      let wsData: WSData;

      try {
        wsData = JSON.parse(data.toString());
      } catch {
        ws.send(JSON.stringify({ type: "error" }));
        return;
      }

      if (wsData.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
        return;
      }

      if (wsData.type === "auth") {
        clients.set(ws, wsData.user);
        broadcastUsers();
        return;
      }

      if (wsData.type === "chat") {
        const user = clients.get(ws);
        if (!user) return;

        try {
          await saveMessage(user, wsData.messages[0].text);
        } catch (err) {
          console.error("DB error:", err);
          ws.send(JSON.stringify({ type: "error" }));
          return;
        }

        const message = { ...wsData.messages[0], user };
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "chat", messages: [message] }));
          }
        });
      }

      if (wsData.type === "getHistory") {
        console.log("User requested history");
        try {
          const history = await getMessages(wsData.beforeId, wsData.search);
          if (wsData.beforeId) {
            ws.send(JSON.stringify({ type: "history", messages: history }));
          } else {
            ws.send(
              JSON.stringify({
                type: "history",
                messages: history,
                initial: true,
              }),
            );
          }
        } catch (err) {
          console.error("DB error:", err);
          ws.send(JSON.stringify({ type: "error" }));
          return;
        }
      }
    });

    ws.on("close", () => {
      console.log("User disconnected");
      clients.delete(ws);
      broadcastUsers();
    });
  });

  console.log("✅ WebSocket server setup complete");
  return wss;
}
