import type { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

import { useLanguageContext } from "src/contexts/LanguageContext";

import GoogleLogo from "src/assets/google-logo.svg?react";

export default function GoogleLoginButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { t } = useLanguageContext();

  return (
    <button
      className={twMerge(
        "h-10 rounded-full bg-white py-0 pl-3 pr-4 font-roboto text-sm font-medium text-[#3c4043]",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-center gap-2 tracking-wide">
        <GoogleLogo />
        <span>{t("Sign in with Google")}</span>
      </div>
    </button>
  );
}
