import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const __dirnameCJS =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export const PORT = process.env.PORT || 4000;

export function createServer() {
  const server = http.createServer((req, res) => {
    let filePath: string;
    let contentType: string;

    if (req.url === "/" || req.url === "/index.html") {
      filePath = path.join(__dirnameCJS, "client/page.html");
      contentType = "text/html";
    } else {
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

  return server;
}