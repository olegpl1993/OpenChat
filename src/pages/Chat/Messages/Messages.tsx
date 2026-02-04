import { memo, useEffect } from "react";
import type { MessageType } from "../../../../types/types";
import { useAppContext } from "../../../app/context/AppContext";
import { chatService } from "../../../services/chatService";
import Message from "./Message/Message";
import styles from "./Messages.module.css";

interface Props {
  messagesRef: React.RefObject<HTMLDivElement | null>;
  canLoadHistoryRef: React.RefObject<boolean>;
  messagesState: MessageType[];
  search: string;
}

const Messages = ({
  messagesRef,
  canLoadHistoryRef,
  messagesState,
  search,
}: Props) => {
  const { userName, key } = useAppContext();

  // on scroll to top
  useEffect(() => {
    const messagesCurrent = messagesRef.current;
    if (!messagesCurrent) return;

    const handleScroll = () => {
      console.log(canLoadHistoryRef.current);
      if (
        messagesCurrent.scrollTop < 200 &&
        messagesState.length > 0 &&
        canLoadHistoryRef.current
      ) {
        canLoadHistoryRef.current = false;
        chatService.getHistory(messagesState[0].id, search);
      }
    };
    messagesCurrent.addEventListener("scroll", handleScroll);

    return () => messagesCurrent.removeEventListener("scroll", handleScroll);
  }, [messagesState, messagesRef, search, canLoadHistoryRef]);

  return (
    <div className={styles.messages}>
      <div className={styles.messagesBox} ref={messagesRef}>
        {messagesState.map((msg) => (
          <Message
            key={msg.id}
            name={msg.user}
            text={msg.text}
            currentUser={userName}
            cryptoKey={key}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(Messages);
