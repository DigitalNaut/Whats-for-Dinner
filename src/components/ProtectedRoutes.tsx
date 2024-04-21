import { type PropsWithChildren, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useUser } from "src/contexts/UserContext";

type ProtectedRoutesProps = {
  redirectTo: string;
};

export default function ProtectedRoutes({
  redirectTo,
  children,
}: PropsWithChildren<ProtectedRoutesProps>) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useUser();

  const from = useMemo(
    () => "?redirectTo=" + encodeURI(pathname.slice(1)),
    [pathname],
  );

  useEffect(() => {
    if (!user) navigate(redirectTo + from);
  }, [user, navigate, redirectTo, from]);

  return user ? children : null;
}
