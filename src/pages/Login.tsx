import { Suspense, lazy, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useUser } from "src/hooks/useUserContext";
import { useLanguageContext } from "src/hooks/useLanguageContext";
import { LoginButton } from "src/hooks/useUserContext/Context";
import LanguageSelect from "src/components/LanguageSelect";
import LegalLinks from "src/components/LegalLinks";
import Spinner from "src/components/common/Spinner";

const LazyRoulettePreview = lazy(
  () => import("src/components/RoulettePreview"),
);

type LoginProps = {
  redirectTo: string;
};

export default function Login({ redirectTo }: LoginProps) {
  const { t, i18n } = useLanguageContext();
  const { user } = useUser();
  const navigate = useNavigate();
  const { search } = useLocation();

  const from = useMemo(
    () => decodeURI(new URLSearchParams(search).get("redirectTo") || ""),
    [search],
  );

  useEffect(() => {
    if (user) void navigate(from || redirectTo, { replace: true });
  }, [from, navigate, redirectTo, user]);

  return (
    <div className="flex h-full flex-col items-center justify-between gap-4 p-4">
      <div className="group relative flex size-[340px] items-center justify-center drop-shadow-lg">
        <Suspense
          fallback={
            <div className="text-8xl text-white/50">
              <Spinner text="" />
            </div>
          }
        >
          <LazyRoulettePreview lang={i18n.language} />
        </Suspense>
      </div>
      <section className="flex max-w-min flex-col items-center gap-4 rounded-lg bg-white p-6 text-center shadow-lg">
        <p className="font-bold text-amber-500">{t("Login to get started")}</p>

        <p className="text-sm text-slate-900">{t("Google account needed")}</p>

        <LoginButton />
      </section>

      <LanguageSelect />

      <LegalLinks className="text-sm text-amber-400" />
    </div>
  );
}
