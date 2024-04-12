import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type SpinnerProps = {
  text?: string;
};

export default function Spinner({ text = "Loading..." }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
      {text}
    </div>
  );
}
