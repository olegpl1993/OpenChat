import { WebSocket } from "ws";
import { messageRepository } from "../db/message.repository";

type Client = {
  ws: WebSocket;
  userId: number;
  username: string;
  publicKey: string;
};

export class ChatService {
  private clients = new Map<string, Client>();
  private lastMessageTime = new Map<string, number>();

  getOnlineUsers(): { userId: number; username: string }[] {
    return [...this.clients.values()].map((client) => ({
      userId: client.userId,
      username: client.username,
    }));
  }

  getClientsByUserIds(userIds: number[]) {
    return [...this.clients.values()].filter((c) => userIds.includes(c.userId));
  }

  getClientByUserId(userId: number) {
    return [...this.clients.values()].find((c) => c.userId === userId) ?? null;
  }

  auth(
    ws: WebSocket,
    user: { userId: number; username: string; publicKey: string },
  ) {
    const existing = this.clients.get(user.username);
    if (existing && existing.ws !== ws) {
      existing.ws.close(4001, "SESSION_REPLACED");
    }
    this.clients.set(user.username, {
      ws,
      userId: user.userId,
      username: user.username,
      publicKey: user.publicKey,
    });
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

  async getInitialHistory(dialog_id?: number) {
    return messageRepository.findHistory({ dialogId: dialog_id });
  }

  async getHistory(beforeId?: number, search?: string, dialog_id?: number) {
    return messageRepository.findHistory({
      beforeId,
      search,
      dialogId: dialog_id,
    });
  }

  async saveMessage(ws: WebSocket, messageText: string, dialog_id?: number) {
    const user = this.getUser(ws);
    if (!user) throw new Error("Unauthorized");
    this.checkSpam(user.username);
    const message = await messageRepository.create(
      user,
      messageText,
      dialog_id,
    );
    if (!message) throw new Error("Message not found after insert");
    return message;
  }

  async deleteMessage(ws: WebSocket, id: number) {
    const user = this.getUser(ws);
    if (!user) throw new Error("Unauthorized");
    const message = await messageRepository.findById(id);
    if (!message) throw new Error("Message not found");
    if (message.user !== user.username)
      throw new Error("You can delete only your own messages");
    await messageRepository.deleteById(id);
  }

  async deleteMessagesByDialogId(dialog_id: number) {
    await messageRepository.deleteByDialogId(dialog_id);
  }

  async editMessage(ws: WebSocket, id: number, text: string) {
    const user = this.getUser(ws);
    if (!user) throw new Error("Unauthorized");

    const message = await messageRepository.findById(id);
    if (!message) throw new Error("Message not found");

    if (message.user !== user.username) {
      throw new Error("You can edit only your own messages");
    }

    await messageRepository.updateText(id, text);

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
