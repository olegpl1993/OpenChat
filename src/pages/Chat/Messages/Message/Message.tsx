import { memo, useState } from "react";
import type { MessageType } from "../../../../../types/types";
import closeIcon from "../../../../assets/close.svg";
import deleteIcon from "../../../../assets/delete.svg";
import downArrowIcon from "../../../../assets/downArrow.svg";
import editIcon from "../../../../assets/edit.svg";
import styles from "./Message.module.css";

interface Props {
  message: MessageType;
  currentUser: string;
  startEdit: (message: MessageType) => void;
  deleteMessage: (id: number) => void;
}

const Message = ({ message, currentUser, startEdit, deleteMessage }: Props) => {
  const [open, setOpen] = useState(false);

  const isUser = message.user === currentUser;
  const roleClass = isUser ? styles.user : styles.other;
  const date =
    message.created_at &&
    new Date(message.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className={`${styles.message} ${roleClass}`}>
      <div className={styles.messageHeader}>
        <p className={`${styles.userName} ${roleClass}`}>{message.user}</p>
        {isUser && (
          <button
            className={`${styles.buttonOpen}`}
            onClick={() => setOpen(true)}
          >
            <img src={downArrowIcon} className={styles.downArrowIcon} />
          </button>
        )}
        {open && (
          <div className={styles.menu}>
            <button
              className={`${styles.button} ${styles.buttonClose}`}
              onClick={() => setOpen(false)}
            >
              <img src={closeIcon} className={styles.closeIcon} />
            </button>
            <div className={styles.buttonBox}>
              <button
                className={`${styles.button}`}
                onClick={() => {
                  startEdit(message);
                  setOpen(false);
                }}
              >
                <img src={editIcon} className={styles.editIcon} />
                <p>Edit</p>
              </button>
              <button
                className={`${styles.button}`}
                onClick={() => {
                  deleteMessage(message.id);
                  setOpen(false);
                }}
              >
                <img src={deleteIcon} className={styles.deleteIcon} />
                <p>Delete</p>
              </button>
            </div>
          </div>
        )}
      </div>
      <p className={`${styles.messageText} ${roleClass}`}>{message.text}</p>
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
