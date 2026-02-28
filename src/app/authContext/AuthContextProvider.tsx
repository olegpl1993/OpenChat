import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { authService } from "./authService";

interface Props {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: Props) => {
  const [userName, setUserName] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    const unsub = authService.subscribe(
      (user, loggedIn, publicKey, privateKey) => {
        setUserName(user?.username ?? "");
        setLoggedIn(loggedIn);
        setPublicKey(publicKey ?? "");
        setPrivateKey(privateKey ?? "");
      },
    );

    authService.checkAuth();
    return unsub;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userName,
        setUserName,
        loggedIn,
        setLoggedIn,
        publicKey,
        setPublicKey,
        privateKey,
        setPrivateKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
