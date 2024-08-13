import { type PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import { type ButtonProps, Button } from "@ariakit/react";

import FontAwesomeIcon from "src/components/common/FontAwesomeIcon";

type Props = PropsWithChildren<{
  iconStyle?: string;
  className?: string;
  danger?: true;
}> &
  ButtonProps;

export default function ThemedButton({
  children,
  iconStyle,
  className,
  danger,
  ...props
}: Props) {
  return (
    <Button
      className={twMerge(
        "flex items-center justify-center gap-1 rounded-full bg-white px-3 py-1 text-purple-500 hover:bg-gray-200 hover:text-purple-900 focus:ring active:bg-gray-400 active:text-gray-700 disabled:bg-gray-500 disabled:text-gray-400",
        danger &&
          "bg-red-500 text-white hover:bg-red-600 hover:text-white active:bg-red-700 active:text-white",
        className,
      )}
      {...props}
    >
      {iconStyle && <FontAwesomeIcon className={iconStyle} />}
      <span>{children}</span>
    </Button>
  );
}
