import { memo, useEffect, useState } from "react";
import type { MessageType } from "../../../../../types/types";
import editIcon from "../../../../assets/edit.svg";
import { chatService } from "../../../../services/chatService";
import { decrypt } from "../../../../utils/decrypt";
import styles from "./Message.module.css";

interface Props {
  message: MessageType;
  currentUser: string;
  cryptoKey: string;
  startEdit: (message: MessageType) => void;
}

const Message = ({ message, currentUser, cryptoKey, startEdit }: Props) => {
  const [decryptedText, setDecryptedText] = useState("");

  const isUser = message.user === currentUser;
  const roleClass = isUser ? styles.user : styles.other;
  const date =
    message.created_at &&
    new Date(message.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    async function decryptText() {
      const decryptedText = await decrypt(message.text, cryptoKey);
      setDecryptedText(decryptedText);
    }
    decryptText();
  }, [message.text, cryptoKey]);

  const deleteMessage = () =>
    message.id && chatService.deleteMessage(message.id);

  return (
    <div className={`${styles.message} ${roleClass}`}>
      <div className={styles.messageHeader}>
        <p className={`${styles.userName} ${roleClass}`}>{message.user}</p>
        {isUser && (
          <div className={styles.buttons}>
            <button
              className={`${styles.editButton}`}
              onClick={() => startEdit(message)}
            >
              <img src={editIcon} className={styles.editIcon} />
            </button>
            <button
              className={`${styles.deletButton}`}
              onClick={deleteMessage}
            />
          </div>
        )}
      </div>
      <p className={`${styles.messageText} ${roleClass}`}>{decryptedText}</p>
      <div className={styles.messageFooter}>
        <p className={`${styles.messageDate} ${roleClass}`}>
          {message.edited ? "edited" : ""}
        </p>
        <p className={`${styles.messageDate} ${roleClass}`}>{date}</p>
      </div>
    </div>
  );
};

export default memo(Message);
