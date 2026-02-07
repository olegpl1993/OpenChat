import { useState } from "react";
import messageIcon from "../../../../public/message.svg";
import type { MessageType } from "../../../../types/types";
import { useAppContext } from "../../../app/context/AppContext";
import { chatService } from "../../../services/chatService";
import { encrypt } from "../../../utils/crypt";
import styles from "./Inputs.module.css";

const Inputs = () => {
  const { userName, key } = useAppContext();
  const [messageTextInput, setMessageTextInput] = useState("");

  const handleSend = async () => {
    if (!messageTextInput || !userName) return;
    const cryptoMessageText = await encrypt(messageTextInput, key);
    if (!cryptoMessageText) return;

    const createdMessage: MessageType = {
      id: Date.now(),
      user: userName,
      text: cryptoMessageText,
      created_at: new Date().toISOString(),
    };

    chatService.sendMessage(createdMessage);

    setMessageTextInput("");
  };

  return (
    <div className={styles.inputs}>
      <div className={styles.inputBox}>
        <div className={styles.inputContainer}>
          <textarea
            className={styles.input}
            placeholder="message"
            maxLength={500}
            value={messageTextInput}
            onChange={(e) => setMessageTextInput(e.target.value)}
            onKeyDown={(e) => {
              const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(
                navigator.userAgent,
              );
              if (isMobile) return;
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            name="message"
            autoComplete="off"
          />
        </div>
      </div>

      <button
        className={styles.buttonSend}
        onClick={() => handleSend()}
        disabled={!messageTextInput || !userName}
      >
        <img src={messageIcon} className={styles.messageIcon} />
      </button>
    </div>
  );
};

export default Inputs;
