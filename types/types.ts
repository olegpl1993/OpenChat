import type { RowDataPacket } from "mysql2";

export interface MessageType {
  id: number;
  user: string;
  text: string;
  created_at: string;
}

export interface DBrequestType extends RowDataPacket, MessageType {}

export type WSData =
  | { type: "ping" }
  | { type: "pong" }
  | { type: "error" }
  | { type: "history"; messages: MessageType[]; initial?: boolean }
  | { type: "chat"; messages: MessageType[] }
  | { type: "getHistory"; beforeId?: number; search?: string }
  | { type: "auth"; user: string }
  | { type: "users"; users: string[] };
