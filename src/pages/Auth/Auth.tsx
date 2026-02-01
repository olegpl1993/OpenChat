import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../app/context/AppContext";
import styles from "./Auth.module.css";

const Auth = () => {
  const { setUserNameInput, setKeyInput } = useAppContext();
  const navigate = useNavigate();

  const [formUserNameInput, setFormUserNameInput] = useState("");
  const [formKeyInput, setFormKeyInput] = useState("");

  const handleEnter = () => {
    localStorage.setItem("name", formUserNameInput);
    localStorage.setItem("key", formKeyInput);
    setUserNameInput(formUserNameInput);
    setKeyInput(formKeyInput);
    navigate("/chat");
  };

  return (
    <div className={styles.auth}>
      <div className={styles.form}>
        <input
          className={styles.input}
          placeholder="name"
          maxLength={25}
          onChange={(e) => setFormUserNameInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleEnter();
            }
          }}
          value={formUserNameInput}
        />
        <input
          className={styles.input}
          placeholder="crypto key"
          maxLength={25}
          onChange={(e) => setFormKeyInput(e.target.value)}
          value={formKeyInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleEnter();
            }
          }}
        />
        <button
          className={styles.buttonEnter}
          onClick={() => handleEnter()}
          disabled={formUserNameInput.length < 3}
        >
          Enter
        </button>
      </div>
    </div>
  );
};

export default Auth;
