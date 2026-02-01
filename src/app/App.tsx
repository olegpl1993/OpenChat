import { Outlet } from "react-router-dom";
import styles from "./App.module.css";
import { AppContextProvider } from "./context/AppContextProvider";

const App = () => {
  return (
    <AppContextProvider>
      <div className={styles.app}>
        <Outlet />
      </div>
    </AppContextProvider>
  );
};

export default App;
