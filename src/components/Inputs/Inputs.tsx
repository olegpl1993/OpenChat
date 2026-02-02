import { useState } from "react";
import type { MessageType } from "../../../types/types";
import { useAppContext } from "../../app/context/AppContext";
import { chatService } from "../../services/chatService";
import { encrypt } from "../../utils/crypt";
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
          <input
            className={styles.input}
            placeholder="message"
            maxLength={300}
            onChange={(e) => setMessageTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            value={messageTextInput}
          />
        </div>
      </div>

      <button
        className={styles.buttonSend}
        onClick={() => handleSend()}
        disabled={!messageTextInput || !userName}
      >
        Send
      </button>
    </div>
  );
};

export default Inputs;
