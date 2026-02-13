import { useEffect, useState, type ReactNode } from "react";
import { authService } from "../../pages/Auth/authService";
import { AppContext } from "./AppContext";

interface Props {
  children: ReactNode;
}

export const AppContextProvider = ({ children }: Props) => {
  const [userName, setUserName] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [key, setKey] = useState(() => localStorage.getItem("key") ?? "");

  useEffect(() => {
    const unsub = authService.subscribe((user, loggedIn) => {
      setUserName(user?.username ?? "");
      setLoggedIn(loggedIn);
    });

    authService.checkAuth();
    return unsub;
  }, []);

  useEffect(() => {
    if (key) localStorage.setItem("key", key);
    else localStorage.removeItem("key");
  }, [key]);

  return (
    <AppContext.Provider
      value={{
        userName,
        setUserName,
        loggedIn,
        setLoggedIn,
        key,
        setKey,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
