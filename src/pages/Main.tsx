import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import type { SpinnerOption } from "src/components/SpinningWheel";
import SpinningWheel from "src/components/SpinningWheel";
import { useSpinnerMenuContext } from "src/hooks/SpinnerMenuContext";
import Floating from "src/components/Floating";

const maxHistory = 20;

function Dish({ label, imageUrl }: { label: string; imageUrl: string }) {
  return (
    <div className="group">
      <div className="relative w-16 md:w-24 lg:w-28 aspect-square rounded-lg bg-gray-700 overflow-hidden">
        <span className="absolute place-items-center text-center text-sm w-full h-full hidden group-hover:grid bg-black/50 pointer-events-none">
          {label}
        </span>
        <img
          className="w-full h-full object-cover"
          src={imageUrl}
          alt={label}
        />
      </div>
    </div>
  );
}

export default function Main() {
  const { enabledMenuItems } = useSpinnerMenuContext();
  const [resultHistory, setResultHistory] = useState<
    (SpinnerOption & { timestamp: string })[]
  >([]);

  return (
    <div className="flex flex-col w-full gap-8">
      <SpinningWheel
        choices={enabledMenuItems}
        onSpinEnd={(result) => {
          setResultHistory((currentHistory) => [
            { ...result, timestamp: Date() },
            ...currentHistory.slice(0, maxHistory - 1),
          ]);
        }}
      />

      <div className="flex p-2 gap-4 min-w-full overflow-x-auto bg-slate-700 shadow-xl rounded-md">
        {resultHistory.length === 0 && (
          <div className="grid place-items-center w-full h-16 md:h-24 lg:h-28 aspect-square text-gray-400">
            Sin historial
          </div>
        )}
        {resultHistory.map((dish) => (
          <Dish key={dish.timestamp} {...dish} />
        ))}
      </div>

      <Floating>
        <Link to="/menu">
          <button data-filled className="flex items-center gap-1">
            <FontAwesomeIcon icon={faEdit} />
            <span>Editar menú</span>
          </button>
        </Link>
      </Floating>
    </div>
  );
}
