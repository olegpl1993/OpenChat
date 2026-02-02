import { useEffect, useRef, useState } from "react";
import type { MessageType } from "../../../types/types";
import Inputs from "../../components/Inputs/Inputs";
import Messages from "../../components/Messages/Messages";
import { chatService } from "../../services/chatService";
import styles from "./Chat.module.css";

const Chat = () => {
  const [messagesState, setMessagesState] = useState<MessageType[]>([]);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatService.connect({
      onHistory: (messages) =>
        setMessagesState((prev) => [...messages, ...prev]),
      onChat: (messages) => {
        setMessagesState((prev) => [...prev, ...messages]);

        // scroll to bottom on new message
        setTimeout(() => {
          messagesRef.current?.scrollTo(0, messagesRef.current.scrollHeight);
        }, 100);
      },
      onOpen: () => console.log("WS connected"),
      onClose: () => console.log("WS disconnected"),
    });
    return () => chatService.disconnect();
  }, [setMessagesState]);

  // scroll to bottom on initial render
  useEffect(() => {
    setTimeout(() => {
      messagesRef.current?.scrollTo(0, messagesRef.current.scrollHeight);
    }, 100);
  }, []);

  return (
    <div className={styles.chat}>
      <Messages messagesRef={messagesRef} messagesState={messagesState} />
      <Inputs />
    </div>
  );
};

export default Chat;
