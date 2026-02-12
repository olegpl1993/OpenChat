import { useEffect, useRef, useState } from "react";
import type { MessageType } from "../../../types/types";
import { useAppContext } from "../../app/context/AppContext";
import { chatService } from "../../services/chatService";
import styles from "./Chat.module.css";
import Info from "./Info/Info";
import Inputs from "./Inputs/Inputs";
import Messages from "./Messages/Messages";

const Chat = () => {
  const { userName } = useAppContext();
  const [messagesState, setMessagesState] = useState<MessageType[]>([]);
  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isOpenUsersPanel, setIsOpenUsersPanel] = useState(false);
  const canLoadHistoryRef = useRef(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    canLoadHistoryRef.current = false;
    setTimeout(() => {
      messagesRef.current?.scrollTo(0, messagesRef.current.scrollHeight);
    }, 200);
    setTimeout(() => {
      canLoadHistoryRef.current = true;
    }, 700);
  };

  const handleSearch = () => {
    setMessagesState([]);
    chatService.getHistory(undefined, search.trim());
  };

  useEffect(() => {
    if (!userName) return;
    chatService.connect({
      onOpen: () => {
        console.log("WS connected");
      },
      onHistory: (messages, initial) => {
        if (initial) {
          setMessagesState(messages);
          scrollToBottom();
        } else {
          setMessagesState((prev) => [...messages, ...prev]);
          canLoadHistoryRef.current = true;
        }
      },
      onChat: (message) => {
        setMessagesState((prev) => [...prev, message]);
        scrollToBottom();
      },
      onUsers: (users) => setOnlineUsers(users),
      onClose: () => console.log("WS disconnected"),
    });

    return () => chatService.disconnect();
  }, [userName]);

  return (
    <div className={styles.chat}>
      <Info
        search={search}
        setSearch={setSearch}
        handleSearch={handleSearch}
        isOpenUsersPanel={isOpenUsersPanel}
        setIsOpenUsersPanel={setIsOpenUsersPanel}
      />

      <Messages
        messagesRef={messagesRef}
        canLoadHistoryRef={canLoadHistoryRef}
        messagesState={messagesState}
        search={search}
        isOpenUsersPanel={isOpenUsersPanel}
        onlineUsers={onlineUsers}
      />

      <Inputs />
    </div>
  );
};

export default Chat;
