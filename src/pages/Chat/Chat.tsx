import { useEffect, useRef, useState } from "react";
import type { MessageType } from "../../../types/types";
import { useAppContext } from "../../app/context/AppContext";
import Inputs from "../../components/Inputs/Inputs";
import Messages from "../../components/Messages/Messages";
import { chatService } from "../../services/chatService";
import styles from "./Chat.module.css";

const Chat = () => {
  const { userNameInput, keyInput } = useAppContext();
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
  }, []);

  // scroll to bottom on initial render
  useEffect(() => {
    setTimeout(() => {
      messagesRef.current?.scrollTo(0, messagesRef.current.scrollHeight);
    }, 100);
  }, []);

  return (
    <div className={styles.chat}>
      <Messages
        messagesRef={messagesRef}
        messagesState={messagesState}
        userNameInput={userNameInput}
        keyInput={keyInput}
      />

      <Inputs
        userNameInput={userNameInput}
        keyInput={keyInput}
        sendMessage={(msg: MessageType) => chatService.sendMessage(msg)}
      />
    </div>
  );
};

export default Chat;
