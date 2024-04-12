import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useUser } from "src/contexts/UserContext";

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
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <LoginButton />

      <div className="flex flex-col gap-1 text-center text-sm text-white">
        <Link to="/terms" className="w-full hover:underline">
          Términos y Condiciones
        </Link>
        <Link to="/privacy" className="w-full hover:underline">
          Póliza de Privacidad
        </Link>
      </div>
    </div>
  );
}
