import type { ButtonHTMLAttributes } from "react";
import { ReactComponent as GoogleLogo } from "src/assets/google-logo.svg";

export default function GoogleLoginButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`h-10 font-roboto py-0 pl-3 pr-4 bg-white rounded-full text-[#3c4043] text-sm font-medium ${className}`}
      {...props}
    >
      <div className="flex gap-2 justify-center items-start tracking-wide">
        <GoogleLogo />
        <span>Acceder con Google</span>
      </div>
    </button>
  );
}
