import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useUser } from "src/hooks/UserContext";

type LoginProps = {
  redirectTo: string;
};

export default function Login({ redirectTo }: LoginProps) {
  const { user, LoginButton } = useUser();
  const navigate = useNavigate();
  const { search } = useLocation();
  const from = decodeURI(new URLSearchParams(search).get("redirectTo") || "");

  useEffect(() => {
    if (user) navigate(from || redirectTo, { replace: true });
  });

  return (
    <div className="flex h-full items-center justify-center">
      <LoginButton />
    </div>
  );
}
