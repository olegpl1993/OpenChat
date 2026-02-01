import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MessageType } from "../../../types/types";
import { useAppContext } from "../../app/context/AppContext";
import { encrypt } from "../../utils/crypt";
import styles from "./Inputs.module.css";

interface Props {
  userNameInput: string;
  keyInput: string;
  sendMessage: (message: MessageType) => void;
}

const Inputs = ({ userNameInput, keyInput, sendMessage }: Props) => {
  const { setUserNameInput, setKeyInput } = useAppContext();
  const [messageTextInput, setMessageTextInput] = useState("");
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!messageTextInput || !userNameInput) return;
    const cryptoMessageText = await encrypt(messageTextInput, keyInput);
    if (!cryptoMessageText) return;

    const createdMessage: MessageType = {
      id: Date.now(),
      user: userNameInput,
      text: cryptoMessageText,
      created_at: new Date().toISOString(),
    };

    sendMessage(createdMessage);

    setMessageTextInput("");
  };

  const handleExit = () => {
    setUserNameInput("");
    setKeyInput("");
    localStorage.removeItem("name");
    localStorage.removeItem("key");
    navigate("/");
  };

  return (
    <div className={styles.inputs}>
      <div className={styles.inputBox}>
        <div className={styles.wrapper}>
          <div className={styles.name}>{userNameInput}</div>
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
        disabled={!messageTextInput || !userNameInput}
      >
        Send
      </button>
    </div>
  );
};

export default Inputs;
