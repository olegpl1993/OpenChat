import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../authContext/AuthContext";

export function RequireAuth() {
  const { loggedIn } = useAuthContext();

  if (!loggedIn) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RequireAuth;
