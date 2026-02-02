import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../app/context/AppContext";
import styles from "./Info.module.css";

const Info = () => {
  const { userName, setUserName, setKey } = useAppContext();
  const navigate = useNavigate();

  const handleExit = () => {
    setUserName("");
    setKey("");
    localStorage.removeItem("name");
    localStorage.removeItem("key");
    navigate("/");
  };

  return (
    <div className={styles.info}>
      <button className={styles.exit} onClick={() => handleExit()}>
        Exit
      </button>
      <div className={styles.name}>{userName}</div>
    </div>
  );
};

export default Info;
