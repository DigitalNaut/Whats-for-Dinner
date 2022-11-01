import { Navigate, Outlet } from "react-router-dom";

import { useUser } from "src/hooks/UserContext";

export default function ProtectedRoutes() {
  const { user } = useUser();

  // * User undefined means the context is still loading
  if (!user) return <Navigate to={"/"} />;
  else return <Outlet />;
}
