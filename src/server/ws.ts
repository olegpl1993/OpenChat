import { WebSocket, WebSocketServer } from "ws";
import { saveMessage } from "./db";
import { Msg } from "./types";

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("User connected");

    ws.on("message", async (data: Buffer) => {
      let msg: Msg;

      try {
        msg = JSON.parse(data.toString());
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        return;
      }

      if (msg.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
        return;
      }

      if (msg.type === "chat") {
        if (!msg.name || !msg.message || msg.message.length > 1000) {
          ws.send(JSON.stringify({ type: "error", message: "Invalid message" }));
          return;
        }

        try {
          await saveMessage(msg.name, msg.message);
        } catch (err) {
          console.error("DB error:", err);
          ws.send(JSON.stringify({ type: "error", message: "DB error" }));
          return;
        }

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
          }
        });
      }
    });

    ws.on("close", () => {
      console.log("User disconnected");
    });
  });

  console.log("✅ WebSocket server setup complete");
  return wss;
}
