import { Outlet } from "react-router-dom";
import styles from "./App.module.css";
import { AuthContextProvider } from "./authContext/AuthContextProvider";

const App = () => {
  return (
    <AuthContextProvider>
      <div className={styles.app}>
        <Outlet />
      </div>
    </AuthContextProvider>
  );
};

export default App;
