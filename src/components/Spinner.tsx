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
    <div className="flex gap-2 items-center justify-center">
      <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
      {size === "sm" ? "" : text}
    </div>
  );
}
