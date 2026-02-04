import type { MessageType, WSData } from "../../types/types";

type Handlers = {
  onHistory: (messages: MessageType[], initial?: boolean) => void;
  onChat: (messages: MessageType[]) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

class ChatService {
  private socket: WebSocket | null = null;

  private sendRaw(data: WSData) {
    this.socket?.send(JSON.stringify(data));
  }

  connect(handlers: Handlers) {
    if (this.socket) return;
    const WS_PORT = import.meta.env.DEV ? 4000 : location.port;
    const protocol = location.protocol === "https:" ? "wss" : "ws";

    this.socket = new WebSocket(
      `${protocol}://${location.hostname}:${WS_PORT}`,
    );

    this.socket.onopen = () => {
      this.sendRaw({ type: "ping" });
      handlers.onOpen?.();
    };

    this.socket.onmessage = (event) => {
      const data: WSData = JSON.parse(event.data);

      if (data.type === "history" && data.messages)
        handlers.onHistory(data.messages, data.initial);

      if (data.type === "chat" && data.messages) handlers.onChat(data.messages);
    };

    this.socket.onclose = () => {
      handlers.onClose?.();
      this.socket = null;
    };
  }

  sendMessage(message: MessageType) {
    this.sendRaw({ type: "chat", messages: [message] });
  }

  getHistory(beforeId?: number, search?: string) {
    this.sendRaw({ type: "getHistory", beforeId, search });
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}

export const chatService = new ChatService();
