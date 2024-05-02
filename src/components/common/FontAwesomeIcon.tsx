import { twMerge } from "tailwind-merge";

type Props = {
  className?: string;
};

export default function FontAwesomeIcon({ className }: Props) {
  return <i className={twMerge("fa-solid", className)}></i>;
}
