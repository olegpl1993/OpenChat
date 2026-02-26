import { WebSocket } from "ws";
import { dialogRepository } from "../db/dialog.repository";
import { chatService } from "./chat.service";

export class DialogService {
  async getDialogs(ws: WebSocket) {
    const user = chatService.getUser(ws);
    if (!user) throw new Error("Unauthorized");
    return dialogRepository.getUserDialogs(user.userId);
  }

  async getDialogUsers(dialogId: number): Promise<number[]> {
    const dialog = await dialogRepository.getDialogById(dialogId);
    if (!dialog) throw new Error("Dialog not found");

    return [dialog.user1_id, dialog.user2_id];
  }

  async assertUserInDialog(ws: WebSocket, dialogId: number) {
    const user = chatService.getUser(ws);
    if (!user) throw new Error("Unauthorized");

    const users = await this.getDialogUsers(dialogId);
    if (!users.includes(user.userId)) {
      throw new Error("Access denied to dialog");
    }
  }
}

export const dialogService = new DialogService();
