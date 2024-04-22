import { type PropsWithChildren } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { type ButtonProps, Button } from "@ariakit/react";

type Props = PropsWithChildren<{
  icon?: IconDefinition;
  className?: string;
}> &
  ButtonProps;

export default function ThemedButton({
  children,
  icon,
  className,
  ...props
}: Props) {
  return (
    <Button
      className={twMerge(
        "bg-white text-purple-500 px-3 py-1 rounded-full hover:bg-gray-200 hover:text-purple-900 active:bg-gray-400 active:text-gray-700 disabled:bg-gray-500 disabled:text-gray-400 focus:ring flex items-center justify-center gap-1",
        className,
      )}
      {...props}
    >
      {icon && <FontAwesomeIcon icon={icon} />}
      <span>{children}</span>
    </Button>
  );
}
