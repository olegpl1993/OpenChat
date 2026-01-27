import { RowDataPacket } from "mysql2";
export interface Message extends RowDataPacket {
  id: number;
  user: string;
  text: string;
  created_at: string;
}

export type Msg = {
  type: string;
  name: string;
  message: string;
};
