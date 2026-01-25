import fs from "fs";
import http from "node:http";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;

// HTTP server (HTML)
const server = http.createServer((req, res) => {
  if (req.url === "/client.js") {
    res.setHeader("Content-Type", "application/javascript");
    res.end(fs.readFileSync(path.join(__dirname, "client.js"), "utf8"));
    return;
  }

  res.setHeader("Content-Type", "text/html");
  res.end(fs.readFileSync(path.join(__dirname, "./page.html"), "utf8"));
});

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("User connected");

  ws.on("message", (data: Buffer) => {
    const msg = JSON.parse(data.toString());

    // ping / pong
    if (msg.type === "ping") {
      ws.send(JSON.stringify({ type: "pong" }));
      return;
    }

    // chat message
    if (msg.type === "chat") {
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify(msg));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
