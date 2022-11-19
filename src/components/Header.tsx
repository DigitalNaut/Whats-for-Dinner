import type { PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

import { useNavigationContext } from "src/hooks/NavigationContext";

import { ReactComponent as Chopsticks } from "src/assets/chopsticks.svg";

export function TitleHeader({ children }: PropsWithChildren) {
  return (
    <header className="flex flex-col pb-6">
      <h1 className="text-center font-bangers text-4xl [text-shadow:1px_2px_0px_rgba(245,158,11,1)] sm:text-5xl md:text-6xl">
        {children}
      </h1>

      <Chopsticks className="w-full" />
    </header>
  );
}

export function MenuHeader() {
  const navigate = useNavigate();
  const { backTo, title, menu, altBackButton, altColor } =
    useNavigationContext();

  return (
    <div
      className={`relative flex w-full items-center justify-between gap-4 ${
        altColor ? "bg-amber-600" : "bg-purple-800"
      } px-4 py-2 md:rounded-t-xl`}
    >
      {altBackButton ?? (
        <button
          onClick={() => {
            backTo ? navigate(backTo) : navigate(-1);
          }}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
      )}
      <span className="flex-1">{title}</span>
      {menu}
    </div>
  );
}
