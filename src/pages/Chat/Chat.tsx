import { useCallback, useEffect, useRef, useState } from "react";
import type { Dialog, MessageType, User } from "../../../types/types";
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
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [isOpenUsersPanel, setIsOpenUsersPanel] = useState(false);
  const canLoadHistoryRef = useRef(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [editedMessage, setEditedMessage] = useState<MessageType | null>(null);
  const [messageTextInput, setMessageTextInput] = useState("");
  const [haveNewMessages, setHaveNewMessages] = useState(false);
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const getHistoryRef = useRef<
    | ((
        beforeId?: number | undefined,
        search?: string | undefined,
        dialog_id?: number | undefined,
      ) => void)
    | null
  >(null);

  const [selectedDialog, setSelectedDialog] = useState<Dialog | null>(null);
  const selectedDialogRef = useRef<Dialog | null>(null);
  useEffect(() => {
    selectedDialogRef.current = selectedDialog;
  }, [selectedDialog]);

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
    setIsOpenUsersPanel(false);
    setSearch("");
    setSelectedDialog(dialog);
    setMessagesState([]);
    chat.getHistory(undefined, undefined, dialog.dialog_id);
  };

  const handleCloseSelectedDialog = () => {
    setIsOpenUsersPanel(false);
    setSearch("");
    setSelectedDialog(null);
    setMessagesState([]);
    chat.getHistory();
  };

  const handleCreateDialog = (userId: number) => {
    chat.createDialog(userId);
    setSearch("");
  };

  const handleDeleteSelectedDialog = () => {
    if (selectedDialog) chat.deleteDialog(selectedDialog.dialog_id);
    setIsOpenUsersPanel(false);
    setSearch("");
    setSelectedDialog(null);
    setMessagesState([]);
    chat.getHistory();
  };

  const handleSearch = () => {
    setIsOpenUsersPanel(false);
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
        const dialogId = selectedDialogRef.current?.dialog_id ?? null;
        if ((message.dialog_id ?? null) !== dialogId) return;
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
    onDialogs: useCallback((dialogs: Dialog[]) => {
      setDialogs(dialogs);
      const selected = selectedDialogRef.current;
      if (!selected) return;
      const exists = dialogs.some((d) => d.dialog_id === selected.dialog_id);
      if (!exists) {
        selectedDialogRef.current = null;
        setSelectedDialog(null);
        setMessagesState([]);
        setHaveNewMessages(false);
        if (getHistoryRef.current) getHistoryRef.current();
      }
    }, []),
  });

  const handleSendMessage = async (message: string, dialog_id?: number) => {
    await chat.sendMessage(message, dialog_id, selectedDialog?.public_key);
  };

  useEffect(() => {
    getHistoryRef.current = chat.getHistory;
  }, [chat.getHistory]);

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
        handleDeleteSelectedDialog={handleDeleteSelectedDialog}
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
        handleCreateDialog={handleCreateDialog}
      />

      <Inputs
        messageTextInput={messageTextInput}
        setMessageTextInput={setMessageTextInput}
        editedMessage={editedMessage}
        setEditedMessage={setEditedMessage}
        cancelEdit={cancelEdit}
        editMessage={chat.editMessage}
        handleSendMessage={handleSendMessage}
        selectedDialog={selectedDialog}
      />
    </div>
  );
};

export default Chat;
