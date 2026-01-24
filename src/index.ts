import fs from "fs";
import { createServer } from "node:http";
import path from "path";
import { Server } from "socket.io";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;

// HTTP server
const server = createServer((req, res) => {
  try {
    res.setHeader("Content-Type", "text/html");
    res.end(fs.readFileSync(path.join(__dirname, "./page.html"), "utf8"));
  } catch (error) {
    res.end(`Error: ${error}`);
  }
});

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["https://chat.marker.cx.ua", "http://localhost:5173"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("ping", () => {
    socket.emit("pong");
  });

  socket.on("chat message", (msg, callback) => {
    socket.broadcast.emit("chat message", msg);
    callback?.();
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
