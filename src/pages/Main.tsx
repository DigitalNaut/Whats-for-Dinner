import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import SpinningWheel from "src/components/SpinningWheel";
import { useState } from "react";

const maxHistory = 20;

export const choices: { label: string; imageUrl: string }[] = [
  {
    label: "Tacos al pastor",
    imageUrl:
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Pozole", // c-spell-checker:disable-line
    imageUrl:
      "https://images.unsplash.com/photo-1649532245300-c3ed0565ffa4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Ensalada de atún",
    imageUrl:
      "https://images.unsplash.com/photo-1612949060306-4c298ad7f34c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Sopa de pollo",
    imageUrl:
      "https://images.unsplash.com/photo-1569058242276-0bc3e078cf86?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Ensalada verde",
    imageUrl:
      "https://images.unsplash.com/photo-1608032077018-c9aad9565d29?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Carne asada",
    imageUrl:
      "https://images.unsplash.com/photo-1612871689353-cccf581d667b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Pizza",
    imageUrl:
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Hamburguesa",
    imageUrl:
      "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Pollo empanizado", // c-spell-checker:disable-line
    imageUrl:
      "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Arroz con pollo",
    imageUrl:
      "https://images.unsplash.com/photo-1569058242252-623df46b5025?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Sushi",
    imageUrl:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Spaghetti",
    imageUrl:
      "https://images.unsplash.com/photo-1635264685671-739e75e73e0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
];

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
  const [resultHistory, setResultHistory] = useState<
    (typeof choices[number] & { timestamp: string })[]
  >([]);
  return (
    <div className="flex flex-col w-full gap-8">
      <SpinningWheel
        choices={choices}
        onSpinEnd={(result) => {
          setResultHistory((currentHistory) => [
            { ...result, timestamp: Date() },
            ...currentHistory.slice(0, maxHistory - 1),
          ]);
        }}
      />

      <div className="flex p-2 gap-4 min-w-full h-16 md:h-24 lg:h-28 overflow-x-auto bg-slate-700 shadow-xl rounded-md">
        {resultHistory.length === 0 && (
          <div className="grid place-items-center w-full text-gray-400">
            Sin historial
          </div>
        )}
        {resultHistory.map((dish) => (
          <Dish key={dish.timestamp} {...dish} />
        ))}
      </div>

      <div className="fixed left-1/2 -translate-x-1/2 bottom-16 flex items-center w-fit">
        <button data-filled>
          <FontAwesomeIcon icon={faEdit} />
          <span>Editar menú</span>
        </button>
      </div>
    </div>
  );
}
