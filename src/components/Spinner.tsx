import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type SpinnerProps = {
  text?: string;
  size?: "sm" | "md";
};

export default function Spinner({
  text = "Loading...",
  size = "md",
}: SpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
      {size === "sm" ? "" : text}
    </div>
  );
}
