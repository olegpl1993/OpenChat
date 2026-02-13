import { memo } from "react";
import { useAppContext } from "../../../app/context/AppContext";
import exitIcon from "../../../assets/exit.svg";
import searchIcon from "../../../assets/search.svg";
import usersIcon from "../../../assets/users.svg";
import { authService } from "../../Auth/authService";
import styles from "./Info.module.css";

type Props = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: () => void;
  isOpenUsersPanel: boolean;
  setIsOpenUsersPanel: React.Dispatch<React.SetStateAction<boolean>>;
};

const Info = ({
  search,
  setSearch,
  handleSearch,
  isOpenUsersPanel,
  setIsOpenUsersPanel,
}: Props) => {
  const { userName } = useAppContext();
  const handleExit = () => authService.logout();

  return (
    <div className={styles.info}>
      <div className={styles.panelBox}>
        <div className={styles.panel}>
          <button
            className={styles.usersToggle}
            onClick={() => setIsOpenUsersPanel(!isOpenUsersPanel)}
          >
            <img src={usersIcon} className={styles.usersIcon} />
          </button>

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
          <button className={styles.searchBtn} onClick={() => handleSearch()}>
            <img src={searchIcon} className={styles.searchIcon} />
          </button>
        </div>

        <div className={styles.panel}>
          <div className={styles.name}>{userName}</div>
          <button className={styles.exit} onClick={() => handleExit()}>
            <img src={exitIcon} className={styles.exitIcon} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(Info);
