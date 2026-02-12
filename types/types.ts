import type { RowDataPacket } from "mysql2";

export interface MessageType {
  id?: number;
  user?: string;
  text: string;
  created_at?: string;
}

export interface DBrequestType extends RowDataPacket, MessageType {}

export type WSData =
  | { type: "ping" }
  | { type: "pong" }
  | { type: "error" }
  | { type: "getHistory"; beforeId?: number; search?: string }
  | { type: "history"; messages: MessageType[]; initial?: boolean }
  | { type: "deleteMessage"; id: number }
  | { type: "chat"; message: MessageType }
  | { type: "users"; users: string[] };

export type AuthBody = {
  username: string;
  password: string;
};

export type UserRow = RowDataPacket & {
  id?: number;
  password_hash?: string;
};
