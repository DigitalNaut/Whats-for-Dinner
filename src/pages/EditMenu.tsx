import { useState } from "react";
import { Link } from "react-router-dom";
import { Checkbox } from "ariakit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCheckDouble,
  faCircleMinus,
  faCirclePlus,
  faPlus,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import Floating from "src/components/Floating";
import Toggle from "src/components/Toggle";
import { useHeader, useNavigationContext } from "src/hooks/NavigationContext";
import { useSpinnerMenuContext } from "src/hooks/SpinnerMenuContext";

enum Modes {
  Toggle,
  Select,
}

type MenuItemsProps = {
  selectOptions?: true;
};

export default function EditMenu() {
  const { setTitle, setAltBackButton, Item, setMenuContent, setAltColor } =
    useNavigationContext();
  const { allMenuItems, toggleMenuItems } = useSpinnerMenuContext();
  const [mode, setMode] = useState<Modes>(Modes.Toggle);
  const [selected, setSelected] = useState<Map<string, boolean>>(
    new Map(allMenuItems?.map((item) => [item.label, false]) ?? [])
  );

  const MenuItems = ({ selectOptions }: MenuItemsProps) => (
    <>
      {selectOptions || (
        <Item
          onClick={() => {
            changeMode(Modes.Select, false);
          }}
        >
          <FontAwesomeIcon icon={faCheck} />
          <span>Seleccionar</span>
        </Item>
      )}

      <Item
        onClick={() => {
          changeMode(Modes.Select, true);
        }}
      >
        <FontAwesomeIcon icon={faCheckDouble} />
        <span>Seleccionar todo</span>
      </Item>

      {selectOptions && (
        <>
          <Item
            onClick={() => {
              changeMode(Modes.Select, false);
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
            <span>Seleccionar nada</span>
          </Item>
          <Item onClick={() => null}>
            <FontAwesomeIcon icon={faTrash} />
            <span>Eliminar</span>
          </Item>
        </>
      )}

      {selectOptions || (
        <>
          <Item
            onClick={() => {
              allMenuItems &&
                toggleMenuItems(
                  allMenuItems.map((_, index) => index),
                  true
                );
            }}
          >
            <FontAwesomeIcon icon={faCirclePlus} />
            <span>Activar todos</span>
          </Item>
          <Item
            onClick={() => {
              allMenuItems &&
                toggleMenuItems(
                  allMenuItems.map((_, index) => index),
                  false
                );
            }}
          >
            <FontAwesomeIcon icon={faCircleMinus} />
            <span>Desactivar todos</span>
          </Item>
        </>
      )}
    </>
  );

  const setAllSelections = (value = true) => {
    const newSelected = new Map(selected);
    allMenuItems?.forEach((item) => newSelected.set(item.label, value));
    setSelected(newSelected);
  };

  const altBackButton = (
    <button
      onClick={() => {
        changeMode(Modes.Toggle, false);
      }}
    >
      <FontAwesomeIcon icon={faTimes} />
    </button>
  );

  const changeMode = (mode: Modes, setAll?: boolean) => {
    switch (mode) {
      case Modes.Toggle:
        setTitle("Editar");
        setAltBackButton(undefined);
        setAllSelections(false);
        setMenuContent(<MenuItems />);
        setAltColor(false);
        break;
      case Modes.Select:
        setAltBackButton(altBackButton);
        setTitle("Seleccionar");
        setMenuContent(<MenuItems selectOptions />);
        setAltColor(true);
        setAll !== undefined && setAllSelections(setAll);
        break;
    }
    setMode(mode);
  };

  useHeader({
    title: "Editar",
    backTo: "/main",
    menuItems: <MenuItems />,
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
              {mode === Modes.Toggle ? (
                <Toggle
                  checked={item.enabled}
                  onChange={(value) => toggleMenuItems([index], value)}
                />
              ) : (
                <Checkbox
                  className="h-6 w-6 rounded-sm border-2 border-purple-400 checked:border-none checked:bg-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-700"
                  checked={selected.get(item.label) ?? false}
                  onChange={() => {
                    setSelected((prevSelected) => {
                      const newSelected = new Map(prevSelected);
                      const newValue = !newSelected.get(item.label);
                      newSelected.set(item.label, newValue);
                      return newSelected;
                    });
                  }}
                />
              )}
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
