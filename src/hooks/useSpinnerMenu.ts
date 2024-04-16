import { useCallback } from "react";
import { type SpinnerOption } from "src/components/SpinningWheel";
import { useLanguageContext } from "src/contexts/LanguageContext";
import { useSpinnerMenuContext } from "src/contexts/SpinnerMenuContext";
import { useGoogleDriveAPI } from "src/hooks/useGoogleDriveAPI";

export function useSpinnerMenu() {
  const { t } = useLanguageContext();
  const { allMenuItems, setAllMenuItems, markMenuDirty } =
    useSpinnerMenuContext();
  const { deleteFile } = useGoogleDriveAPI();

  const deleteImage = useCallback(
    async (item: SpinnerOption) => {
      try {
        if (!item.fileId) return null;

        return await deleteFile({ id: item.fileId });
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    [deleteFile],
  );

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
      markMenuDirty();
    },
    [allMenuItems, markMenuDirty, setAllMenuItems],
  );

  const addMenuItem = useCallback(
    (item: SpinnerOption) => {
      if (!allMenuItems) return;

      setAllMenuItems((prevItems) => prevItems && [...prevItems, item]);
      markMenuDirty();
    },
    [allMenuItems, markMenuDirty, setAllMenuItems],
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
      itemsToDelete.forEach(async (item) => {
        if (!item.fileId) return;
        try {
          const { status } = (await deleteImage(item)) || {};

          if (status !== 200) throw new Error(t("Image could not be deleted"));
        } catch (error) {
          console.error(error);
        }
      });

      setAllMenuItems(
        (prevItems) =>
          prevItems &&
          [...prevItems].filter((_, index) => !indexes.includes(index)),
      );
      markMenuDirty();
    },
    [allMenuItems, deleteImage, markMenuDirty, setAllMenuItems, t],
  );

  return {
    toggleMenuItems,
    addMenuItem,
    deleteMenuItems,
  };
}
