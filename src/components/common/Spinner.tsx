import { twMerge } from "tailwind-merge";

import { useLanguageContext } from "src/contexts/LanguageContext";
import FontAwesomeIcon from "src/components/common/FontAwesomeIcon";

export default function Spinner({
  text,
  cover,
}: {
  text?: string;
  cover?: true;
}) {
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
