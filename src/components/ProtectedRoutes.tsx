import { Navigate, Outlet } from "react-router-dom";

import { useUser } from "src/hooks/UserContext";

type ProtectedRoutesProps = {
  redirectTo: string;
};

export default function ProtectedRoutes({ redirectTo }: ProtectedRoutesProps) {
  const { user } = useUser();

  // * User undefined means the context is still loading
  if (!user) return <Navigate to={redirectTo} />;
  else return <Outlet />;
}
