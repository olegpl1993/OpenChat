import type { RowDataPacket } from "mysql2";

export interface MessageType {
  id: number;
  user: string;
  text: string;
  created_at: string;
  edited: boolean;
  user_id: number;
  dialog_id: number | null;
}

export interface DBrequestType extends RowDataPacket, MessageType {}

export type AuthBody = {
  username: string;
  password: string;
};

export type DialogDBRow = RowDataPacket & {
  id: number;
  user1_id: number;
  user2_id: number;
  created_at: string;
};

export type UserRow = RowDataPacket & {
  id: number;
  password_hash: string;
};

export type Dialog = { dialog_id: number; user_id: number; username: string };

export type ClientWSData =
  | {
      type: "client_history";
      beforeId?: number;
      search?: string;
      dialog_id?: number;
    }
  | { type: "client_deleteMessage"; id: number }
  | { type: "client_editMessage"; id: number; text: string }
  | { type: "client_chat"; messageText: string; dialog_id?: number }
  | { type: "client_dialogs" }
  | { type: "client_deleteDialog"; dialog_id: number }
  | { type: "client_createDialog"; user_id: number };

export type ServerWSData =
  | { type: "server_error"; message?: string }
  | { type: "server_history"; messages: MessageType[]; initial?: boolean }
  | { type: "server_deleteMessage"; id: number }
  | { type: "server_editMessage"; message: MessageType }
  | { type: "server_chat"; message: MessageType }
  | { type: "server_users"; users: string[] }
  | { type: "server_dialogs"; dialogs: Dialog[] };
