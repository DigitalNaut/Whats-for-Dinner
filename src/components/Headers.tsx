import { type PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

import BackButton from "src/components/common/BackButton";
import { useHeaderContext } from "src/hooks/useHeaderContext";
import { useUser } from "src/hooks/useUserContext";

import Chopsticks from "src/assets/chopsticks.svg?react";

export function TitleHeader({ children }: PropsWithChildren) {
  const { UserCard } = useUser();

  return (
    <header className="relative flex flex-col items-center pb-6">
      <div className="absolute -top-2 right-2">
        <UserCard size="md" />
      </div>
      <h1 className="font-bangers text-center text-4xl [text-shadow:1px_2px_0px_rgba(245,158,11,1)] sm:text-5xl md:text-6xl">
        {children}
      </h1>
      <Chopsticks />
    </header>
  );
}

export function MenuHeader() {
  const { headerProperties } = useHeaderContext();
  const { altBackButton, altColor, elements } = headerProperties;
  const { UserCard } = useUser();

  return (
    <div
      className={twMerge(
        "relative flex h-14 w-full items-center justify-between px-4 py-2 md:rounded-t-xl",
        altColor ? "bg-amber-600" : "bg-purple-800",
      )}
    >
      {altBackButton ?? <BackButton className="text-white" />}

      <div className="flex items-center gap-2">
        {elements}
        <UserCard size="sm" />
      </div>
    </div>
  );
}
