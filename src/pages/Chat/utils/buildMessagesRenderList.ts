import type { MessageType } from "../../../../types/types";

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
