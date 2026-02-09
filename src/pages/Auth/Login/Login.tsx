import { useState } from "react";
import { useAppContext } from "../../../app/context/AppContext";
import styles from "./Login.module.css";

const Login = () => {
  const { setUserName, setToken, setKey } = useAppContext();
  const [formUserNameInput, setFormUserNameInput] = useState("");
  const [formPasswordInput, setFormPasswordInput] = useState("");
  const [formKeyInput, setFormKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    if (!formUserNameInput || !formPasswordInput) {
      setError("Enter login and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formUserNameInput,
          password: formPasswordInput,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Login error");
      }

      const data = await response.json();
      setUserName(data.username);
      setToken(data.token);
      setKey(formKeyInput);

      setFormUserNameInput("");
      setFormPasswordInput("");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={styles.login}
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
    >
      <input
        className={styles.input}
        placeholder="login"
        maxLength={15}
        onChange={(e) => setFormUserNameInput(e.target.value)}
        value={formUserNameInput}
        name="login"
        type="text"
        autoComplete="off"
      />

      <input
        className={styles.input}
        placeholder="password"
        maxLength={15}
        onChange={(e) => setFormPasswordInput(e.target.value)}
        value={formPasswordInput}
        name="password"
        type="password"
        autoComplete="off"
      />

      <button
        className={styles.buttonEnter}
        type="submit"
        disabled={
          formUserNameInput.length < 3 ||
          formPasswordInput.length < 3 ||
          loading
        }
      >
        {loading ? "Login..." : "Login"}
      </button>

      <div className={styles.info}>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <input
        className={styles.input}
        placeholder="crypto key"
        maxLength={15}
        onChange={(e) => setFormKeyInput(e.target.value)}
        value={formKeyInput}
        name="key"
        type="text"
        autoComplete="off"
      />
    </form>
  );
};

export default Login;
