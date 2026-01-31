import { useState } from "react";
import type { MessageType } from "../../../types/types";
import { encrypt } from "../../service/crypt";
import styles from "./Inputs.module.css";

interface Props {
  userNameInput: string;
  setUserNameInput: React.Dispatch<React.SetStateAction<string>>;
  keyInput: string;
  setKeyInput: React.Dispatch<React.SetStateAction<string>>;
  socketRef: React.RefObject<WebSocket | null>;
}

const Inputs = ({
  userNameInput,
  setUserNameInput,
  keyInput,
  setKeyInput,
  socketRef,
}: Props) => {
  const [messageTextInput, setMessageTextInput] = useState("");

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

    socketRef.current?.send(
      JSON.stringify({
        type: "chat",
        messages: [createdMessage],
      }),
    );

    setMessageTextInput("");
  };

  return (
    <div className={styles.inputs}>
      <div className={styles.inputBox}>
        <div className={styles.inputContainer}>
          <input
            className={styles.input}
            placeholder="name"
            maxLength={25}
            onChange={(e) => setUserNameInput(e.target.value)}
            value={userNameInput}
          />
          <input
            className={styles.input}
            placeholder="crypto key"
            maxLength={25}
            onChange={(e) => setKeyInput(e.target.value)}
            value={keyInput}
          />
        </div>
        <div className="inputContainer">
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
      <button className={styles.buttonSend} onClick={() => handleSend()}>
        Send
      </button>
    </div>
  );
};

export default Inputs;
