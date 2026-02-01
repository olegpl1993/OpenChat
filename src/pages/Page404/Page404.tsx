import { Link } from "react-router-dom";
import styles from "./Page404.module.css";

const Page404 = () => {
  return (
    <div className={styles.page404}>
      <Link to="/" className={styles.link}>
        Page not found
      </Link>
    </div>
  );
};

export default Page404;
