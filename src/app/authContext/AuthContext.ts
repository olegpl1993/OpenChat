import { createContext, useContext } from "react";

export interface AuthContextType {
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  loggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  publicKey: string;
  setPublicKey: React.Dispatch<React.SetStateAction<string>>;
  privateKey: string;
  setPrivateKey: React.Dispatch<React.SetStateAction<string>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext missing");
  return ctx;
};
