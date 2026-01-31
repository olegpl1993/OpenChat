import { memo, useEffect, useState } from "react";
import { decrypt } from "../../service/crypt";
import styles from "./Message.module.css";

interface Props {
  name: string;
  text: string;
  currentUser: string;
  cryptoKey: string;
}

const Message = ({ name, text, currentUser, cryptoKey }: Props) => {
  const [decryptedText, setDecryptedText] = useState("");

  const isUser = name === currentUser;
  const roleClass = isUser ? styles.user : styles.other;

  useEffect(() => {
    async function decryptText() {
      const decryptedText = await decrypt(text, cryptoKey);
      setDecryptedText(decryptedText);
    }
    decryptText();
  }, [text, cryptoKey]);

  return (
    <div className={`${styles.message} ${roleClass}`}>
      <p className={`${styles.userName} ${roleClass}`}>{name}</p>
      <p className={`${styles.messageText} ${roleClass}`}>{decryptedText}</p>
    </div>
  );
};

export default memo(Message);
