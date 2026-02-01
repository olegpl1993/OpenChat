import { useEffect, useState, type ReactNode } from "react";
import { AppContext } from "./AppContext";

interface Props {
  children: ReactNode;
}

export const AppContextProvider = ({ children }: Props) => {
  const [userNameInput, setUserNameInput] = useState(
    () => localStorage.getItem("name") ?? "",
  );
  const [keyInput, setKeyInput] = useState(
    () => localStorage.getItem("key") ?? "",
  );
  useEffect(() => {
    localStorage.setItem("name", userNameInput);
  }, [userNameInput]);

  useEffect(() => {
    localStorage.setItem("key", keyInput);
  }, [keyInput]);

  return (
    <AppContext.Provider
      value={{ userNameInput, setUserNameInput, keyInput, setKeyInput }}
    >
      {children}
    </AppContext.Provider>
  );
};
