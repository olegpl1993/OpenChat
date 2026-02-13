import type {
  ClientWSData,
  MessageType,
  ServerWSData,
} from "../../../types/types";

type Handlers = {
  onHistory: (messages: MessageType[], initial?: boolean) => void;
  onChat: (message: MessageType) => void;
  onDeleteMessage: (id: number) => void;
  onEditMessage: (message: MessageType) => void;
  onUsers: (users: string[]) => void;
};

class ChatService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxDelay = 30000;
  private handlers: Handlers | null = null;
  private manuallyClosed = false;

  connect(handlers: Handlers) {
    this.manuallyClosed = false;
    this.handlers = handlers;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    this.socket = new WebSocket(`${protocol}://${location.host}/ws`);

    this.socket.onopen = () => {
      console.log("WS connected");
      this.reconnectAttempts = 0;
    };

    this.socket.onclose = () => {
      console.log("WS disconnected");
      this.socket = null;
      if (!this.manuallyClosed) this.scheduleReconnect();
    };

    this.socket.onmessage = (event) => {
      let data: ServerWSData;

      try {
        data = JSON.parse(event.data);
      } catch {
        console.error("Invalid WS message", event.data);
        return;
      }

      switch (data.type) {
        case "server_history":
          this.handlers?.onHistory(data.messages, data.initial);
          break;
        case "server_chat":
          this.handlers?.onChat(data.message);
          break;
        case "server_users":
          this.handlers?.onUsers(data.users);
          break;
        case "server_deleteMessage":
          this.handlers?.onDeleteMessage(data.id);
          break;
        case "server_editMessage":
          this.handlers?.onEditMessage(data.message);
          break;
        case "server_error":
          console.error(data.message);
          break;
      }
    };
  }

  editMessage(id: number, text: string) {
    this.sendRaw({ type: "client_editMessage", id: id, text: text });
  }

  deleteMessage(id: number) {
    this.sendRaw({ type: "client_deleteMessage", id: id });
  }

  sendMessage(messageText: string) {
    this.sendRaw({ type: "client_chat", messageText: messageText });
  }

  getHistory(beforeId?: number, search?: string) {
    this.sendRaw({ type: "client_history", beforeId, search });
  }

  disconnect() {
    this.manuallyClosed = true;
    this.socket?.close();
    this.socket = null;
  }

  private sendRaw(data: ClientWSData) {
    this.socket?.send(JSON.stringify(data));
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
