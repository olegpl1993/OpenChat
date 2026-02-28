import { memo } from "react";
import type { Dialog, MessageType } from "../../../../types/types";
import { useAuthContext } from "../../../app/authContext/AuthContext";
import messageIcon from "../../../assets/message.svg";

import styles from "./Inputs.module.css";

type Props = {
  messageTextInput: string;
  setMessageTextInput: React.Dispatch<React.SetStateAction<string>>;
  editedMessage: MessageType | null;
  setEditedMessage: React.Dispatch<React.SetStateAction<MessageType | null>>;
  cancelEdit: () => void;
  editMessage: (id: number, text: string) => void;
  handleSendMessage: (text: string, dialog_id?: number) => void;
  selectedDialog: Dialog | null;
};

const Inputs = ({
  messageTextInput,
  setMessageTextInput,
  editedMessage,
  cancelEdit,
  editMessage,
  handleSendMessage,
  selectedDialog,
}: Props) => {
  const { userName } = useAuthContext();

  const handleSend = async () => {
    if (!messageTextInput || !userName) return;
    if (editedMessage && editedMessage.id) {
      editMessage(editedMessage.id, messageTextInput);
      cancelEdit();
    } else {
      handleSendMessage(messageTextInput, selectedDialog?.dialog_id);
    }

    setMessageTextInput("");
  };

  return (
    <div className={styles.inputs}>
      {editedMessage && (
        <div className={styles.row}>
          <button className={styles.buttonCancel} onClick={cancelEdit}>
            Cancel
          </button>
          <p className={styles.editMessage}>Editing message</p>
        </div>
      )}

      <div className={styles.row}>
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
    </div>
  );
};

export default memo(Inputs);
