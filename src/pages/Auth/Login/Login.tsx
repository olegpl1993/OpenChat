import { useState } from "react";
import { useAppContext } from "../../../app/context/AppContext";
import eyeHideIcon from "../../../assets/eyeHide.svg";
import eyeShowIcon from "../../../assets/eyeShow.svg";
import { authService } from "../../../services/authService";
import styles from "./Login.module.css";

const Login = () => {
  const { setKey } = useAppContext();

  const [formUserNameInput, setFormUserNameInput] = useState("");
  const [formPasswordInput, setFormPasswordInput] = useState("");
  const [formKeyInput, setFormKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError(null);

    if (!formUserNameInput || !formPasswordInput) {
      setError("Enter login and password");
      return;
    }

    setLoading(true);
    try {
      await authService.login(formUserNameInput, formPasswordInput);
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

      <div className={styles.passwordWrapper}>
        <input
          className={styles.input}
          placeholder="password"
          maxLength={15}
          onChange={(e) => setFormPasswordInput(e.target.value)}
          value={formPasswordInput}
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="off"
        />

        <button
          type="button"
          className={styles.eyeButton}
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? (
            <img src={eyeHideIcon} alt="eyeHide" className={styles.eyeIcon} />
          ) : (
            <img src={eyeShowIcon} alt="eyeShow" className={styles.eyeIcon} />
          )}
        </button>
      </div>

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
