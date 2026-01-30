import { useEffect, useState } from "react";
import { decrypt } from "../../service/crypt";
import "./Message.css";

interface MessageProps {
  name: string;
  text: string;
  currentUser: string;
  criptoKey: string;
}

export const Message = ({ name, text, currentUser, criptoKey }: MessageProps) => {
  const [decryptedText, setDecryptedText] = useState("");

  useEffect(() => {
    async function decryptText() {
      const decryptedText = await decrypt(text, criptoKey);
      setDecryptedText(decryptedText);
    }
    decryptText();
  }, [text, criptoKey]);

  const isUser = name === currentUser;

  return (
    <div className={`message ${isUser ? "user" : "other"}`}>
      <p className={`userName ${isUser ? "user" : "other"}`}>{name}</p>
      <p className={`messageText ${isUser ? "user" : "other"}`}>{decryptedText}</p>
    </div>
  );
};
