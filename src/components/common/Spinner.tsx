import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useLanguageContext } from "src/contexts/LanguageContext";

type SpinnerProps = {
  text?: string;
};

export default function Spinner({ text }: SpinnerProps) {
  const { t } = useLanguageContext();

  return (
    <div className="flex items-center justify-center gap-2">
      <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
      {text ?? t("Loading...")}
    </div>
  );
}
