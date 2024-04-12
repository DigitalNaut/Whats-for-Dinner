import type { ReactPortal } from "react";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Checkbox } from "ariakit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCheckDouble,
  faMinus,
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
  const { setHeaderProperties, createMenu } = useHeaderContext();
  const { isLoaded, allMenuItems, toggleMenuItems, deleteMenuItems } =
    useSpinnerMenuContext();
  const [mode, setMode] = useState<Modes>(Modes.Toggle);
  const [selected, setSelected] = useState<
    Map<string, { isSelected: boolean; index: number }>
  >(new Map());
  const [showSelectionOptions, setShowSelectionOptions] = useState(false);
  const [menuPortal, setMenuPortal] = useState<ReactPortal>();

  const setAllSelections = useCallback(
    (value = true) => {
      const newSelected = new Map(selected);
      allMenuItems?.forEach(({ label }, index) =>
        newSelected.set(label, { isSelected: value, index })
      );
      setSelected(newSelected);
    },
    [allMenuItems, selected]
  );

  const setModeToggle = useCallback(() => {
    setShowSelectionOptions(false);
    setHeaderProperties((prevProperties) => ({
      ...prevProperties,
      title: "Editar menú",
      altBackButton: undefined,
      altColor: false,
    }));
    setMode(Modes.Toggle);
  }, [setHeaderProperties]);

  const altBackButton = useMemo(
    () => (
      <button onClick={setModeToggle}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
    ),
    [setModeToggle]
  );

  const setModeSelection = useCallback(
    (setAll?: boolean) => {
      setShowSelectionOptions(true);
      setHeaderProperties((prevProperties) => ({
        ...prevProperties,
        title: "Seleccionar",
        altBackButton,
        altColor: true,
      }));
      setMode(Modes.Select);
      setAll !== undefined && setAllSelections(setAll);
    },
    [altBackButton, setAllSelections, setHeaderProperties]
  );

  const deleteSelections = useCallback(() => {
    const indexes = Array.from(selected.values())
      .filter(({ isSelected }) => isSelected)
      .map(({ index }) => index);

    deleteMenuItems(indexes);
    setAllSelections(false);
    setModeToggle();
  }, [deleteMenuItems, selected, setAllSelections, setModeToggle]);

  const { menu, menuRef } = useMemo(
    () =>
      createMenu((MenuItem, MenuSeparator) => (
        <>
          {showSelectionOptions || (
            <MenuItem
              onClick={() => {
                setModeSelection(false);
              }}
            >
              <FontAwesomeIcon icon={faCheck} />
              <span>Seleccionar</span>
            </MenuItem>
          )}

          <MenuItem
            onClick={() => {
              setModeSelection(true);
            }}
          >
            <FontAwesomeIcon icon={faCheckDouble} />
            <span>Seleccionar todo</span>
          </MenuItem>

          {showSelectionOptions && (
            <MenuItem className="text-red-900" onClick={deleteSelections}>
              <FontAwesomeIcon icon={faTrash} />
              <span>Eliminar</span>
            </MenuItem>
          )}

          {showSelectionOptions || (
            <>
              <MenuSeparator />
              <MenuItem
                onClick={() => {
                  allMenuItems &&
                    toggleMenuItems(
                      allMenuItems.map((_, index) => index),
                      true
                    );
                }}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Activar todos</span>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  allMenuItems &&
                    toggleMenuItems(
                      allMenuItems.map((_, index) => index),
                      false
                    );
                }}
              >
                <FontAwesomeIcon icon={faMinus} />
                <span>Desactivar todos</span>
              </MenuItem>
            </>
          )}
        </>
      )),
    [
      createMenu,
      showSelectionOptions,
      deleteSelections,
      setModeSelection,
      allMenuItems,
      toggleMenuItems,
    ]
  );

  useEffect(() => {
    if (!isLoaded) return;

    setSelected(
      new Map(
        allMenuItems?.map(({ label }, index) => [
          label,
          { isSelected: false, index },
        ]) ?? []
      )
    );
  }, [allMenuItems, isLoaded]);

  useEffect(() => {
    if (!menuRef.current) return;
    setMenuPortal(createPortal(menu, menuRef.current));
  }, [menuRef, menu]);

  useHeader({
    title: "Editar menú",
    backTo: "/main",
    showMenuButton: true,
  });

  if (!isLoaded)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <>
      <h2 className="text-center font-bangers text-4xl">Menu</h2>
      {menuPortal}
      <div className="flex flex-col gap-4">
        {allMenuItems &&
          allMenuItems.map(({ label, imageUrl, key, enabled }, index) => (
            <div key={key} className="flex items-center gap-2">
              <img
                className="size-10 rounded-lg object-cover"
                src={imageUrl}
                alt={label}
              />
              <p className="flex-1">{label}</p>
              {mode === Modes.Toggle ? (
                <Toggle
                  checked={enabled}
                  onChange={(value) => toggleMenuItems([index], value)}
                />
              ) : (
                <Checkbox
                  className="size-6 rounded-sm border-2 border-purple-400 checked:border-none checked:bg-purple-400 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-700"
                  checked={selected.get(label)?.isSelected}
                  onChange={() => {
                    const newSelected = new Map(selected);
                    const values = newSelected.get(label);

                    if (!values) return;

                    newSelected.set(label, {
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
        <Link to="/addItem" tabIndex={-1}>
          <button data-filled className="flex items-center gap-1">
            <FontAwesomeIcon icon={faPlus} />
            <span>Añadir</span>
          </button>
        </Link>
      </Floating>
    </>
  );
}
