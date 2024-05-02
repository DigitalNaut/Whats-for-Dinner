import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { useLanguageContext } from "src/contexts/LanguageContext";

type Props = {
  className?: string;
};

export default function LegalLinks({ className }: Props) {
  const { t } = useLanguageContext();

  return (
    <div className={twMerge("flex flex-col gap-1 text-center", className)}>
      <Link to="/terms" className="w-full hover:underline">
        {t("Terms & Conditions")}
      </Link>
      <Link to="/privacy" className="w-full hover:underline">
        {t("Privacy Policy")}
      </Link>
    </div>
  );
}
