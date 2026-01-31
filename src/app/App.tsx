import { useEffect, useRef, useState } from "react";
import { type MessageType } from "../../types/types";
import Inputs from "../components/Inputs/Inputs";
import Messages from "../components/Messages/Messages";
import { chatService } from "../services/chatService";
import styles from "./App.module.css";

const App = () => {
  const [messagesState, setMessagesState] = useState<MessageType[]>([]);
  const [userNameInput, setUserNameInput] = useState(
    () => localStorage.getItem("name") ?? "",
  );
  const [keyInput, setKeyInput] = useState(
    () => localStorage.getItem("key") ?? "",
  );

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

  useEffect(() => {
    localStorage.setItem("name", userNameInput);
  }, [userNameInput]);

  useEffect(() => {
    localStorage.setItem("key", keyInput);
  }, [keyInput]);

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <Messages
          messagesState={messagesState}
          messagesRef={messagesRef}
          userNameInput={userNameInput}
          keyInput={keyInput}
        />

        <Inputs
          userNameInput={userNameInput}
          setUserNameInput={setUserNameInput}
          keyInput={keyInput}
          setKeyInput={setKeyInput}
          sendMessage={(msg: MessageType) => chatService.sendMessage(msg)}
        />
      </div>
    </div>
  );
};

export default App;
