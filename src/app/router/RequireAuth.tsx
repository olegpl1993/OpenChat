import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export function RequireAuth() {
  const { loggedIn } = useAppContext();

  if (!loggedIn) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RequireAuth;
