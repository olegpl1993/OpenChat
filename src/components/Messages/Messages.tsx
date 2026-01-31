import type { MessageType } from "../../../types/types";
import Message from "../Message/Message";
import styles from "./Messages.module.css";

interface Props {
  messagesState: MessageType[];
  messagesRef: React.RefObject<HTMLDivElement | null>;
  userNameInput: string;
  keyInput: string;
}

const Messages = ({
  messagesState,
  messagesRef,
  userNameInput,
  keyInput,
}: Props) => {
  return (
    <div className={styles.messages}>
      <div className={styles.messagesBox} ref={messagesRef}>
        {messagesState.map((msg) => (
          <Message
            key={msg.id}
            name={msg.user}
            text={msg.text}
            currentUser={userNameInput}
            criptoKey={keyInput}
          />
        ))}
      </div>
    </div>
  );
};

export default Messages;
