import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../../app/context/AppContext";
import styles from "./Info.module.css";

type Props = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: () => void;
};

const Info = ({ search, setSearch, handleSearch }: Props) => {
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
      <input
        className={styles.input}
        placeholder="search by name"
        maxLength={25}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
          }
        }}
        value={search}
        name="user"
        type="text"
        autoComplete="off"
      />
      <div className={styles.loginPanel}>
        <button className={styles.exit} onClick={() => handleExit()}>
          Exit
        </button>
        <div className={styles.name}>{userName}</div>
      </div>
    </div>
  );
};

export default Info;
