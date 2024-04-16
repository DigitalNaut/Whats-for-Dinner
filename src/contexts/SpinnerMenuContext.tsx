import type { PropsWithChildren } from "react";
import {
  useCallback,
  useEffect,
  useState,
  useContext,
  createContext,
} from "react";
import Spinner from "src/components/common/Spinner";

import { useGoogleDriveAPI } from "src/hooks/useGoogleDriveAPI";
import { useGoogleDriveContext } from "src/contexts/GoogleDriveContext";
import { useLanguageContext } from "src/contexts/LanguageContext";
import type { SpinnerOption } from "src/components/SpinningWheel";

const TIMEOUT = 2500;
const CONFIG_FILE_NAME = "config.json";

const State = ["Loading", "Idle", "Waiting", "Uploading", "Dirty"] as const;

type SpinnerMenuContext = {
  allMenuItems?: SpinnerOption[];
  enabledMenuItems?: SpinnerOption[];
  isLoaded: boolean;
  toggleMenuItems: (indexes: number[], value?: boolean) => void;
  addMenuItem: (item: SpinnerOption) => void;
  deleteMenuItems: (indexes: number[], value?: boolean) => void;
};

const spinnerMenuContext = createContext<SpinnerMenuContext | null>(null);

const getDefaultConfig = async () => {
  const config = await import("src/data/DefaultConfig.json");
  return config.default;
};

export function SpinnerMenuContextProvider({ children }: PropsWithChildren) {
  const { t } = useLanguageContext();
  const [error, setError] = useState<string>();
  const { isLoaded: isDriveLoaded } = useGoogleDriveContext();
  const { fetchFile, fetchList, uploadFile, updateFile, deleteFile } =
    useGoogleDriveAPI();
  const [menuItems, setMenuItems] = useState<SpinnerOption[]>();
  const [configFileId, setConfigFileId] = useState<string>();
  const [state, setState] = useState<(typeof State)[number]>("Loading");
  const [uploadTimeoutId, setUploadTimeoutId] = useState<NodeJS.Timeout>();

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

  const deleteImage = async (item: SpinnerOption) => {
    try {
      if (!item.fileId) return null;

      return await deleteFile({ id: item.fileId });
    } catch (error) {
      console.error(error);
      return null;
    }
  };

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

          setMenuItems((prev) => {
            if (!prev) return prev;
            const newMenu = [...prev];
            const index = newMenu.findIndex((i) => i.key === item.key);
            newMenu[index].imageUrl = url;
            return newMenu;
          });
        });

        setMenuItems(config);
      }
    },
    [fetchFile, getImage],
  );

  const updateConfigFile = useCallback(
    async (contents: SpinnerOption[]) => {
      try {
        if (!configFileId) throw new Error("No config file ID");

        // Remove local image blob urls if the image has a file ID
        const contentsWithoutBlobs = contents.map((item) => {
          const { fileId, imageUrl } = item;
          return {
            ...item,
            imageUrl: fileId ? undefined : imageUrl,
          };
        });

        await updateFile({
          id: configFileId,
          file: new File(
            [JSON.stringify(contentsWithoutBlobs)],
            CONFIG_FILE_NAME,
          ),
          metadata: {
            name: CONFIG_FILE_NAME,
            mimeType: "application/json",
          },
        });

        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [configFileId, updateFile],
  );

  const getConfigOrCreate = useCallback(
    async (signal: AbortSignal) => {
      try {
        const fileMeta = await getConfigFileMeta();

        // List the files
        if (fileMeta) await getConfigFile(signal, fileMeta);
        else {
          const defaultConfig = await getDefaultConfig();

          await createConfigFile(signal, defaultConfig);
          setMenuItems(defaultConfig);
        }

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
    [getConfigFileMeta, createConfigFile, getConfigFile],
  );

  const triggerDelayedUpload = useCallback(
    (timeout: number = TIMEOUT) => {
      // Reset the timeout & set state to waiting
      if (uploadTimeoutId) clearTimeout(uploadTimeoutId);
      setState("Waiting");

      const uploadFile = async () => {
        // Upload the changes
        // disable the timeout and toggle the flags
        setState("Uploading");

        await updateConfigFile(menuItems || []);

        if (uploadTimeoutId) clearTimeout(uploadTimeoutId);
        setUploadTimeoutId(undefined);
        setState("Idle");
      };

      // Set the timeout
      const timeoutId = setTimeout(() => {
        uploadFile();
      }, timeout);
      setUploadTimeoutId(timeoutId);
    },
    [menuItems, updateConfigFile, uploadTimeoutId],
  );

  function toggleMenuItems(indexes: number[], value?: boolean) {
    if (!menuItems) return;

    const newAllMenuItems = [...menuItems];
    newAllMenuItems.forEach((item, index) => {
      if (!indexes.includes(index)) return;

      if (value !== undefined) item.enabled = value;
      else item.enabled = !item.enabled;
    });

    setMenuItems(newAllMenuItems);
    setState("Dirty");
  }

  function addMenuItem(item: SpinnerOption) {
    if (!menuItems) return;

    setMenuItems((prevItems) => prevItems && [...prevItems, item]);
    setState("Dirty");
  }

  async function deleteMenuItems(indexes: number[]) {
    if (!menuItems) return;
    if (!indexes.length) return;

    const confirmDelete = confirm(t("All selected elements will be deleted"));

    if (!confirmDelete) return;

    // Delete the associated image
    const itemsToDelete = indexes
      .map((index) => menuItems[index])
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

    setMenuItems(
      (prevItems) =>
        prevItems &&
        [...prevItems].filter((_, index) => !indexes.includes(index)),
    );
    setState("Dirty");
  }

  useEffect(() => {
    if (state !== "Dirty") return;

    triggerDelayedUpload();
  }, [state, triggerDelayedUpload]);

  useEffect(() => {
    if (!isDriveLoaded || state !== "Loading") return undefined;

    const controller = new AbortController();
    const signal = controller.signal;

    getConfigOrCreate(signal);

    return () => {
      controller.abort();
    };
  }, [getConfigOrCreate, isDriveLoaded, state]);

  useEffect(() => {
    const alertUser = (event: BeforeUnloadEvent) => {
      // See: https://stackoverflow.com/a/69232120/13351497
      event.preventDefault();
      return (event.returnValue = t("There are unsaved changes"));
    };

    if (!window.onbeforeunload)
      if (uploadTimeoutId || state !== "Idle")
        window.addEventListener("beforeunload", alertUser);

    return () => window.removeEventListener("beforeunload", alertUser);
  }, [state, t, uploadTimeoutId]);

  return (
    <spinnerMenuContext.Provider
      value={{
        isLoaded: state !== "Loading",
        allMenuItems: menuItems,
        enabledMenuItems: menuItems?.filter(({ enabled }) => enabled),
        toggleMenuItems,
        addMenuItem,
        deleteMenuItems,
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
