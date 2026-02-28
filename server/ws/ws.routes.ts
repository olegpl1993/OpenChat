import { WebSocket, WebSocketServer } from "ws";
import type { ClientWSData } from "../../types/types";
import { chatService } from "./chat.service";
import { wsHandlers } from "./ws.handlers";

export function wsRoutes(wss: WebSocketServer, broadcastUsers: () => void) {
  wss.on(
    "connection",
    async (
      ws: WebSocket,
      user: { userId: number; username: string; publicKey: string },
    ) => {
      chatService.auth(ws, user);
      broadcastUsers();

      try {
        const history = await chatService.getInitialHistory();
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "server_history",
              messages: history,
              initial: true,
            }),
          );
        }
      } catch (err: unknown) {
        ws.send(
          JSON.stringify({
            type: "server_error",
            message: err instanceof Error ? err.message : "History load failed",
          }),
        );
        ws.close(1011, "Server error");
      }

      const handlers = wsHandlers(wss);

      ws.on("message", async (data: Buffer) => {
        let wsData: ClientWSData;
        try {
          wsData = JSON.parse(data.toString());
        } catch (err) {
          ws.send(
            JSON.stringify({
              type: "server_error",
              message: err instanceof Error ? err.message : "Invalid data",
            }),
          );
          return;
        }

        const handler = handlers[wsData.type];
        if (!handler) {
          ws.send(
            JSON.stringify({
              type: "server_error",
              message: "Unknown message type",
            }),
          );
          return;
        }

        try {
          await handler(ws, wsData);
        } catch (err) {
          ws.send(
            JSON.stringify({
              type: "server_error",
              message:
                err instanceof Error ? err.message : "Message handler failed",
            }),
          );
        }
      });

      ws.on("close", () => {
        chatService.disconnect(ws);
        broadcastUsers();
      });
    },
  );
}
