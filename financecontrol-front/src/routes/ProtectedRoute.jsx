import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ roles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  const isLogged = token && token !== "undefined" && token !== "null";

  if (!isLogged || !role) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(role)) {
    return (
      <Navigate to={role === "SUPERADMIN" ? "/admin/usuarios" : "/home"} replace />
    );
  }

  return <Outlet />;
}
