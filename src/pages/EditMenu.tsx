import type { PropsWithChildren } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import Floating from "src/components/Floating";
import Toggle from "src/components/Toggle";
import { useDynamicHeader } from "src/hooks/NavigationContext";
import { useSpinnerMenuContext } from "src/hooks/SpinnerMenuContext";

function PopupMenu({ children }: PropsWithChildren) {
  return (
    <div
      className="absolute top-0 right-0 bg-white text-gray-900"
      tabIndex={-1}
    >
      {children}
    </div>
  );
}

export default function EditMenu() {
  const { allMenuItems, toggleMenuItem } = useSpinnerMenuContext();

  useDynamicHeader({
    title: "Editar",
    backTo: "/main",
    menu: <PopupMenu />,
  });

  return (
    <>
      <h2 className="text-center font-bangers text-4xl">Menu</h2>
      <div className="flex flex-col gap-4">
        {allMenuItems &&
          allMenuItems.map((item, index) => (
            <div key={item.label} className="flex items-center gap-2">
              <img
                className="h-10 w-10 rounded-lg object-cover"
                src={item.imageUrl}
                alt={item.label}
              />
              <p className="flex-1">{item.label}</p>
              <Toggle
                initial={item.enabled}
                onChange={(value) => toggleMenuItem(index, value)}
              />
            </div>
          ))}
      </div>
      <Floating>
        <Link to="/addItem">
          <button data-filled className="flex items-center gap-1">
            <FontAwesomeIcon icon={faPlus} />
            <span>Añadir</span>
          </button>
        </Link>
      </Floating>
    </>
  );
}
