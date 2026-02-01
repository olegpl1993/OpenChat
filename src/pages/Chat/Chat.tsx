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
      onHistory: (messages) => setMessagesState(messages),
      onChat: (messages) => setMessagesState((prev) => [...prev, ...messages]),
      onOpen: () => console.log("WS connected"),
      onClose: () => console.log("WS disconnected"),
    });
    return () => chatService.disconnect();
  }, []);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const timeout = setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 1);
    return () => clearTimeout(timeout);
  }, [messagesState]);

  return (
    <div className={styles.chat}>
      <Messages
        messagesState={messagesState}
        messagesRef={messagesRef}
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
