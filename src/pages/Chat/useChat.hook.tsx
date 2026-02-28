import { useCallback, useEffect, useRef } from "react";
import type {
  ClientWSData,
  Dialog,
  MessageType,
  ServerWSData,
  User,
} from "../../../types/types";
import { cryptoService } from "../../services/crypto.service";

type Handlers = {
  onHistory: (messages: MessageType[], initial?: boolean) => void;
  onChat: (message: MessageType) => void;
  onDeleteMessage: (id: number) => void;
  onEditMessage: (message: MessageType) => void;
  onUsers: (users: User[]) => void;
  onDialogs: (dialogs: Dialog[]) => void;
};

export function useChat(handlers: Handlers) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const manuallyClosed = useRef(false);
  const connectRef = useRef<() => void>(() => {});
  const reconnectTimeout = useRef<number | null>(null);

  const send = useCallback((data: ClientWSData) => {
    socketRef.current?.send(JSON.stringify(data));
  }, []);

  const scheduleReconnect = () => {
    if (reconnectTimeout.current) return;

    const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
    reconnectTimeout.current = window.setTimeout(() => {
      reconnectAttempts.current++;
      reconnectTimeout.current = null;
      connectRef.current();
    }, delay);
  };

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${location.host}/ws`);
    socketRef.current = socket;

    socket.onopen = () => {
      reconnectAttempts.current = 0;
      console.log("WS connected");
      send({ type: "client_dialogs" });
    };

    socket.onclose = (event) => {
      console.log("WS disconnected");
      socketRef.current = null;
      if (event.code === 4001) {
        console.log("Session taken by another tab. Stop reconnecting.");
        return;
      }
      if (!manuallyClosed.current) scheduleReconnect();
    };

    socket.onmessage = (event) => {
      const data: ServerWSData = JSON.parse(event.data);

      switch (data.type) {
        case "server_history":
          handlers.onHistory(data.messages, data.initial);
          break;
        case "server_chat":
          handlers.onChat(data.message);
          break;
        case "server_users":
          handlers.onUsers(data.users);
          break;
        case "server_deleteMessage":
          handlers.onDeleteMessage(data.id);
          break;
        case "server_editMessage":
          handlers.onEditMessage(data.message);
          break;
        case "server_dialogs":
          handlers.onDialogs(data.dialogs);
          break;
        case "server_error":
          console.error(data.message);
      }
    };
  }, [handlers, send]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connectRef.current();

    return () => {
      manuallyClosed.current = true;
      socketRef.current?.close();
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, []);

  return {
    sendMessage: async (
      text: string,
      dialog_id?: number,
      public_key?: string,
    ) => {
      if (dialog_id && public_key) {
        const cryptedText = await cryptoService.encryptWithPublicKey(
          text,
          public_key,
        );
        send({ type: "client_chat", messageText: cryptedText, dialog_id });
      } else {
        send({ type: "client_chat", messageText: text, dialog_id });
      }
    },

    editMessage: (id: number, text: string) =>
      send({ type: "client_editMessage", id, text }),

    deleteMessage: (id: number) => send({ type: "client_deleteMessage", id }),

    getHistory: (beforeId?: number, search?: string, dialog_id?: number) =>
      send({ type: "client_history", beforeId, search, dialog_id }),

    getDialogs: () => send({ type: "client_dialogs" }),

    createDialog: (user_id: number) =>
      send({ type: "client_createDialog", user_id }),

    deleteDialog: (dialog_id: number) =>
      send({ type: "client_deleteDialog", dialog_id }),
  };
}
