import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../authContext/AuthContext";

export default function GuestOnly() {
  const { loggedIn } = useAuthContext();

  if (loggedIn) {
    return <Navigate to="/chat" replace />;
  }

  return <Outlet />;
}
