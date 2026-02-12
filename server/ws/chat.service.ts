import { WebSocket } from "ws";
import { MessageType } from "../../types/types";
import { messageRepository } from "../db/message.repository";

type Client = {
  ws: WebSocket;
  username: string;
};

export class ChatService {
  private clients = new Map<string, Client>();

  getOnlineUsers() {
    return [...this.clients.keys()];
  }

  auth(ws: WebSocket, username: string) {
    const existing = this.clients.get(username);
    if (existing && existing.ws !== ws) {
      existing.ws.close(4001, "SESSION_REPLACED");
    }
    this.clients.set(username, { ws, username });
  }

  disconnect(ws: WebSocket) {
    for (const [username, client] of this.clients) {
      if (client.ws === ws) {
        this.clients.delete(username);
        break;
      }
    }
  }

  getUser(ws: WebSocket) {
    for (const client of this.clients.values()) {
      if (client.ws === ws) return client.username;
    }
    return null;
  }

  async getInitialHistory() {
    return messageRepository.getHistory();
  }

  async getHistory(beforeId?: number, search?: string) {
    return messageRepository.getHistory(beforeId, search);
  }

  async saveMessage(ws: WebSocket, message: MessageType) {
    const username = this.getUser(ws);
    if (!username) throw new Error("Unauthorized");
    const id = await messageRepository.saveMessage(username, message.text);
    const savedMessage = await messageRepository.getMessageById(id);
    if (!savedMessage) throw new Error("Message not found after insert");
    return savedMessage;
  }
}

export const chatService = new ChatService();
