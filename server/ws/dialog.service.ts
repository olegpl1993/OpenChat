import { WebSocket } from "ws";
import { dialogRepository } from "../db/dialog.repository";
import { chatService } from "./chat.service";

export class DialogService {
  async getDialogs(ws: WebSocket) {
    const user = chatService.getUser(ws);
    if (!user) throw new Error("Unauthorized");
    return dialogRepository.getUserDialogs(user.userId);
  }
}

export const dialogService = new DialogService();
