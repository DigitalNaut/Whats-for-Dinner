import { useState } from "react";
import { Link } from "react-router-dom";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import { type SpinnerOption } from "src/components/SpinningWheel";
import { useLanguageContext } from "src/contexts/LanguageContext";
import { useSpinnerMenuContext } from "src/contexts/SpinnerMenuContext";
import Floating from "src/components/common/Floating";
import SpinningWheel from "src/components/SpinningWheel";
import ThemedButton from "src/components/common/ThemedButton";

const maxHistory = 20;

type DishProps = { label: string; imageUrl: string };

function Dish({ label, imageUrl }: DishProps) {
  return (
    <div className="group">
      <div className="relative aspect-square w-16 overflow-hidden rounded-lg bg-gray-700 md:w-24 lg:w-28">
        <span className="pointer-events-none absolute hidden size-full place-items-center bg-black/50 text-center text-sm group-hover:grid">
          {label}
        </span>
        <img className="size-full object-cover" src={imageUrl} alt={label} />
      </div>
    </div>
  );
}

const fireConfetti = () => {
  confetti({ particleCount: 100, spread: 360, origin: { y: 0.4 } });
};

type HistoryItem = SpinnerOption & { timestamp: number };

export default function Main() {
  const { t } = useLanguageContext();
  const { enabledMenuItems } = useSpinnerMenuContext();
  const [resultHistory, setResultHistory] = useState<HistoryItem[]>([]);

  const handleSpinEnd = (result: SpinnerOption) => {
    setResultHistory((currentHistory) => [
      { ...result, timestamp: Date.now() },
      ...currentHistory.slice(0, maxHistory - 1),
    ]);

    fireConfetti();
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <SpinningWheel choices={enabledMenuItems} onSpinEnd={handleSpinEnd} />

      <div className="flex min-w-full gap-4 overflow-x-auto rounded-md bg-slate-700 p-2 shadow-xl">
        {resultHistory.length === 0 && (
          <div className="grid aspect-square h-16 w-full place-items-center text-gray-400 md:h-24 lg:h-28">
            {t("No history yet")}
          </div>
        )}
        {resultHistory.map(({ timestamp, imageUrl, label }) => (
          <Dish key={timestamp} imageUrl={imageUrl || ""} label={label} />
        ))}
      </div>

      <Floating>
        <Link to="/menu" tabIndex={-1}>
          <ThemedButton icon={faEdit}>{t("Edit Menu")}</ThemedButton>
        </Link>
      </Floating>
    </div>
  );
}
