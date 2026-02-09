import { useState } from "react";
import styles from "./Auth.module.css";
import Login from "./Login/Login";
import Register from "./Register/Register";

const Auth = () => {
  const [loginToggle, setLoginToggle] = useState(true);

  return (
    <div className={styles.auth}>
      <div className={styles.toggle}>
        <button
          className={`${styles.tab} ${loginToggle ? styles.active : ""}`}
          onClick={() => setLoginToggle(true)}
        >
          Login
        </button>
        <button
          className={`${styles.tab} ${!loginToggle ? styles.active : ""}`}
          onClick={() => setLoginToggle(false)}
        >
          Registration
        </button>
      </div>

      <div className={styles.formContainer}>
        {loginToggle ? <Login /> : <Register />}
      </div>
    </div>
  );
};

export default Auth;
