import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./AppContext";

interface Props {
  children: ReactNode;
}

export const AppContextProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  const [userNameInput, setUserNameInput] = useState(
    () => localStorage.getItem("name") ?? "",
  );
  const [keyInput, setKeyInput] = useState(
    () => localStorage.getItem("key") ?? "",
  );

  useEffect(() => {
    if (userNameInput) {
      navigate("/chat");
    } else {
      navigate("/");
    }
  }, [userNameInput, navigate]);

  return (
    <AppContext.Provider
      value={{ userNameInput, setUserNameInput, keyInput, setKeyInput }}
    >
      {children}
    </AppContext.Provider>
  );
};
