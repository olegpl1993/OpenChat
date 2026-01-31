import { useEffect, useRef, useState } from "react";
import { type MessageType, type WSData } from "../../types/types";
import Messages from "../components/Messages/Messages";
import { encrypt } from "../service/crypt";
import "./App.css";

const App = () => {
  const socketRef = useRef<WebSocket | null>(null);

  const [messagesState, setMessagesState] = useState<MessageType[]>([]);
  const [messageTextInput, setMessageTextInput] = useState("");
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

  const handleSend = async () => {
    if (!messageTextInput || !userNameInput) return;
    const cryptoMessageText = await encrypt(messageTextInput, keyInput);
    if (!cryptoMessageText) return;

    const createdMessage: MessageType = {
      id: Date.now(),
      user: userNameInput,
      text: cryptoMessageText,
      created_at: new Date().toISOString(),
    };

    socketRef.current?.send(
      JSON.stringify({
        type: "chat",
        messages: [createdMessage],
      }),
    );

    setMessageTextInput("");
  };

  return (
    <div className="container">
      <div className="wrapper">
        <Messages
          messagesState={messagesState}
          messagesRef={messagesRef}
          userNameInput={userNameInput}
          keyInput={keyInput}
        />

        <div className="inputWrapper">
          <div className="inputBox">
            <div className="inputContainer">
              <input
                id="nameInput"
                className="input"
                placeholder="name"
                maxLength={25}
                onChange={(e) => setUserNameInput(e.target.value)}
                value={userNameInput}
              />
              <input
                id="keyInput"
                className="input"
                placeholder="crypto key"
                maxLength={25}
                onChange={(e) => setKeyInput(e.target.value)}
                value={keyInput}
              />
            </div>
            <div className="inputContainer">
              <input
                id="chatInput"
                className="input"
                placeholder="message"
                maxLength={300}
                onChange={(e) => setMessageTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                value={messageTextInput}
              />
            </div>
          </div>
          <button
            id="button"
            className="buttonSend"
            onClick={() => handleSend()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
