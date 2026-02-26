import { useCallback, useRef, useState } from "react";
import type { Dialog, MessageType } from "../../../types/types";
import { useAuthContext } from "../../app/authContext/AuthContext";
import styles from "./Chat.module.css";
import Info from "./Info/Info";
import Inputs from "./Inputs/Inputs";
import Messages from "./Messages/Messages";
import { useChat } from "./useChat.hook";

const Chat = () => {
  const { userName } = useAuthContext();
  const [messagesState, setMessagesState] = useState<MessageType[]>([]);
  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isOpenUsersPanel, setIsOpenUsersPanel] = useState(false);
  const canLoadHistoryRef = useRef(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [editedMessage, setEditedMessage] = useState<MessageType | null>(null);
  const [messageTextInput, setMessageTextInput] = useState("");
  const [haveNewMessages, setHaveNewMessages] = useState(false);
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [selectedDialog, setSelectedDialog] = useState<Dialog | null>(null);

  const startEdit = (message: MessageType) => {
    setEditedMessage(message);
    setMessageTextInput(message.text);
  };

  const cancelEdit = () => {
    setEditedMessage(null);
    setMessageTextInput("");
  };

  const scrollToBottom = () => {
    canLoadHistoryRef.current = false;
    setTimeout(() => {
      messagesRef.current?.scrollTo(0, messagesRef.current.scrollHeight);
    }, 200);
    setTimeout(() => {
      canLoadHistoryRef.current = true;
    }, 700);
  };

  const handleSelectDialog = (dialog: Dialog) => {
    setSearch("");
    setSelectedDialog(dialog);
    setMessagesState([]);
    chat.getHistory(undefined, undefined, dialog.dialog_id);
  };

  const handleCloseSelectedDialog = () => {
    setSearch("");
    setSelectedDialog(null);
    setMessagesState([]);
    chat.getHistory();
  };

  const handleSearch = () => {
    setSelectedDialog(null);
    setMessagesState([]);
    chat.getHistory(undefined, search.trim());
  };
  const chat = useChat({
    onHistory: useCallback((messages, initial) => {
      if (initial) {
        setMessagesState(messages);
        scrollToBottom();
      } else {
        setMessagesState((prev) => [...messages, ...prev]);
        setTimeout(() => {
          canLoadHistoryRef.current = true;
        }, 700);
      }
    }, []),
    onChat: useCallback(
      (message) => {
        setMessagesState((prev) => [...prev, message]);
        const messagesCurrent = messagesRef.current;
        if (!messagesCurrent) return;
        const distanceFromBottom =
          messagesCurrent.scrollHeight -
          messagesCurrent.scrollTop -
          messagesCurrent.clientHeight;
        if (message.user !== userName && distanceFromBottom > 400) {
          setHaveNewMessages(true);
        } else {
          scrollToBottom();
        }
      },
      [userName],
    ),
    onDeleteMessage: useCallback((id) => {
      setMessagesState((prev) => prev.filter((m) => m.id !== id));
    }, []),
    onEditMessage: useCallback((message) => {
      setMessagesState((prev) =>
        prev.map((m) => (m.id === message.id ? message : m)),
      );
    }, []),
    onUsers: useCallback((users) => setOnlineUsers(users), []),
    onDialogs: useCallback((dialogs) => setDialogs(dialogs), []),
  });

  return (
    <div className={styles.chat}>
      <Info
        search={search}
        setSearch={setSearch}
        handleSearch={handleSearch}
        isOpenUsersPanel={isOpenUsersPanel}
        setIsOpenUsersPanel={setIsOpenUsersPanel}
        selectedDialog={selectedDialog}
        handleCloseSelectedDialog={handleCloseSelectedDialog}
      />

      <Messages
        messagesRef={messagesRef}
        canLoadHistoryRef={canLoadHistoryRef}
        messagesState={messagesState}
        search={search}
        isOpenUsersPanel={isOpenUsersPanel}
        onlineUsers={onlineUsers}
        startEdit={startEdit}
        getHistory={chat.getHistory}
        deleteMessage={chat.deleteMessage}
        scrollToBottom={scrollToBottom}
        haveNewMessages={haveNewMessages}
        setHaveNewMessages={setHaveNewMessages}
        dialogs={dialogs}
        selectedDialog={selectedDialog}
        handleSelectDialog={handleSelectDialog}
      />

      <Inputs
        messageTextInput={messageTextInput}
        setMessageTextInput={setMessageTextInput}
        editedMessage={editedMessage}
        setEditedMessage={setEditedMessage}
        cancelEdit={cancelEdit}
        editMessage={chat.editMessage}
        sendMessage={chat.sendMessage}
        selectedDialog={selectedDialog}
      />
    </div>
  );
};

export default Chat;
