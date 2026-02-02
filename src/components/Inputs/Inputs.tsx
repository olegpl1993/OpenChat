import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MessageType } from "../../../types/types";
import { useAppContext } from "../../app/context/AppContext";
import { chatService } from "../../services/chatService";
import { encrypt } from "../../utils/crypt";
import styles from "./Inputs.module.css";

const Inputs = () => {
  const { userName, setUserName, key, setKey } =
    useAppContext();
  const [messageTextInput, setMessageTextInput] = useState("");
  const navigate = useNavigate();

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

  const handleExit = () => {
    setUserName("");
    setKey("");
    localStorage.removeItem("name");
    localStorage.removeItem("key");
    navigate("/");
  };

  return (
    <div className={styles.inputs}>
      <div className={styles.inputBox}>
        <div className={styles.wrapper}>
          <div className={styles.name}>{userName}</div>
          <button className={styles.exit} onClick={() => handleExit()}>
            Exit
          </button>
        </div>

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
