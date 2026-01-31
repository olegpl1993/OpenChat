import { useEffect, useRef, useState } from "react";
import { type MessageType, type WSData } from "../../types/types";
import Inputs from "../components/Inputs/Inputs";
import Messages from "../components/Messages/Messages";
import styles from "./App.module.css";

const App = () => {
  const socketRef = useRef<WebSocket | null>(null);

  const [messagesState, setMessagesState] = useState<MessageType[]>([]);

  const [userNameInput, setUserNameInput] = useState(
    () => localStorage.getItem("name") ?? "",
  );
  const [keyInput, setKeyInput] = useState(
    () => localStorage.getItem("key") ?? "",
  );

  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const timeout = setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 1);
    return () => clearTimeout(timeout);
  }, [messagesState]);

  useEffect(() => {
    const WS_PORT = import.meta.env.DEV ? 4000 : location.port;
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(
      `${protocol}://${location.hostname}:${WS_PORT}`,
    );
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "ping" }));
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data: WSData = JSON.parse(event.data);
      if (data.type === "pong") console.log("pong");
      if (data.type === "history" && data.messages)
        setMessagesState(data.messages);
      if (data.type === "chat" && data.messages) {
        console.log(data.messages);
        setMessagesState((prev) => [...prev, ...data.messages]);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      // можно реализовать переподключение
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("name", userNameInput);
  }, [userNameInput]);

  useEffect(() => {
    localStorage.setItem("key", keyInput);
  }, [keyInput]);

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <Messages
          messagesState={messagesState}
          messagesRef={messagesRef}
          userNameInput={userNameInput}
          keyInput={keyInput}
        />

        <Inputs
          userNameInput={userNameInput}
          setUserNameInput={setUserNameInput}
          keyInput={keyInput}
          setKeyInput={setKeyInput}
          socketRef={socketRef}
        />
      </div>
    </div>
  );
};

export default App;
