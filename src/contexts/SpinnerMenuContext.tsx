import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
  useContext,
  createContext,
  useMemo,
} from "react";
import Spinner from "src/components/common/Spinner";

import { type SpinnerOption } from "src/components/SpinningWheel";
import { useBeforeUnload } from "src/hooks/useBeforeUnload";
import { useGoogleDriveAPI } from "src/hooks/useGoogleDriveAPI";
import { useGoogleDriveContext } from "src/contexts/GoogleDriveContext";
import { useLanguageContext } from "src/contexts/LanguageContext";
import { AxiosError } from "axios";

const DEBOUNCE_DELAY = 2500;
const CONFIG_FILE_NAME = "config.json";

const State = ["Loading", "Idle", "Dirty", "Uploading"] as const;

const getDefaultConfig = async () => {
  const config = await import("src/data/DefaultConfig.json");
  return config.default;
};

type SpinnerMenuContext = {
  allMenuItems?: SpinnerOption[];
  enabledMenuItems?: SpinnerOption[];
  isLoaded: boolean;
  setError: Dispatch<SetStateAction<string | undefined>>;
  setAllMenuItems: Dispatch<SetStateAction<SpinnerOption[] | undefined>>;
  resetConfigFile: (signal?: AbortSignal) => Promise<void>;
};

const spinnerMenuContext = createContext<SpinnerMenuContext | null>(null);

export function SpinnerMenuContextProvider({ children }: PropsWithChildren) {
  const { t } = useLanguageContext();
  const [error, setError] = useState<string>();
  const { isLoaded: isDriveLoaded } = useGoogleDriveContext();
  const { fetchFile, fetchList, uploadFile, updateFile } = useGoogleDriveAPI();
  const [allMenuItems, setAllMenuItems] = useState<SpinnerOption[]>();
  const [state, setState] = useState<(typeof State)[number]>("Loading");
  const [pendingUpload, setPendingUpload] = useState<{
    timeoutId: NodeJS.Timeout;
    controller: AbortController;
  }>();
  const [configFileId, setConfigFileId] = useState<string>();

  const getImage = useCallback(
    async (item: SpinnerOption) => {
      try {
        const { data, status } = await fetchFile<Blob>(
          { id: item.fileId },
          { responseType: "blob" },
        );

        if (status !== 200 || !data)
          throw new Error(`Could not get image: HTTP ${status}`);
        if (!(data instanceof Blob)) throw new Error("Data is not a blob");

        const url = URL.createObjectURL(data);

        return url;
      } catch (error) {
        console.error(error);
        return "https://via.placeholder.com/256";
      }
    },
    [fetchFile],
  );

  const getConfigFileMeta = useCallback(
    async (signal?: AbortSignal) => {
      const { data, status } = await fetchList({
        signal,
        params: { q: `name = '${CONFIG_FILE_NAME}'` },
      });

      if (status !== 200) throw new Error("Could not get config file");
      if (!data) return null;

      if (!data.files?.length) return null;

      const [config] = data.files;
      setConfigFileId(config.id);
      return config;
    },
    [fetchList],
  );

  const createConfigFile = useCallback(
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

      setConfigFileId(data.id);
      return data;
    },
    [uploadFile],
  );

  const getConfigFile = useCallback(
    async (signal: AbortSignal, fileMeta: gapi.client.drive.File) => {
      const { data: config } = await fetchFile(fileMeta, {
        signal,
        responseType: "json",
      });

      // Set the menu items
      if (config && Array.isArray(config)) {
        const menuArray = config as SpinnerOption[];

        menuArray.forEach(async (item) => {
          if (!item.fileId) return;

          const url = await getImage(item);

          setAllMenuItems((prev) => {
            if (!prev) return prev;
            const newMenu = [...prev];
            const index = newMenu.findIndex((i) => i.key === item.key);
            newMenu[index].imageUrl = url;
            return newMenu;
          });
        });

        setAllMenuItems(config);
      }
    },
    [fetchFile, getImage],
  );

  const updateConfigFile = useCallback(
    async (signal: AbortSignal, contents: SpinnerOption[]) => {
      try {
        if (!configFileId) throw new Error("Error updating config file: no id");

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
            id: configFileId,
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
    [configFileId, updateFile],
  );

  const resetConfigFile = useCallback(
    async (signal?: AbortSignal) => {
      const defaultConfig = await getDefaultConfig();

      await createConfigFile(signal, defaultConfig);
      setAllMenuItems(defaultConfig);
    },
    [createConfigFile],
  );

  const getConfigOrCreate = useCallback(
    async (signal: AbortSignal) => {
      try {
        const fileMeta = await getConfigFileMeta();

        // List the files
        if (fileMeta) await getConfigFile(signal, fileMeta);
        else await resetConfigFile(signal);

        setState("Idle");
      } catch (error) {
        if (error === "Authorizing") return;

        if (error instanceof Error) {
          if (error.name === "CanceledError") return;
          setError(`${error.name}: ${error.message}`);
        } else {
          setError("An unknown error ocurred");
        }

        console.error(error);
      }
    },
    [getConfigFileMeta, getConfigFile, resetConfigFile],
  );

  // Get the config file or create it when drive is loaded
  useEffect(() => {
    if (!isDriveLoaded || state !== "Loading") return undefined;

    const controller = new AbortController();
    const signal = controller.signal;

    getConfigOrCreate(signal);

    return () => {
      controller.abort();
    };
  }, [getConfigOrCreate, isDriveLoaded, state]);

  // Alert the user if there are unsaved changes
  useBeforeUnload(state === "Dirty" || state === "Uploading");

  const isLoaded = useMemo(() => state !== "Loading", [state]);

  const enabledMenuItems = useMemo(
    () => allMenuItems?.filter(({ enabled }) => enabled),
    [allMenuItems],
  );

  const triggerDelayedUpload = async (
    newItems: SpinnerOption[] | undefined,
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

    setState("Uploading");
    await updateConfigFile(controller.signal, newItems || []);
    setState("Idle");

    setPendingUpload(undefined);
  };

  const setAllMenuItemsWithDelayedUpload: SpinnerMenuContext["setAllMenuItems"] =
    (items) => {
      const newItems =
        typeof items === "function" ? items(allMenuItems) : items;

      setAllMenuItems(newItems);

      setState("Dirty");

      triggerDelayedUpload(newItems, DEBOUNCE_DELAY);
    };

  return (
    <spinnerMenuContext.Provider
      value={{
        isLoaded,
        allMenuItems,
        setAllMenuItems: setAllMenuItemsWithDelayedUpload,
        enabledMenuItems,
        setError,
        resetConfigFile,
      }}
    >
      {children}
      {error && (
        <div className="fixed left-0 top-0 rounded-sm bg-red-500 p-2 text-white">
          {error}
        </div>
      )}
      {state === "Uploading" && (
        <div className="fixed inset-x-1/2 top-2 w-fit -translate-x-1/2 rounded-lg bg-emerald-700 p-2 text-white">
          <Spinner text={t("Saving...")} />
        </div>
      )}
    </spinnerMenuContext.Provider>
  );
}

export function useSpinnerMenuContext() {
  const context = useContext(spinnerMenuContext);

  if (!context)
    throw new Error(
      "useSpinnerMenuContext must be used within a SpinnerMenuContextProvider",
    );

  return context;
}
