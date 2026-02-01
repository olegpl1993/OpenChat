import { createContext, useContext } from "react";

export interface AppContextType {
  userNameInput: string;
  setUserNameInput: React.Dispatch<React.SetStateAction<string>>;
  keyInput: string;
  setKeyInput: React.Dispatch<React.SetStateAction<string>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("AppContext missing");
  return ctx;
};
