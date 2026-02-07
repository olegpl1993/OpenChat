import { memo } from "react";
import userAvatarIcon from "../../../../../public/userAvatar.svg";
import styles from "./UsersPanel.module.css";

interface Props {
  onlineUsers: string[];
}

const UserPanel = ({ onlineUsers }: Props) => {
  return (
    <div className={styles.usersPanel}>
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
