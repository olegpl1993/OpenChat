import { WebSocket } from "ws";
import { messageRepository } from "../db/message.repository";

type Client = {
  ws: WebSocket;
  username: string;
};

export class ChatService {
  private clients = new Map<string, Client>();
  private lastMessageTime = new Map<string, number>();

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

  async saveMessage(ws: WebSocket, messageText: string) {
    const username = this.getUser(ws);
    if (!username) throw new Error("Unauthorized");
    this.checkSpam(username);
    const id = await messageRepository.saveMessage(username, messageText);
    const savedMessage = await messageRepository.getMessageById(id);
    if (!savedMessage) throw new Error("Message not found after insert");
    return savedMessage;
  }

  async deleteMessage(ws: WebSocket, id: number) {
    const username = this.getUser(ws);
    if (!username) throw new Error("Unauthorized");
    const message = await messageRepository.getMessageById(id);
    if (!message) throw new Error("Message not found");
    if (message.user !== username)
      throw new Error("You can delete only your own messages");
    await messageRepository.delete(id);
  }

  async editMessage(ws: WebSocket, id: number, text: string) {
    const username = this.getUser(ws);
    if (!username) throw new Error("Unauthorized");

    const message = await messageRepository.getMessageById(id);
    if (!message) throw new Error("Message not found");

    if (message.user !== username) {
      throw new Error("You can edit only your own messages");
    }

    await messageRepository.update(id, text);

    return {
      ...message,
      text,
      edited: true,
    };
  }

  private checkSpam(username: string) {
    const now = Date.now();
    const last = this.lastMessageTime.get(username) ?? 0;
    if (now - last < 1000) throw new Error("You're sending messages too fast.");
    this.lastMessageTime.set(username, now);
  }
}

export const chatService = new ChatService();
