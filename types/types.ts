export type MessageType = {
  id: number;
  dialog_id: number | null;
  user_id: number;
  user: string;
  text: string;
  created_at: string;
  edited: boolean;
}

export type Dialog = {
  dialog_id: number;
  user_id: number;
  username: string;
  public_key: string;
};

export type User = {
  userId: number;
  username: string;
};

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
  | { type: "server_users"; users: User[] }
  | { type: "server_dialogs"; dialogs: Dialog[] };
