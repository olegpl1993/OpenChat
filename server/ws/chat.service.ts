import { WebSocket } from "ws";
import { messageRepository } from "../db/message.repository";

type Client = {
  ws: WebSocket;
  userId: number;
  username: string;
};

export class ChatService {
  private clients = new Map<string, Client>();
  private lastMessageTime = new Map<string, number>();

  getOnlineUsers() {
    return [...this.clients.keys()];
  }

  auth(ws: WebSocket, user: { userId: number; username: string }) {
    const existing = this.clients.get(user.username);
    if (existing && existing.ws !== ws) {
      existing.ws.close(4001, "SESSION_REPLACED");
    }
    this.clients.set(user.username, { ws, userId: user.userId, username: user.username });
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
    return [...this.clients.values()].find((c) => c.ws === ws) ?? null;
  }

  async getInitialHistory() {
    return messageRepository.getHistory();
  }

  async getHistory(beforeId?: number, search?: string) {
    return messageRepository.getHistory(beforeId, search);
  }

  async saveMessage(ws: WebSocket, messageText: string) {
    const user = this.getUser(ws);
    if (!user) throw new Error("Unauthorized");
    this.checkSpam(user.username);
    const id = await messageRepository.saveMessage(user, messageText);
    const savedMessage = await messageRepository.getMessageById(id);
    if (!savedMessage) throw new Error("Message not found after insert");
    return savedMessage;
  }

  async deleteMessage(ws: WebSocket, id: number) {
    const user = this.getUser(ws);
    if (!user) throw new Error("Unauthorized");
    const message = await messageRepository.getMessageById(id);
    if (!message) throw new Error("Message not found");
    if (message.user !== user.username)
      throw new Error("You can delete only your own messages");
    await messageRepository.delete(id);
  }

  async editMessage(ws: WebSocket, id: number, text: string) {
    const user = this.getUser(ws);
    if (!user) throw new Error("Unauthorized");

    const message = await messageRepository.getMessageById(id);
    if (!message) throw new Error("Message not found");

    if (message.user !== user.username) {
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
