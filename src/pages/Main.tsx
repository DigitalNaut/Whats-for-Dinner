import { useState } from "react";
import { Link } from "react-router-dom";

import { type SpinnerEntry } from "src/hooks/useSpinnerMenuContext/types";
import { useLanguageContext } from "src/hooks/useLanguageContext";
import { useSpinnerMenuContext } from "src/hooks/useSpinnerMenuContext";
import Floating from "src/components/common/Floating";
import SpinningWheel from "src/components/SpinningWheel";
import ThemedButton from "src/components/common/ThemedButton";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const defaults = {
  HISTORY_SIZE: 40,
};

const fireConfetti = () => {
  confetti({ particleCount: 30, spread: 360, origin: { y: 0.4 } });
};

type DishProps = { label: string; imageUrl: string | undefined };

function DishThumb({ label, imageUrl }: DishProps) {
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
  confetti({ particleCount: 30, spread: 360, origin: { y: 0.4 } });
};

type HistoryItem = SpinnerEntry & { timestamp: number };

export default function Main() {
  const { t } = useLanguageContext();
  const { enabledMenuItems } = useSpinnerMenuContext();
  const [resultHistory, setResultHistory] = useState<HistoryItem[]>([]);
  const [spinResult, setSpinResult] = useState<HistoryItem>();

  const handleSpinStart = () => {
    if (!spinResult) return;

    // Unshift and truncate
    setResultHistory((currentHistory) => [
      spinResult,
      ...currentHistory.slice(0, defaults.HISTORY_SIZE - 1),
    ]);

    setSpinResult(undefined);
  };

  const handleSpinEnd = (result: SpinnerEntry) => {
    setSpinResult({ ...result, timestamp: Date.now() });

    fireConfetti();
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <SpinningWheel
        className="shrink-0"
        entries={enabledMenuItems}
        onClick={handleSpinStart}
        onSpinEnd={handleSpinEnd}
      />

      <div className="flex min-w-full gap-4 overflow-x-auto rounded-md bg-slate-700 p-2 shadow-xl">
        {resultHistory.length === 0 && (
          <div className="aspect-square h-16 w-full text-gray-400 md:h-24 lg:h-28">
            {t("No history yet")}
          </div>
        )}
        {resultHistory.map(({ timestamp, imageUrl, label }) => (
          <DishThumb key={timestamp} imageUrl={imageUrl} label={label} />
        ))}
      </div>

      <Floating>
        <Link to="/menu" tabIndex={-1}>
          <ThemedButton iconStyle={faPenToSquare}>
            {t("Edit Menu")}
          </ThemedButton>
        </Link>
      </Floating>
    </div>
  );
}
