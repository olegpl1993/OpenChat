import fs from "fs";
import http from "http";
import path from "path";
import { setupWebSocket } from "./ws";
import { authRoutes } from "./api/auth.routes";

const __dirname = path.dirname(process.argv[1]);
export const PORT = process.env.PORT || 4000;

const server = http.createServer(async (req, res) => {
  const handled = await authRoutes(req, res);
  if (handled) return;

  const filePath =
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
    ".ico": "image/x-icon",
  };

  fs.readFile(filePath, (err, data) => {
    if (!err) {
      res.writeHead(200, {
        "Content-Type": types[ext] || "text/plain",
        "Cache-Control": ext === ".html" ? "no-cache" : "max-age=31536000",
      });
      return res.end(data);
    }

    if (err.code !== "ENOENT") {
      res.writeHead(500);
      return res.end("Server error");
    }

    const indexPath = path.join(__dirname, "index.html");

    fs.readFile(indexPath, (indexErr, indexData) => {
      if (indexErr) {
        res.writeHead(500);
        return res.end("Server error");
      }

      res.writeHead(200, {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache",
      });
      res.end(indexData);
    });
  });
});

setupWebSocket(server);

server.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
