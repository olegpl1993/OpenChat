import fs from "fs";
import http from "node:http";
import { fileURLToPath } from "node:url";
import path from "path";
import { WebSocketServer } from "ws";

// Для dev (ESM) и prod (CJS)
const __dirnameCJS =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

// HTTP server
const server = http.createServer((req, res) => {
  let filePath: string;
  let contentType: string;

  if (req.url === "/" || req.url === "/index.html") {
    filePath = path.join(__dirnameCJS, "client/page.html");
    contentType = "text/html";
  } else {
    // Отдаём любые файлы из корня (css, js и др.)
    filePath = path.join(__dirnameCJS, req.url!);
    const ext = path.extname(filePath);

    switch (ext) {
      case ".css":
        contentType = "text/css";
        break;
      case ".js":
        contentType = "application/javascript";
        break;
      case ".html":
        contentType = "text/html";
        break;
      default:
        contentType = "application/octet-stream";
    }
  }

  // Проверка существования файла
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end("File not found");
      return;
    }
    res.setHeader("Content-Type", contentType);
    res.end(data);
  });
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
