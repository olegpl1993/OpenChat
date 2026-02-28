import type { MessageType } from "../../../../types/types";
import { cryptoService } from "../../../services/crypto.service";

type ListItem =
  | { type: "date"; date: string }
  | { type: "message"; message: MessageType };

export const buildMessagesRenderList = (
  messages: MessageType[],
): ListItem[] => {
  const items: ListItem[] = [];
  let lastDate = "";
  for (const msg of messages) {
    const date = msg.created_at && new Date(msg.created_at).toDateString();
    if (date && date !== lastDate) {
      items.push({ type: "date", date });
      lastDate = date;
    }
    items.push({ type: "message", message: msg });
  }
  return items;
};

export async function decryptMessages(
  messages: MessageType[],
  privateKey: string,
): Promise<MessageType[]> {
  const decrypted = await Promise.all(
    messages.map(async (message): Promise<MessageType> => {
      if (!message.dialog_id) return message;
      try {
        const payload: {
          v: number;
          for_recipient: string;
          for_sender: string;
        } = JSON.parse(message.text);

        if (payload.v !== 1) return message;
        try {
          const text = await cryptoService.decryptWithPrivateKey(
            payload.for_recipient,
            privateKey,
          );
          return { ...message, text };
        } catch {
          /* empty */
        }
        try {
          const text = await cryptoService.decryptWithPrivateKey(
            payload.for_sender,
            privateKey,
          );
          return { ...message, text };
        } catch {
          /* empty */
        }
        return message;
      } catch {
        return message;
      }
    }),
  );

  return decrypted;
}
