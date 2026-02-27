import { WebSocket, WebSocketServer } from "ws";
import type { ClientWSData } from "../../types/types";
import { chatService } from "./chat.service";
import { dialogService } from "./dialog.service";

export function wsHandlers(wss: WebSocketServer) {
  return {
    client_dialogs: async (ws: WebSocket, data: ClientWSData) => {
      if (data.type !== "client_dialogs") return;
      const dialogs = await dialogService.getDialogs(ws);
      ws.send(
        JSON.stringify({
          type: "server_dialogs",
          dialogs,
        }),
      );
    },

    client_createDialog: async (ws: WebSocket, data: ClientWSData) => {
      if (data.type !== "client_createDialog") return;
      await dialogService.createDialog(ws, data.user_id);
      const dialogs = await dialogService.getDialogs(ws);
      ws.send(
        JSON.stringify({
          type: "server_dialogs",
          dialogs,
        }),
      );
    },

    client_deleteDialog: async (ws: WebSocket, data: ClientWSData) => {
      if (data.type !== "client_deleteDialog") return;
      await dialogService.deleteDialog(ws, data.dialog_id);
      await chatService.deleteMessagesByDialogId(data.dialog_id);
      const dialogs = await dialogService.getDialogs(ws);
      ws.send(
        JSON.stringify({
          type: "server_dialogs",
          dialogs,
        }),
      );
    },

    client_chat: async (ws: WebSocket, data: ClientWSData) => {
      if (data.type !== "client_chat") return;

      const message = await chatService.saveMessage(
        ws,
        data.messageText!,
        data.dialog_id,
      );

      if (data.dialog_id) {
        const userIds = await dialogService.getDialogUsers(data.dialog_id);
        const clients = chatService.getClientsByUserIds(userIds);

        clients.forEach((client) => {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(
              JSON.stringify({
                type: "server_chat",
                message,
              }),
            );
          }
        });
        return;
      }

      wss.clients.forEach((c) => {
        if (c.readyState === WebSocket.OPEN) {
          c.send(
            JSON.stringify({
              type: "server_chat",
              message,
            }),
          );
        }
      });
    },

    client_deleteMessage: async (ws: WebSocket, data: ClientWSData) => {
      if (data.type !== "client_deleteMessage") return;
      await chatService.deleteMessage(ws, data.id);
      wss.clients.forEach((c) => {
        if (c.readyState === WebSocket.OPEN) {
          c.send(JSON.stringify({ type: "server_deleteMessage", id: data.id }));
        }
      });
    },

    client_editMessage: async (ws: WebSocket, data: ClientWSData) => {
      if (data.type !== "client_editMessage") return;
      const updated = await chatService.editMessage(ws, data.id, data.text);
      wss.clients.forEach((c) => {
        if (c.readyState === WebSocket.OPEN) {
          c.send(
            JSON.stringify({ type: "server_editMessage", message: updated }),
          );
        }
      });
    },

    client_history: async (ws: WebSocket, data: ClientWSData) => {
      if (data.type !== "client_history") return;
      const history = await chatService.getHistory(
        data.beforeId,
        data.search,
        data.dialog_id,
      );
      ws.send(
        JSON.stringify({
          type: "server_history",
          messages: history,
          initial: !data.beforeId,
        }),
      );
    },
  };
}
