import { useEffect, useRef, useState } from "react";
import type { MessageType } from "../../../types/types";
import { chatService } from "../../services/chatService";
import styles from "./Chat.module.css";
import Info from "./Info/Info";
import Inputs from "./Inputs/Inputs";
import Messages from "./Messages/Messages";

const Chat = () => {
  const [messagesState, setMessagesState] = useState<MessageType[]>([]);
  const [search, setSearch] = useState("");
  const canLoadHistoryRef = useRef(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    canLoadHistoryRef.current = false;
    setTimeout(() => {
      messagesRef.current?.scrollTo(0, messagesRef.current.scrollHeight);
      setTimeout(() => {
        canLoadHistoryRef.current = true;
      }, 300);
    }, 300);
  };

  const handleSearch = () => {
    setMessagesState([]);
    chatService.getHistory(undefined, search);
    scrollToBottom(); // scroll to bottom on search initial render
  };

  useEffect(() => {
    chatService.connect({
      onHistory: (messages) =>
        setMessagesState((prev) => [...messages, ...prev]),
      onChat: (messages) => {
        setMessagesState((prev) => [...prev, ...messages]);
        scrollToBottom(); // scroll to bottom on new message
      },
      onOpen: () => console.log("WS connected"),
      onClose: () => console.log("WS disconnected"),
    });

    scrollToBottom(); // scroll to bottom on initial render
    return () => chatService.disconnect();
  }, [setMessagesState]);

  return (
    <div className={styles.chat}>
      <Info search={search} setSearch={setSearch} handleSearch={handleSearch} />
      <Messages
        messagesRef={messagesRef}
        canLoadHistoryRef={canLoadHistoryRef}
        messagesState={messagesState}
        search={search}
      />
      <Inputs />
    </div>
  );
};

export default Chat;
