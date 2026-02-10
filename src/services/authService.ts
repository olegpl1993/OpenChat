export const checkAuth = async (
  setUserName: (arg0: string) => void,
  setLoggedIn: (arg0: boolean) => void,
) => {
  console.log("Checking auth");
  try {
    const res = await fetch("/api/me", { credentials: "include" });
    if (!res.ok) throw new Error("Not logged in");

    const data = await res.json();
    if (data.loggedIn) {
      setUserName(data.username);
      setLoggedIn(true);
    } else {
      setUserName("");
      setLoggedIn(false);
    }
  } catch {
    setUserName("");
    setLoggedIn(false);
  }
};
