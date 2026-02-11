import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { AppContext } from "./AppContext";

interface Props {
  children: ReactNode;
}

export const AppContextProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [key, setKey] = useState(() => localStorage.getItem("key") ?? "");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = authService.subscribe((user, loggedIn) => {
      setUserName(user?.username ?? "");
      setLoggedIn(loggedIn);
      setAuthReady(true);
    });

    authService.checkAuth();
    return unsub;
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (loggedIn) navigate("/chat");
    else navigate("/");
  }, [loggedIn, authReady, navigate]);

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
