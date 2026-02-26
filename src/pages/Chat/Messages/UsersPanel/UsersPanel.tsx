import { memo } from "react";
import type { Dialog } from "../../../../../types/types";
import userAvatarIcon from "../../../../assets/userAvatar.svg";
import styles from "./UsersPanel.module.css";

interface Props {
  onlineUsers: string[];
  dialogs: Dialog[];
  selectedDialog: Dialog | null;
  handleSelectDialog: (dialog: Dialog) => void;
}

const UserPanel = ({
  onlineUsers,
  dialogs,
  selectedDialog,
  handleSelectDialog,
}: Props) => {
  return (
    <div className={styles.usersPanel}>
      <div className={styles.usersList}>
        <div className={styles.title}>Dialogs</div>
        {dialogs.map((dialog) => (
          <button
            key={dialog.dialog_id}
            className={`${styles.dialogItem} ${
              dialog.dialog_id === selectedDialog?.dialog_id && styles.selected
            }`}
            onClick={() => handleSelectDialog(dialog)}
          >
            <img
              src={userAvatarIcon}
              className={`${styles.userAvatarIcon} ${
                dialog.dialog_id === selectedDialog?.dialog_id &&
                styles.selectedAvatar
              }`}
            />
            {dialog.username}
          </button>
        ))}
      </div>

      <div className={styles.usersList}>
        <div className={styles.title}>Online users</div>
        {onlineUsers.map((user) => (
          <div key={user} className={styles.userItem}>
            <img src={userAvatarIcon} className={styles.userAvatarIcon} />
            {user}
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(UserPanel);
