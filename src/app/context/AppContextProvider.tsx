import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../../services/authService";
import { AppContext } from "./AppContext";

interface Props {
  children: ReactNode;
}

export const AppContextProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [key, setKey] = useState(() => localStorage.getItem("key") ?? "");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (userName && loggedIn) {
      navigate("/chat");
    } else {
      navigate("/");
    }
  }, [userName, loggedIn, navigate]);

  useEffect(() => {
    if (key) localStorage.setItem("key", key);
    else localStorage.removeItem("key");
  }, [key]);

  useEffect(() => {
    checkAuth(setUserName, setLoggedIn);
  }, [userName]);

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
