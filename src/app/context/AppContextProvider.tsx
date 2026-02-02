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

  useEffect(() => {
    if (userName) {
      navigate("/chat");
    } else {
      navigate("/");
    }
  }, [userName, navigate]);

  return (
    <AppContext.Provider
      value={{
        userName,
        setUserName,
        key,
        setKey,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
