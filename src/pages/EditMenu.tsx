import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useBlocker } from "react-router-dom";
import { Checkbox, useMenuStore } from "@ariakit/react";

import {
  ContextMenu,
  ContextMenuButton,
  ContextMenuItem,
  ContextMenuSeparator,
} from "src/components/HeaderContextMenu";
import { useHeaderContext } from "src/contexts/HeaderContext";
import { useLanguageContext } from "src/contexts/LanguageContext";
import { useSpinnerMenu } from "src/hooks/useSpinnerMenu";
import { useSpinnerMenuContext } from "src/contexts/SpinnerMenuContext";
import Floating from "src/components/common/Floating";
import FontAwesomeIcon from "src/components/common/FontAwesomeIcon";
import Spinner from "src/components/common/Spinner";
import ThemedButton from "src/components/common/ThemedButton";
import Toggle from "src/components/common/Toggle";

const Modes = ["Toggle", "Select"] as const;

function HeaderContextMenu({
  showSelectionOptions,
  enterSelectMode,
  selectAll,
  selectNone,
  deleteSelections,
  toggleAllOn,
  toggleAllOff,
  title,
}: {
  showSelectionOptions?: boolean;
  enterSelectMode: () => void;
  selectNone: () => void;
  selectAll: () => void;
  deleteSelections: () => void;
  toggleAllOn: () => void;
  toggleAllOff: () => void;
  title?: string;
}) {
  const { t } = useLanguageContext();
  const menuStore = useMenuStore();

  return (
    <div className="z-10" title={title}>
      <ContextMenuButton store={menuStore} />
      <ContextMenu store={menuStore}>
        {showSelectionOptions || (
          <ContextMenuItem onClick={enterSelectMode}>
            <FontAwesomeIcon className="fa-check" />
            <span>{t("Select")}</span>
          </ContextMenuItem>
        )}

        {showSelectionOptions && (
          <ContextMenuItem onClick={selectNone}>
            <FontAwesomeIcon className="fa-xmark" />
            <span>{t("Select none")}</span>
          </ContextMenuItem>
        )}

        <ContextMenuItem onClick={selectAll}>
          <FontAwesomeIcon className="fa-check-double" />
          <span>{t("Select all")}</span>
        </ContextMenuItem>

        {showSelectionOptions && (
          <>
            <ContextMenuSeparator />

            <ContextMenuItem
              className="text-red-900"
              onClick={deleteSelections}
            >
              <FontAwesomeIcon className="fa-trash" />
              <span>{t("Delete")}</span>
            </ContextMenuItem>
          </>
        )}

        {showSelectionOptions || (
          <>
            <ContextMenuSeparator />

            <ContextMenuItem onClick={toggleAllOn}>
              <FontAwesomeIcon className="fa-toggle-on" />
              <span>{t("Toggle all on")}</span>
            </ContextMenuItem>

            <ContextMenuItem onClick={toggleAllOff}>
              <FontAwesomeIcon className="fa-toggle-off" />
              <span>{t("Toggle all off")}</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenu>
    </div>
  );
}

export default function EditMenu() {
  const { t } = useLanguageContext();
  const { setHeaderProperties } = useHeaderContext();
  const { isLoaded, allMenuItems } = useSpinnerMenuContext();
  const { toggleMenuItems, deleteMenuItems } = useSpinnerMenu();
  const [mode, setMode] = useState<(typeof Modes)[number]>("Toggle");
  const [selected, setSelected] = useState<
    Map<string, { isSelected: boolean; index: number }>
  >(new Map());
  const [showSelectionOptions, setShowSelectionOptions] = useState(false);

  const setModeToggle = useCallback(() => {
    setShowSelectionOptions(false);
    setHeaderProperties((prevProperties) => ({
      ...prevProperties,
      altBackButton: undefined,
      altColor: false,
    }));
    setMode("Toggle");
  }, [setHeaderProperties]);

  const setAllSelected = useCallback(
    (value: boolean) => {
      const newSelected = new Map(selected);
      allMenuItems?.forEach(({ label }, index) =>
        newSelected.set(label, { isSelected: value, index }),
      );
      setSelected(newSelected);
    },
    [allMenuItems, selected],
  );

  const deleteSelected = useCallback(() => {
    const indexes = Array.from(selected.values())
      .filter(({ isSelected }) => isSelected)
      .map(({ index }) => index);

    deleteMenuItems(indexes);
    setAllSelected(false);
    setModeToggle();
  }, [deleteMenuItems, selected, setAllSelected, setModeToggle]);

  const toggleAll = useCallback(
    (active: boolean) => {
      allMenuItems &&
        toggleMenuItems(
          allMenuItems.map((_, index) => index),
          active,
        );
    },
    [allMenuItems, toggleMenuItems],
  );

  const altBackButton = useMemo(() => {
    return mode === "Select" ? (
      <button onClick={setModeToggle}>
        <FontAwesomeIcon className="fa-xmark" />
      </button>
    ) : undefined;
  }, [mode, setModeToggle]);

  const setModeSelect = useCallback(
    (allSelected: boolean) => {
      setShowSelectionOptions(true);

      setHeaderProperties((prevProperties) => ({
        ...prevProperties,
        altColor: true,
      }));

      setMode("Select");

      allSelected !== undefined && setAllSelected(allSelected);
    },
    [setAllSelected, setHeaderProperties],
  );

  const contextMenu = useMemo(
    () => (
      <>
        {mode === "Select" && (
          <button onClick={deleteSelected} title={t("Delete")}>
            <FontAwesomeIcon className="fa-trash" />
          </button>
        )}
        <HeaderContextMenu
          title={t("Edit menu")}
          showSelectionOptions={showSelectionOptions}
          enterSelectMode={() => setModeSelect(false)}
          selectAll={() => setModeSelect(true)}
          selectNone={() => setModeSelect(false)}
          deleteSelections={deleteSelected}
          toggleAllOn={() => toggleAll(true)}
          toggleAllOff={() => toggleAll(false)}
        />
      </>
    ),
    [deleteSelected, mode, setModeSelect, showSelectionOptions, t, toggleAll],
  );

  useEffect(() => {
    if (!isLoaded) return;

    setHeaderProperties((prevProperties) => ({
      ...prevProperties,
      altBackButton,
      elements: contextMenu,
    }));
  }, [altBackButton, contextMenu, isLoaded, setHeaderProperties]);

  useBlocker(() => {
    setHeaderProperties((prevProperties) => ({
      ...prevProperties,
      altColor: false,
      altBackButton: undefined,
      elements: undefined,
    }));
    return false;
  });

  if (!isLoaded) return <Spinner cover />;

  return (
    <>
      <h2 className="text-center font-bangers text-4xl">{t("Menu")}</h2>

      <div className="flex flex-col gap-4">
        {allMenuItems?.length ? (
          allMenuItems.map(({ label, imageUrl, key, enabled }, index) => (
            <div key={key} className="flex items-center gap-2">
              <img
                className="size-10 rounded-lg object-cover"
                src={imageUrl}
                alt={label}
              />
              <p className="flex-1">{label}</p>
              {mode === "Toggle" ? (
                <Toggle
                  checked={enabled}
                  onChange={(value) => toggleMenuItems([index], value)}
                />
              ) : (
                <Checkbox
                  className="size-6 rounded-sm border-2 border-amber-400 checked:border-none checked:bg-amber-500 hover:bg-amber-400 checked:hover:bg-amber-400 focus:bg-amber-400 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-700 focus:checked:bg-amber-300 focus:hover:bg-amber-400 active:bg-amber-400 active:hover:bg-amber-400"
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
          ))
        ) : (
          <p className="p-6 text-center text-slate-300">
            {t("No items yet. Add some dishes to get started.")}
          </p>
        )}
      </div>

      <Floating>
        <Link to="/addItem" tabIndex={-1}>
          <ThemedButton iconStyle="fa-plus">{t("Add dish")}</ThemedButton>
        </Link>
      </Floating>
    </>
  );
}
