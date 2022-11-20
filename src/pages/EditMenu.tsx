import type { ReactPortal } from "react";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useHeader, useHeaderContext } from "src/hooks/HeaderContext";
import { useSpinnerMenuContext } from "src/hooks/SpinnerMenuContext";
import Spinner from "src/components/Spinner";

enum Modes {
  Toggle,
  Select,
}

export default function EditMenu() {
  const { setHeaderProperties, Item, menuRef } = useHeaderContext();
  const { allMenuItems, toggleMenuItems, isLoaded } = useSpinnerMenuContext();
  const [mode, setMode] = useState<Modes>(Modes.Toggle);
  const [selected, setSelected] = useState<
    Map<string, { isSelected: boolean; index: number }>
  >(new Map());
  const [showSelectionOptions, setShowSelectionOptions] = useState(false);
  const [menuContent, setMenuContent] = useState<ReactPortal>();

  useEffect(() => {
    if (!isLoaded) return;

    setSelected(
      new Map(
        allMenuItems?.map((item, index) => [
          item.label,
          { isSelected: false, index },
        ]) ?? []
      )
    );
  }, [allMenuItems, isLoaded]);

  const deleteSelections = useCallback(() => {
    const indexes = Array.from(selected.values()).filter(
      ({ isSelected }) => isSelected
    );
    // .map(({ index }) => index);
    console.log(indexes);

    // deleteMenuItems(indexes);
    // changeMode(Modes.Toggle, false);
  }, [selected]);

  const setAllSelections = useCallback(
    (value = true) => {
      const newSelected = new Map(selected);
      allMenuItems?.forEach((item, index) =>
        newSelected.set(item.label, { isSelected: value, index })
      );
      setSelected(newSelected);
    },
    [allMenuItems, selected]
  );

  const altBackButton = useMemo(
    () => (
      <button
        onClick={() => {
          setShowSelectionOptions(false);
          setHeaderProperties((prevProperties) => ({
            ...prevProperties,
            title: "Editar menú",
            altBackButton: undefined,
            altColor: false,
          }));
          setMode(Modes.Toggle);
        }}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    ),
    [setHeaderProperties]
  );

  const changeMode = useCallback(
    (mode: Modes, setAll?: boolean) => {
      switch (mode) {
        case Modes.Toggle:
          setShowSelectionOptions(false);
          setHeaderProperties((prevProperties) => ({
            ...prevProperties,
            title: "Editar menú",
            altBackButton: undefined,
            altColor: false,
          }));
          break;
        case Modes.Select:
          setShowSelectionOptions(true);
          setHeaderProperties((prevProperties) => ({
            ...prevProperties,
            title: "Seleccionar",
            altBackButton,
            altColor: true,
          }));
          setAll !== undefined && setAllSelections(setAll);
          break;
      }
      setMode(mode);
    },
    [altBackButton, setAllSelections, setHeaderProperties]
  );

  useHeader({
    title: "Editar menú",
    backTo: "/main",
  });

  const menuItems = useMemo(
    () => (
      <>
        {showSelectionOptions || (
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

        {showSelectionOptions && (
          <Item onClick={deleteSelections}>
            <FontAwesomeIcon icon={faTrash} />
            <span>Eliminar</span>
          </Item>
        )}

        {showSelectionOptions || (
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
    ),
    [
      Item,
      allMenuItems,
      changeMode,
      deleteSelections,
      showSelectionOptions,
      toggleMenuItems,
    ]
  );

  useEffect(() => {
    if (!menuRef.current || !isLoaded) return;
    setMenuContent(createPortal(menuItems, menuRef.current));
  }, [menuRef, isLoaded, menuItems]);

  if (!isLoaded)
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <>
      <h2 className="text-center font-bangers text-4xl">Menu</h2>
      {menuContent}
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
                  checked={selected.get(item.label)?.isSelected}
                  onChange={() => {
                    const newSelected = new Map(selected);
                    const values = newSelected.get(item.label);

                    if (!values) return;

                    newSelected.set(item.label, {
                      index: values.index,
                      isSelected: !values.isSelected,
                    });

                    setSelected(newSelected);
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
