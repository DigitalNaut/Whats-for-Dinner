import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
import { AxiosError } from "axios";

import { useBeforeUnload } from "src/hooks/useBeforeUnload";
import { useGoogleDriveAPI } from "src/hooks/useGoogleDriveAPI";
import { useGoogleDriveContext } from "src/hooks/useGoogleDriveContext";
import { useLanguageContext } from "src/hooks/useLanguageContext";
import Spinner from "src/components/common/Spinner";

import {
  spinnerEntriesSchema,
  SpinnerEntry,
  SpinnerMenuContext,
} from "./types";
import { SpinnerMenuProvider } from ".";

const DEBOUNCE_DELAY = 2500;
const CONFIG_FILE_NAME = "menuItems.json";

type State = "loading" | "idle" | "dirty" | "uploading";

const getDefaultMenu = async () => {
  const defaultMenu = await import("src/data/DefaultMenu.json");
  return defaultMenu.default;
};

export function SpinnerMenuContextProvider({ children }: PropsWithChildren) {
  const { t } = useLanguageContext();
  const [error, setError] = useState<string>();
  const { isLoaded: isDriveLoaded } = useGoogleDriveContext();
  const { fetchFile, fetchList, uploadFile, updateFile } = useGoogleDriveAPI();
  const [menuItems, setMenuItems] = useState<SpinnerEntry[]>();
  const [state, setState] = useState<State>("loading");
  const [pendingUpload, setPendingUpload] = useState<{
    timeoutId: NodeJS.Timeout;
    controller: AbortController;
  }>();
  const [menuFileId, setMenuFileId] = useState<string>();

  const getImageUrl = useCallback(
    async (item: SpinnerEntry) => {
      try {
        const { status, data } = await fetchFile<Blob>(
          { id: item.fileId },
          { responseType: "blob" },
        );

        if (status !== 200 || !data)
          throw new Error(`Could not get image: HTTP ${status}`);
        if (!(data instanceof Blob)) throw new Error("Data is not a blob");

        const url = URL.createObjectURL(data);

        console.log(`Created URL for ${item.key}`, url);

        return url;
      } catch (error) {
        console.error(error);
        return "https://via.placeholder.com/256";
      }
    },
    [fetchFile],
  );

  const getMenuFileMeta = useCallback(
    async (signal?: AbortSignal) => {
      const { data, status } = await fetchList({
        signal,
        params: { q: `name = '${CONFIG_FILE_NAME}'` },
      });

      if (status !== 200) throw new Error("Could not get config file");
      if (!data) return null;

      if (!("files" in data) || !data.files?.length) return null;

      const [config] = data.files;
      setMenuFileId(config.id);
      return config;
    },
    [fetchList],
  );

  const createMenuFile = useCallback(
    async (signal?: AbortSignal, fileContents?: unknown) => {
      const { data, status } = await uploadFile(
        {
          file: new File([JSON.stringify(fileContents)], CONFIG_FILE_NAME),
          metadata: {
            name: CONFIG_FILE_NAME,
            mimeType: "application/json",
          },
        },
        { signal },
      );

      if (status !== 200) throw new Error("Could not create config file");
      if (!data) return null;

      setMenuFileId(data.id);
      return data;
    },
    [uploadFile],
  );

  const getMenuFile = useCallback(
    async (signal: AbortSignal, fileMeta: gapi.client.drive.File) => {
      const { status, data } = await fetchFile(fileMeta, {
        signal,
        responseType: "json",
      });

      if (status !== 200) throw new Error("Could not get menu data file");

      // Parse the menu data
      const parsedData = spinnerEntriesSchema.safeParse(data);
      if (!parsedData.success) throw new Error("Could not parse menu data");
      else if (!parsedData.data) throw new Error("No data in menu data");

      const menuItems = parsedData.data;

      // Set the image urls
      for (const item of menuItems) {
        console.log(`Setting image url for ${item?.key}...`);

        if (!item.fileId) continue;

        const url = await getImageUrl(item);

        console.log(`Set image url for ${item?.key} to ${url}`);

        const index = menuItems.findIndex((i) => i.key === item.key);

        menuItems[index].imageUrl = url;
      }

      setMenuItems(menuItems);
    },
    [fetchFile, getImageUrl],
  );

  const updateMenuFile = useCallback(
    async (signal: AbortSignal, contents: SpinnerEntry[]) => {
      try {
        if (!menuFileId)
          throw new Error("Error updating config file: no file id");

        // Remove local image blob urls if the image has a file ID
        const contentsWithoutBlobs = contents.map((item) => {
          const { fileId, imageUrl } = item;
          return {
            ...item,
            imageUrl: fileId ? undefined : imageUrl,
          };
        });

        await updateFile(
          {
            id: menuFileId,
            file: new File(
              [JSON.stringify(contentsWithoutBlobs)],
              CONFIG_FILE_NAME,
            ),
            metadata: {
              name: CONFIG_FILE_NAME,
              mimeType: "application/json",
            },
          },
          {
            signal,
          },
        );

        return true;
      } catch (error) {
        if (!(error instanceof AxiosError)) console.error(error);
        return false;
      }
    },
    [menuFileId, updateFile],
  );

  const resetMenuFile = useCallback(
    async (signal?: AbortSignal) => {
      const defaultConfig = await getDefaultMenu();

      await createMenuFile(signal, defaultConfig);
      setMenuItems(defaultConfig);
    },
    [createMenuFile],
  );

  const getMenuOrCreate = useCallback(
    async (signal: AbortSignal) => {
      try {
        const fileMeta = await getMenuFileMeta();

        // List the files
        if (fileMeta) await getMenuFile(signal, fileMeta);
        else await resetMenuFile(signal);

        setState("idle");
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "CanceledError") return;
          if (error.message === "Authorizing") return;
          setError(`${error.name}: ${error.message}`);
        } else {
          setError("An unknown error ocurred");
        }

        console.error(error);
      }
    },
    [getMenuFileMeta, getMenuFile, resetMenuFile],
  );

  // Get the config file or create it when drive is loaded
  useEffect(() => {
    if (!isDriveLoaded || state !== "loading") return;

    const controller = new AbortController();
    const signal = controller.signal;

    void getMenuOrCreate(signal);

    return () => {
      controller.abort();
    };
  }, [getMenuOrCreate, isDriveLoaded, state]);

  // Alert the user if there are unsaved changes
  useBeforeUnload(state === "dirty" || state === "uploading");

  const isLoaded = useMemo(() => state !== "loading", [state]);

  const enabledMenuItems = useMemo(
    () => menuItems?.filter(({ enabled }) => enabled),
    [menuItems],
  );

  const debounceMenuUpload = async (
    newItems: SpinnerEntry[] | undefined,
    timeout: number,
  ) => {
    // Reset the timeout if there is already one
    if (pendingUpload) {
      pendingUpload.controller.abort();
      clearTimeout(pendingUpload.timeoutId);
    }

    const controller = new AbortController();

    await new Promise((resolve) => {
      const timeoutId = setTimeout(resolve, timeout);
      setPendingUpload({ timeoutId, controller });
    });

    setState("uploading");
    await updateMenuFile(controller.signal, newItems || []);
    setState("idle");

    setPendingUpload(undefined);
  };

  const setAllMenuItemsWithUpload: SpinnerMenuContext["setAllMenuItems"] = (
    items,
  ) => {
    const newItems = typeof items === "function" ? items(menuItems) : items;

    setMenuItems(newItems);

    setState("dirty");

    void debounceMenuUpload(newItems, DEBOUNCE_DELAY);
  };

  return (
    <SpinnerMenuProvider
      value={{
        isLoaded,
        allMenuItems: menuItems,
        setAllMenuItems: setAllMenuItemsWithUpload,
        enabledMenuItems,
        setError,
        resetMenuFile,
      }}
    >
      {children}
      {error && (
        <div className="fixed left-0 top-0 rounded-sm bg-orange-500 p-2 text-white">
          {error}
        </div>
      )}
      {state === "uploading" && (
        <div className="fixed inset-x-1/2 top-2 w-fit -translate-x-1/2 rounded-lg bg-emerald-700 p-2 text-white">
          <Spinner text={t("Saving...")} />
        </div>
      )}
    </SpinnerMenuProvider>
  );
}
