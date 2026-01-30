import fs from "fs";
import http from "http";
import path from "path";
import { setupWebSocket } from "./ws";

const __dirname = path.resolve();
export const PORT = process.env.PORT || 4000;

// __dirname уже указывает на dist/
const server = http.createServer((req, res) => {
  // для "/" отдаём index.html, иначе отдаем файл по req.url
  let filePath =
    req.url === "/"
      ? path.join(__dirname, "index.html")
      : path.join(__dirname, req.url!);

  const ext = path.extname(filePath);
  const types: Record<string, string> = {
    ".js": "application/javascript",
    ".css": "text/css",
    ".html": "text/html",
    ".json": "application/json",
    ".svg": "image/svg+xml",
  };

  // Если файла нет или это не файл — отдаём index.html (SPA)
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(__dirname, "index.html");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end("Server error");
    }

    res.writeHead(200, {
      "Content-Type": types[ext] || "text/plain",
      "Cache-Control": ext === ".html" ? "no-cache" : "max-age=31536000",
    });
    res.end(data);
  });
});

setupWebSocket(server);

server.listen(PORT, () => console.log("🚀 Server on http://localhost:4000"));
