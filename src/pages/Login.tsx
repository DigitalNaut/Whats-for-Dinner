import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LanguageSelect from "src/components/LanguageSelect";

import { useLanguageContext } from "src/contexts/LanguageContext";
import { useUser } from "src/contexts/UserContext";

type LoginProps = {
  redirectTo: string;
};

export default function Login({ redirectTo }: LoginProps) {
  const { t } = useLanguageContext();
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

      <LanguageSelect />

      <div className="flex flex-col gap-1 text-center text-sm text-white">
        <Link to="/terms" className="w-full hover:underline">
          {t("Terms and Conditions")}
        </Link>
        <Link to="/privacy" className="w-full hover:underline">
          {t("Privacy Policy")}
        </Link>
      </div>
    </div>
  );
}
