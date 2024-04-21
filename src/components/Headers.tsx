import type { PropsWithChildren } from "react";
import { useHeaderContext } from "src/contexts/HeaderContext";

import { useUser } from "src/contexts/UserContext";
import BackButton from "src/components/common/BackButton";

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
  const { headerProperties } = useHeaderContext();
  const { altBackButton, altColor, elements } = headerProperties;
  const { UserCard } = useUser();

  return (
    <div
      className={`relative flex w-full items-center justify-between ${
        altColor ? "bg-amber-600" : "bg-purple-800"
      } px-4 py-2 md:rounded-t-xl`}
    >
      {altBackButton ?? <BackButton className="text-white" />}

      <div className="flex gap-4">
        {elements}
        <UserCard />
      </div>
    </div>
  );
}
