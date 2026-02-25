import { useEffect, useState } from "react";
import newMessageIcon from "../../../../assets/newMessage.svg";
import styles from "./ScrollButton.module.css";

interface Props {
  messagesRef: React.RefObject<HTMLDivElement | null>;
  scrollToBottom: () => void;
  haveNewMessages: boolean;
}

function ScrollButton({ messagesRef, scrollToBottom, haveNewMessages }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const messagesCurrent = messagesRef.current;
    if (!messagesCurrent) return;

    const handleScroll = () => {
      const distanceFromBottom =
        messagesCurrent.scrollHeight -
        messagesCurrent.scrollTop -
        messagesCurrent.clientHeight;
      setIsVisible(distanceFromBottom > 400);
    };
    messagesCurrent.addEventListener("scroll", handleScroll);

    return () => {
      messagesCurrent.removeEventListener("scroll", handleScroll);
    };
  }, [messagesRef]);

  return (
    <button
      className={styles.scrollButton}
      color="primary"
      onClick={scrollToBottom}
      style={{ display: isVisible ? "block" : "none" }}
    >
      <div className={styles.border}>
        {haveNewMessages && (
          <img src={newMessageIcon} className={styles.newMessageIcon} />
        )}
        <div className={styles.arrowBox}>
          <span className={styles.arrow}>{">"}</span>
        </div>
      </div>
    </button>
  );
}

export default ScrollButton;
