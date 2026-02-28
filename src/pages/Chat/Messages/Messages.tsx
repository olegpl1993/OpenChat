import { memo, useEffect, useState } from "react";
import type { Dialog, MessageType, User } from "../../../../types/types";
import { useAuthContext } from "../../../app/authContext/AuthContext";
import Message from "./Message/Message";
import styles from "./Messages.module.css";
import { buildMessagesRenderList, decryptMessages } from "./Messages.utils";
import ScrollButton from "./ScrollButton/ScrollButton";
import UsersPanel from "./UsersPanel/UsersPanel";

interface Props {
  messagesRef: React.RefObject<HTMLDivElement | null>;
  canLoadHistoryRef: React.RefObject<boolean>;
  messagesState: MessageType[];
  search: string;
  isOpenUsersPanel: boolean;
  onlineUsers: User[];
  startEdit: (message: MessageType) => void;
  getHistory: (beforeId?: number, search?: string, dialog_id?: number) => void;
  deleteMessage: (id: number) => void;
  scrollToBottom: () => void;
  haveNewMessages: boolean;
  setHaveNewMessages: React.Dispatch<React.SetStateAction<boolean>>;
  dialogs: Dialog[];
  selectedDialog: Dialog | null;
  handleSelectDialog: (dialog: Dialog) => void;
  handleCreateDialog: (userId: number) => void;
}

const Messages = ({
  messagesRef,
  canLoadHistoryRef,
  messagesState,
  search,
  isOpenUsersPanel,
  onlineUsers,
  startEdit,
  getHistory,
  deleteMessage,
  scrollToBottom,
  haveNewMessages,
  setHaveNewMessages,
  dialogs,
  selectedDialog,
  handleSelectDialog,
  handleCreateDialog,
}: Props) => {
  const { userName, privateKey } = useAuthContext();
  const [decryptedMessagesState, setDecryptedMessagesState] = useState<
    MessageType[]
  >([]);
  const messagesRenderList = buildMessagesRenderList(decryptedMessagesState);

  useEffect(() => {
    (async () => {
      const decrypted = await decryptMessages(messagesState, privateKey);
      setDecryptedMessagesState(decrypted);
    })();
  }, [messagesState, privateKey]);

  // on scroll
  useEffect(() => {
    const messagesCurrent = messagesRef.current;
    if (!messagesCurrent) return;

    const handleScroll = () => {
      // on scroll to bottom
      const distanceFromBottom =
        messagesCurrent.scrollHeight -
        messagesCurrent.scrollTop -
        messagesCurrent.clientHeight;
      if (distanceFromBottom < 10 && haveNewMessages) {
        setHaveNewMessages(false);
      }

      // on scroll to top
      const distanceFromTop = messagesCurrent.scrollTop;
      if (
        distanceFromTop < 500 &&
        messagesState.length > 0 &&
        canLoadHistoryRef.current
      ) {
        canLoadHistoryRef.current = false;
        getHistory(messagesState[0].id, search, selectedDialog?.dialog_id);
      }
    };

    messagesCurrent.addEventListener("scroll", handleScroll);
    return () => messagesCurrent.removeEventListener("scroll", handleScroll);
  }, [
    messagesState,
    messagesRef,
    search,
    canLoadHistoryRef,
    getHistory,
    haveNewMessages,
    setHaveNewMessages,
    selectedDialog?.dialog_id,
  ]);

  return (
    <div className={styles.messages}>
      {isOpenUsersPanel && (
        <UsersPanel
          onlineUsers={onlineUsers}
          dialogs={dialogs}
          selectedDialog={selectedDialog}
          handleSelectDialog={handleSelectDialog}
          handleCreateDialog={handleCreateDialog}
        />
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
              startEdit={startEdit}
              deleteMessage={deleteMessage}
            />
          );
        })}
      </div>

      <ScrollButton
        messagesRef={messagesRef}
        scrollToBottom={scrollToBottom}
        haveNewMessages={haveNewMessages}
      />
    </div>
  );
};

export default memo(Messages);
