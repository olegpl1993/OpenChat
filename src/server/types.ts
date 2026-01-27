import { RowDataPacket } from "mysql2";
export interface Message extends RowDataPacket {
  id: number;
  user: string;
  text: string;
  created_at: string;
}