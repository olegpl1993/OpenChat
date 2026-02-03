import { memo, useEffect, useRef } from "react";
import type { MessageType } from "../../../../types/types";
import { useAppContext } from "../../../app/context/AppContext";
import { chatService } from "../../../services/chatService";
import Message from "./Message/Message";
import styles from "./Messages.module.css";

interface Props {
  messagesRef: React.RefObject<HTMLDivElement | null>;
  messagesState: MessageType[];
}

const Messages = ({ messagesRef, messagesState }: Props) => {
  const { userName, key } = useAppContext();

  // on scroll to top
  const loadingRef = useRef(true);
  useEffect(() => {
    const messagesEl = messagesRef.current;
    if (!messagesEl) return;

    const handleScroll = () => {
      if (
        messagesEl.scrollTop < 100 &&
        messagesState.length > 0 &&
        !loadingRef.current
      ) {
        loadingRef.current = true;
        chatService.getHistory(messagesState[0].id);
      }
    };
    setTimeout(() => {
      loadingRef.current = false;
    }, 1000);
    messagesEl.addEventListener("scroll", handleScroll);
    return () => messagesEl.removeEventListener("scroll", handleScroll);
  }, [messagesState, messagesRef]);

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
