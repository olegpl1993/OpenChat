import { memo } from "react";
import type { Dialog, User } from "../../../../../types/types";
import userAvatarIcon from "../../../../assets/userAvatar.svg";
import styles from "./UsersPanel.module.css";

interface Props {
  onlineUsers: User[];
  dialogs: Dialog[];
  selectedDialog: Dialog | null;
  handleSelectDialog: (dialog: Dialog) => void;
  handleCreateDialog: (userId: number) => void;
}

const UserPanel = ({
  onlineUsers,
  dialogs,
  selectedDialog,
  handleSelectDialog,
  handleCreateDialog,
}: Props) => {
  return (
    <div className={styles.usersPanel}>
      {dialogs.length > 0 && (
        <div className={styles.usersList}>
          <div className={styles.title}>Dialogs</div>
          {dialogs.map((dialog) => (
            <button
              key={dialog.dialog_id}
              className={`${styles.dialogItem} ${
                dialog.dialog_id === selectedDialog?.dialog_id &&
                styles.selected
              }`}
              onClick={() => handleSelectDialog(dialog)}
            >
              {dialog.username}
            </button>
          ))}
        </div>
      )}

      <div className={styles.usersList}>
        <div className={styles.title}>Online users</div>
        {onlineUsers.map((user) => (
          <button
            key={user.userId}
            className={styles.userItem}
            onClick={() => handleCreateDialog(user.userId)}
          >
            <img src={userAvatarIcon} className={styles.userAvatarIcon} />
            {user.username}
          </button>
        ))}
      </div>
    </div>
  );
};

export default memo(UserPanel);
