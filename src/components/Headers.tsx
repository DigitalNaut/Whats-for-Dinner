import type { PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

import { useHeaderContext } from "src/hooks/HeaderContext";
import { useUser } from "src/hooks/UserContext";

import Chopsticks from "src/assets/chopsticks.svg?react";

export function TitleHeader({ children }: PropsWithChildren) {
  const { UserCard } = useUser();

  return (
    <header className="relative flex flex-col pb-6">
      <div className="absolute -top-2 right-2">
        <UserCard />
      </div>
      <h1 className="text-center font-bangers text-4xl [text-shadow:1px_2px_0px_rgba(245,158,11,1)] sm:text-5xl md:text-6xl">
        {children}
      </h1>
      <Chopsticks className="w-full" />
    </header>
  );
}

export function MenuHeader() {
  const navigate = useNavigate();
  const { headerProperties, menuButton } = useHeaderContext();
  const { backTo, title, altBackButton, altColor } = headerProperties;
  const { UserCard } = useUser();

  return (
    <div
      className={`relative flex w-full items-center justify-between gap-4 ${
        altColor ? "bg-amber-600" : "bg-purple-800"
      } px-4 py-2 md:rounded-t-xl`}
    >
      {altBackButton ?? (
        <button
          aria-label="Atrás"
          onClick={() => {
            backTo ? navigate(backTo) : navigate(-1);
          }}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
      )}
      <span className="flex-1">{title}</span>
      {menuButton}
      <UserCard />
    </div>
  );
}
