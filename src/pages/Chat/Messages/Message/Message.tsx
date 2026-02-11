import { memo, useEffect, useState } from "react";
import type { MessageType } from "../../../../../types/types";
import { decrypt } from "../../../../utils/decrypt";
import styles from "./Message.module.css";

interface Props {
  message: MessageType;
  currentUser: string;
  cryptoKey: string;
}

const Message = ({ message, currentUser, cryptoKey }: Props) => {
  const [decryptedText, setDecryptedText] = useState("");

  const isUser = message.user === currentUser;
  const roleClass = isUser ? styles.user : styles.other;

  useEffect(() => {
    async function decryptText() {
      const decryptedText = await decrypt(message.text, cryptoKey);
      setDecryptedText(decryptedText);
    }
    decryptText();
  }, [message.text, cryptoKey]);

  return (
    <div className={`${styles.message} ${roleClass}`}>
      <p className={`${styles.userName} ${roleClass}`}>{message.user}</p>
      <p className={`${styles.messageText} ${roleClass}`}>{decryptedText}</p>
      <p className={`${styles.messageDate} ${roleClass}`}>
        {new Date(message.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
};

export default memo(Message);
