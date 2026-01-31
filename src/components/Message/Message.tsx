import { useEffect, useState } from "react";
import { decrypt } from "../../service/crypt";
import styles from "./Message.module.css";

interface Props {
  name: string;
  text: string;
  currentUser: string;
  criptoKey: string;
}

const Message = ({ name, text, currentUser, criptoKey }: Props) => {
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
    <div className={`${styles.message} ${isUser ? styles.user : styles.other}`}>
      <p
        className={`${styles.userName} ${isUser ? styles.user : styles.other}`}
      >
        {name}
      </p>
      <p
        className={`${styles.messageText} ${isUser ? styles.user : styles.other}`}
      >
        {decryptedText}
      </p>
    </div>
  );
};

export default Message;
