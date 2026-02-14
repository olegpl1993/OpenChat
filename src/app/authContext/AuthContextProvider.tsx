import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { authService } from "./authService";

interface Props {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: Props) => {
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
    <AuthContext.Provider
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
    </AuthContext.Provider>
  );
};
