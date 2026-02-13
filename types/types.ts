import type { RowDataPacket } from "mysql2";

export interface MessageType {
  id: number;
  user: string;
  text: string;
  created_at: string;
  edited: boolean;
}

export interface DBrequestType extends RowDataPacket, MessageType {}

export type WSData =
  | { type: "server_error"; message?: string; error?: Error }
  | { type: "server_history"; messages: MessageType[]; initial?: boolean }
  | { type: "server_deleteMessage"; id: number }
  | { type: "server_editMessage"; message: MessageType }
  | { type: "server_chat"; message: MessageType }
  | { type: "server_users"; users: string[] }
  | { type: "client_history"; beforeId?: number; search?: string }
  | { type: "client_deleteMessage"; id: number }
  | { type: "client_editMessage"; id: number; text: string }
  | { type: "client_chat"; messageText: string };

export type AuthBody = {
  username: string;
  password: string;
};

export type UserRow = RowDataPacket & {
  id: number;
  password_hash: string;
};
