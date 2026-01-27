import { WebSocketServer, WebSocket } from "ws";

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("User connected");

    ws.on("message", (data: Buffer) => {
      const msg = JSON.parse(data.toString());

      console.log(msg);

      if (msg.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
        return;
      }

      if (msg.type === "chat") {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
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