import { memo, useEffect, useState } from "react";
import type { MessageType } from "../../../../types/types";
import { useAppContext } from "../../../app/context/AppContext";
import { buildMessagesRenderList } from "../../../utils/buildMessagesRenderList";
import { decrypt } from "../../../utils/decrypt";
import { chatService } from "../chatService";
import Message from "./Message/Message";
import styles from "./Messages.module.css";
import UsersPanel from "./UsersPanel/UsersPanel";

interface Props {
  messagesRef: React.RefObject<HTMLDivElement | null>;
  canLoadHistoryRef: React.RefObject<boolean>;
  messagesState: MessageType[];
  search: string;
  isOpenUsersPanel: boolean;
  onlineUsers: string[];
  startEdit: (message: MessageType) => void;
}

const Messages = ({
  messagesRef,
  canLoadHistoryRef,
  messagesState,
  search,
  isOpenUsersPanel,
  onlineUsers,
  startEdit,
}: Props) => {
  const { userName, key } = useAppContext();
  const [decryptedMessagesState, setDecryptedMessagesState] = useState<
    MessageType[]
  >([]);
  const messagesRenderList = buildMessagesRenderList(decryptedMessagesState);

  useEffect(() => {
    async function decryptMessages() {
      const decrypted = await Promise.all(
        messagesState.map(async (message) => ({
          ...message,
          text: await decrypt(message.text, key),
        })),
      );
      setDecryptedMessagesState(decrypted);
    }
    decryptMessages();
  }, [messagesState, key]);

  // on scroll to top
  useEffect(() => {
    const messagesCurrent = messagesRef.current;
    if (!messagesCurrent) return;

    const handleScroll = () => {
      if (
        messagesCurrent.scrollTop < 500 &&
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
      {isOpenUsersPanel && <UsersPanel onlineUsers={onlineUsers} />}
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
              startEdit={startEdit}
            />
          );
        })}
      </div>
    </div>
  );
};

export default memo(Messages);
