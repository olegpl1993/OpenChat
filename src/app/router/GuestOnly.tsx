import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function GuestOnly() {
  const { loggedIn } = useAppContext();

  if (loggedIn) {
    return <Navigate to="/chat" replace />;
  }

  return <Outlet />;
}
