import { createContext, useContext } from "react";

export interface AppContextType {
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  loggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  key: string;
  setKey: React.Dispatch<React.SetStateAction<string>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("AppContext missing");
  return ctx;
};
