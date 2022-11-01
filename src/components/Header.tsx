import { ReactComponent as Chopsticks } from "src/assets/chopsticks.svg";

export default function Header({ children }: { children?: string }) {
  return (
    <header className="flex flex-col">
      <h1 className="font-bangers text-center text-4xl sm:text-5xl md:text-6xl [text-shadow:1px_2px_0px_rgba(245,158,11,1)]">
        {children}
      </h1>

      <Chopsticks className="w-full" />
    </header>
  );
}
