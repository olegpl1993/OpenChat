import { RowDataPacket } from "mysql2";
export interface Message extends RowDataPacket {
  id?: number;
  user: string;
  text: string;
  created_at?: string;
}

export type WSData = {
  type: "ping" | "pong" | "chat" | "error" | "history";
  messages: Message[];
};

