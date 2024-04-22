import { type PropsWithChildren } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { type ButtonProps, Button } from "@ariakit/react";

type Props = PropsWithChildren<{
  icon?: IconDefinition;
  className?: string;
  danger?: true;
}> &
  ButtonProps;

export default function ThemedButton({
  children,
  icon,
  className,
  danger,
  ...props
}: Props) {
  return (
    <Button
      className={twMerge(
        "bg-white text-purple-500 px-3 py-1 rounded-full hover:bg-gray-200 hover:text-purple-900 active:bg-gray-400 active:text-gray-700 disabled:bg-gray-500 disabled:text-gray-400 focus:ring flex items-center justify-center gap-1",
        danger &&
          "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 hover:text-white active:text-white",
        className,
      )}
      {...props}
    >
      {icon && <FontAwesomeIcon icon={icon} />}
      <span>{children}</span>
    </Button>
  );
}
