import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  const isLogged = token && token !== "undefined" && token !== "null";

  if (!isLogged) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}