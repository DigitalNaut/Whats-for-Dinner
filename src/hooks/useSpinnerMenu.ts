import { useCallback } from "react";

import { type SpinnerOption } from "src/components/SpinningWheel";
import { useGoogleDriveAPI } from "src/hooks/useGoogleDriveAPI";
import { useLanguageContext } from "src/contexts/LanguageContext";
import { useSpinnerMenuContext } from "src/contexts/SpinnerMenuContext";

export function useSpinnerMenu() {
  const { t } = useLanguageContext();
  const { allMenuItems, setAllMenuItems } = useSpinnerMenuContext();
  const { deleteFile } = useGoogleDriveAPI();

  const toggleMenuItems = useCallback(
    (indexes: number[], value?: boolean) => {
      if (!allMenuItems) return;

      const newAllMenuItems = [...allMenuItems];
      newAllMenuItems.forEach((item, index) => {
        if (!indexes.includes(index)) return;

        if (value !== undefined) item.enabled = value;
        else item.enabled = !item.enabled;
      });

      setAllMenuItems(newAllMenuItems);
    },
    [allMenuItems, setAllMenuItems],
  );

  const addMenuItem = useCallback(
    (item: SpinnerOption) => {
      if (!allMenuItems) return;

      setAllMenuItems((prevItems) => prevItems && [...prevItems, item]);
    },
    [allMenuItems, setAllMenuItems],
  );

  const deleteMenuItems = useCallback(
    async (indexes: number[]) => {
      if (!allMenuItems) return;
      if (!indexes.length) return;

      const confirmDelete = confirm(t("All selected elements will be deleted"));

      if (!confirmDelete) return;

      // Delete the associated image
      const itemsToDelete = indexes
        .map((index) => allMenuItems[index])
        .filter(Boolean);

      try {
        for (const item of itemsToDelete) {
          if (!item.fileId) continue;
          await deleteFile({ id: item.fileId });
        }
      } catch (error) {
        if (error instanceof Object && "message" in error)
          console.error(error.message);
        else console.error(error);
      } finally {
        const newItems = allMenuItems.filter(
          (_, index) => !indexes.includes(index),
        );

        setAllMenuItems(newItems);
      }
    },
    [allMenuItems, deleteFile, setAllMenuItems, t],
  );

  return {
    toggleMenuItems,
    addMenuItem,
    deleteMenuItems,
  };
}
