import { useState } from "react";
import styles from "./Register.module.css";

const Register = () => {
  const [formUserNameInput, setFormUserNameInput] = useState("");
  const [formPasswordInput, setFormPasswordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    setSuccess(null);

    if (!formUserNameInput || !formPasswordInput) {
      setError("Enter login and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formUserNameInput,
          password: formPasswordInput,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Register error");
      }

      const data = await response.json();
      setSuccess(`${data.username} registered successfully`);
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
      className={styles.register}
      onSubmit={(e) => {
        e.preventDefault();
        handleRegister();
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
        {loading ? "Registration..." : "Registration"}
      </button>

      <div className={styles.info}>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
      </div>
    </form>
  );
};

export default Register;
