import { memo } from "react";
import type { Dialog } from "../../../../types/types";
import { useAuthContext } from "../../../app/authContext/AuthContext";
import { authService } from "../../../app/authContext/authService";
import closeIcon from "../../../assets/close.svg";
import deleteIcon from "../../../assets/delete.svg";
import exitIcon from "../../../assets/exit.svg";
import searchIcon from "../../../assets/search.svg";
import usersIcon from "../../../assets/users.svg";
import styles from "./Info.module.css";

type Props = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: () => void;
  isOpenUsersPanel: boolean;
  setIsOpenUsersPanel: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDialog: Dialog | null;
  handleCloseSelectedDialog: () => void;
  handleDeleteSelectedDialog: () => void;
};

const Info = ({
  search,
  setSearch,
  handleSearch,
  isOpenUsersPanel,
  setIsOpenUsersPanel,
  selectedDialog,
  handleCloseSelectedDialog,
  handleDeleteSelectedDialog,
}: Props) => {
  const { userName } = useAuthContext();
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

          {selectedDialog ? (
            <>
              <div className={styles.selectedDialog}>
                {selectedDialog.username}
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => handleCloseSelectedDialog()}
              >
                <img src={closeIcon} className={styles.closeIcon} />
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDeleteSelectedDialog()}
              >
                <img src={deleteIcon} className={styles.deleteIcon} />
              </button>
            </>
          ) : (
            <>
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
              <button
                className={styles.searchBtn}
                onClick={() => handleSearch()}
              >
                <img src={searchIcon} className={styles.searchIcon} />
              </button>
            </>
          )}
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
