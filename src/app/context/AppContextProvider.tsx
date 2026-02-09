import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./AppContext";

interface Props {
  children: ReactNode;
}

export const AppContextProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(
    () => localStorage.getItem("name") ?? "",
  );
  const [key, setKey] = useState(() => localStorage.getItem("key") ?? "");
  const [token, setToken] = useState(() => localStorage.getItem("token") ?? "");

  useEffect(() => {
    if (userName && token) {
      navigate("/chat");
    } else {
      navigate("/");
    }
  }, [userName, token, navigate]);

  useEffect(() => {
    if (userName) localStorage.setItem("name", userName);
    else localStorage.removeItem("name");
  }, [userName]);

  useEffect(() => {
    if (key) localStorage.setItem("key", key);
    else localStorage.removeItem("key");
  }, [key]);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  return (
    <AppContext.Provider
      value={{
        userName,
        setUserName,
        token,
        setToken,
        key,
        setKey,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
