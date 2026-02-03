import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { WSData } from "../types/types";
import { getMessages, saveMessage } from "./db";

export function setupWebSocket(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: WebSocket) => {
    console.log("User connected");

    try {
      const history = await getMessages();

      ws.send(
        JSON.stringify({
          type: "history",
          messages: history,
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

      if (wsData.type === "chat") {
        try {
          await saveMessage(wsData.messages[0].user, wsData.messages[0].text);
        } catch (err) {
          console.error("DB error:", err);
          ws.send(JSON.stringify({ type: "error" }));
          return;
        }

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(wsData));
          }
        });
      }

      if (wsData.type === "getHistory") {
        try {
          const history = await getMessages(wsData.beforeId, wsData.search);
          ws.send(JSON.stringify({ type: "history", messages: history }));
        } catch (err) {
          console.error("DB error:", err);
          ws.send(JSON.stringify({ type: "error" }));
          return;
        }
      }
    });

    ws.on("close", () => {
      console.log("User disconnected");
    });
  });

  console.log("✅ WebSocket server setup complete");
  return wss;
}
