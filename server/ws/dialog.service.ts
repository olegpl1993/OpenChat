import { WebSocket } from "ws";
import { dialogRepository } from "../db/dialog.repository";
import { chatService } from "./chat.service";

export class DialogService {
  async getDialogById(dialogId: number) {
    return dialogRepository.getDialogById(dialogId);
  }

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

  async createDialog(ws: WebSocket, targetUserId: number) {
    const user = chatService.getUser(ws);
    if (!user) throw new Error("Unauthorized");

    if (user.userId === targetUserId) {
      throw new Error("Cannot create dialog with yourself");
    }

    const existing = await dialogRepository.findDialogBetweenUsers(
      user.userId,
      targetUserId,
    );

    if (existing) return existing;

    return dialogRepository.createDialog(user.userId, targetUserId);
  }

  async deleteDialog(ws: WebSocket, dialogId: number) {
    const user = chatService.getUser(ws);
    if (!user) throw new Error("Unauthorized");

    const dialog = await dialogRepository.getDialogById(dialogId);
    if (!dialog) throw new Error("Dialog not found");

    if (dialog.user1_id !== user.userId && dialog.user2_id !== user.userId) {
      throw new Error("Forbidden");
    }

    await dialogRepository.deleteDialog(dialogId);
    return true;
  }
}

export const dialogService = new DialogService();
