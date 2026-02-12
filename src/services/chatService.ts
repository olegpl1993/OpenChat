import type { MessageType, WSData } from "../../types/types";

type Handlers = {
  onHistory: (messages: MessageType[], initial?: boolean) => void;
  onChat: (message: MessageType) => void;
  onUsers: (users: string[]) => void;
  onDeleteMessage: (id: number) => void;
  onOpen: () => void;
  onClose: () => void;
};

class ChatService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxDelay = 30000;
  private handlers: Handlers | null = null;
  private manuallyClosed = false;

  private sendRaw(data: WSData) {
    this.socket?.send(JSON.stringify(data));
  }

  connect(handlers: Handlers) {
    this.manuallyClosed = false;
    this.handlers = handlers;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    this.socket = new WebSocket(`${protocol}://${location.host}/ws`);

    this.socket.onopen = () => {
      this.sendRaw({ type: "ping" });
      this.handlers?.onOpen?.();
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      const data: WSData = JSON.parse(event.data);
      if (data.type === "history" && data.messages)
        this.handlers?.onHistory(data.messages, data.initial);
      if (data.type === "chat" && data.message)
        this.handlers?.onChat(data.message);
      if (data.type === "users" && data.users)
        this.handlers?.onUsers(data.users);
      if (data.type === "deleteMessage")
        this.handlers?.onDeleteMessage(data.id);
    };

    this.socket.onclose = () => {
      this.handlers?.onClose?.();
      this.socket = null;
      if (!this.manuallyClosed) this.scheduleReconnect();
    };
  }

  deleteMessage(id: number) {
    this.sendRaw({ type: "deleteMessage", id: id });
  }

  sendMessage(message: MessageType) {
    this.sendRaw({ type: "chat", message: message });
  }

  getHistory(beforeId?: number, search?: string) {
    this.sendRaw({ type: "getHistory", beforeId, search });
  }

  disconnect() {
    this.manuallyClosed = true;
    this.socket?.close();
    this.socket = null;
  }

  private scheduleReconnect() {
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, this.maxDelay);
    console.log(`Reconnect in ${delay} ms`);
    setTimeout(() => {
      if (!this.handlers) return;
      this.reconnectAttempts++;
      this.connect(this.handlers);
    }, delay);
  }
}

export const chatService = new ChatService();
