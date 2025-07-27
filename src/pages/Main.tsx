import { useState } from "react";
import { Link } from "react-router-dom";

import { type SpinnerEntry } from "src/hooks/useSpinnerMenuContext/types";
import { useLanguageContext } from "src/hooks/useLanguageContext";
import { useSpinnerMenuContext } from "src/hooks/useSpinnerMenuContext";
import Floating from "src/components/common/Floating";
import SpinningWheel from "src/components/SpinningWheel";
import ThemedButton from "src/components/common/ThemedButton";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";

const defaults = {
  HISTORY_SIZE: 3,
};

const fireConfetti = () => {
  confetti({ particleCount: 30, spread: 360, origin: { y: 0.4 } });
};

type DishProps = { label: string; imageUrl: string | undefined };

function DishThumb({ label, imageUrl }: DishProps) {
  const text = label ? label : "No label";
  return (
    <div className="group flex w-fit transition-transform duration-150 hover:scale-105">
      <div className="relative flex aspect-square size-max w-22 overflow-hidden rounded-lg bg-gray-700 md:w-24 lg:w-28">
        {imageUrl && imageUrl.length > 0 ? (
          <>
            <span className="pointer-events-none absolute hidden size-full place-items-center bg-black/50 text-center text-sm group-hover:grid">
              {text}
            </span>
            <img className="size-full object-cover" src={imageUrl} alt={text} />
          </>
        ) : (
          <div className="flex size-full flex-col items-center justify-center bg-gray-600">
            {text}
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div className="flex grow flex-col items-center gap-8 overflow-y-auto">
      <div className="mb-2 flex max-h-1/2 w-full grow flex-col items-center gap-4 p-4 sm:w-fit sm:flex-row sm:justify-center">
        <SpinningWheel
          className="aspect-square size-fit grow-0 sm:h-full sm:shrink-0 sm:grow"
          entries={enabledMenuItems}
          onClick={handleSpinStart}
          onSpinEnd={handleSpinEnd}
        />
        <div className="flex w-full max-w-lg shrink-0 grow flex-row gap-2 overflow-auto rounded-md py-2 [scrollbar-gutter:stable] sm:h-full sm:w-fit sm:grow-0 sm:flex-col sm:px-2">
          {resultHistory.length === 0 && (
            <div className="pointer-events-none relative flex aspect-square size-max w-22 items-center justify-center overflow-hidden rounded-lg bg-white/20 p-2 text-center text-white/60 md:w-24 lg:w-28">
              {t("No history yet")}
            </div>
          )}
          {resultHistory.map(({ timestamp, imageUrl, label }) => (
            <DishThumb key={timestamp} imageUrl={imageUrl} label={label} />
          ))}
        </div>
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
