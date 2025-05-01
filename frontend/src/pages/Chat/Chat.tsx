import { useChatStore } from "@/entities/chat/chat.store";
import { Header } from "@/shared/components/Header/Header";
import { useEffect, useState } from "react";
import styles from "./Chat.module.css";

export function Chat() {
  const { connectSocket, disconnectSocket, sendMessage, messages } = useChatStore();
  const [userNameInput, setUserNameInput] = useState<string>("");
  const [messageInput, setMessageInput] = useState<string>("");

  useEffect(() => {
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.content}>
        <div className={styles.inputBox}>
          <input
            type="text"
            placeholder="Enter your name"
            value={userNameInput}
            onChange={(e) => setUserNameInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter your message"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage(messageInput, userNameInput);
                setMessageInput("");
              }
            }}
          />
        </div>

        <div className={styles.messageBox}>
          {messages.map((message, index) => (
            <div key={index}>
              {message.name}: {message.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
