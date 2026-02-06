import { memo, useEffect } from "react";
import type { MessageType } from "../../../../types/types";
import { useAppContext } from "../../../app/context/AppContext";
import { chatService } from "../../../services/chatService";
import { buildMessagesRenderList } from "../../../utils/buildMessagesRenderList";
import Message from "./Message/Message";
import styles from "./Messages.module.css";

interface Props {
  messagesRef: React.RefObject<HTMLDivElement | null>;
  canLoadHistoryRef: React.RefObject<boolean>;
  messagesState: MessageType[];
  search: string;
  isOpenUsersPanel: boolean;
  onlineUsers: string[];
}

const Messages = ({
  messagesRef,
  canLoadHistoryRef,
  messagesState,
  search,
  isOpenUsersPanel,
  onlineUsers,
}: Props) => {
  const { userName, key } = useAppContext();
  const messagesRenderList = buildMessagesRenderList(messagesState);

  // on scroll to top
  useEffect(() => {
    const messagesCurrent = messagesRef.current;
    if (!messagesCurrent) return;

    const handleScroll = () => {
      if (
        messagesCurrent.scrollTop < 400 &&
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
      {isOpenUsersPanel && (
        <div className={styles.usersPanel}>
          <div className={styles.usersList}>
            {onlineUsers.map((user) => (
              <div key={user} className={styles.userItem}>
                {user}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={styles.messagesBox} ref={messagesRef}>
        {messagesRenderList.map((item, i) => {
          if (item.type === "date") {
            return (
              <div
                key={`date-${item.date}-${i}`}
                className={styles.dateSeparator}
              >
                <div className={styles.dateSeparatorText}>
                  {new Date(item.date).toLocaleDateString()}
                </div>
              </div>
            );
          }

          return (
            <Message
              key={item.message.id}
              message={item.message}
              currentUser={userName}
              cryptoKey={key}
            />
          );
        })}
      </div>
    </div>
  );
};

export default memo(Messages);
