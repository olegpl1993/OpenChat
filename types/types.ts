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
  | { type: "error"; messages: MessageType[] }
  | { type: "history"; messages: MessageType[] }
  | { type: "chat"; messages: MessageType[] };
