import { twMerge } from "tailwind-merge";

import { useLanguageContext } from "src/contexts/LanguageContext";
import FontAwesomeIcon from "src/components/common/FontAwesomeIcon";

type SpinnerProps = {
  text?: string;
  cover?: true;
};

export default function Spinner({ text, cover }: SpinnerProps) {
  const { t } = useLanguageContext();

  return (
    <div
      className={twMerge(
        "flex items-center justify-center gap-2",
        cover && "flex h-full items-center justify-center",
      )}
    >
      <FontAwesomeIcon className="fa-spinner fa-spin" />
      {text ?? t("Loading...")}
    </div>
  );
}
