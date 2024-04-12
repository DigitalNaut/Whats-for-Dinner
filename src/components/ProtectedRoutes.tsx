import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useUser } from "src/contexts/UserContext";

type ProtectedRoutesProps = {
  redirectTo: string;
};

export default function ProtectedRoutes({ redirectTo }: ProtectedRoutesProps) {
  const { user } = useUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const from = "?redirectTo=" + encodeURI(pathname.slice(1));

  useEffect(() => {
    if (!user) navigate(redirectTo + from);
  }, [user, navigate, redirectTo, from]);

  if (user) return <Outlet />;
  else return null;
}
