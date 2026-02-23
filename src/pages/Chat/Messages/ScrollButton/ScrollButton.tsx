import { useEffect, useState } from "react";
import styles from "./ScrollButton.module.css";

interface Props {
  messagesRef: React.RefObject<HTMLDivElement | null>;
  scrollToBottom: () => void;
}

function ScrollButton({ messagesRef, scrollToBottom }: Props) {
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
        <div className={styles.arrowBox}>
          <span className={styles.arrow}>{">"}</span>
        </div>
      </div>
    </button>
  );
}

export default ScrollButton;
