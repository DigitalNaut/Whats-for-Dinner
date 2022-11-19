import type { PropsWithChildren } from "react";
import {
  useCallback,
  useEffect,
  useState,
  useContext,
  createContext,
} from "react";
import Spinner from "src/components/Spinner";

import type { SpinnerOption } from "src/components/SpinningWheel";
import { useGoogleDrive } from "src/hooks/GoogleDriveContext";

const TIMEOUT = 2500;
const CONFIG_FILE_NAME = "config.json";

const spinnerMenuContext = createContext<{
  allMenuItems?: SpinnerOption[];
  enabledMenuItems?: SpinnerOption[];
  isLoaded: boolean;
  toggleMenuItem: (index: number, value?: boolean) => void;
  addMenuItem: (item: SpinnerOption) => void;
}>({
  isLoaded: false,
  toggleMenuItem: () => {
    throw new Error("SpinnerMenuContext not initialized");
  },
  addMenuItem: () => {
    throw new Error("SpinnerMenuContext not initialized");
  },
});

export function SpinnerMenuContextProvider({ children }: PropsWithChildren) {
  const [error, setError] = useState<string>();
  const [isLoaded, setIsLoaded] = useState(false);
  const {
    fetchFile,
    fetchList,
    uploadFile,
    updateFile,
    isLoaded: isDriveLoaded,
  } = useGoogleDrive();
  const [allMenuItems, setAllMenuItems] = useState<SpinnerOption[]>();
  const [enabledMenuItems, setEnabledMenuItems] = useState<SpinnerOption[]>();
  const [configFileId, setConfigFileId] = useState<string>();
  const [uploadTimeout, setUploadTimeout] = useState<NodeJS.Timeout>();
  const [isUploading, setIsUploading] = useState(false);

  const setMenuItems = useCallback((config: SpinnerOption[]) => {
    if (!config) return;
    setAllMenuItems(config);
    setEnabledMenuItems(config.filter(({ enabled }) => enabled));
  }, []);

  const getConfigFileMeta = useCallback(
    async (signal?: AbortSignal) => {
      const { data } = await fetchList({
        signal,
        params: { q: `name = '${CONFIG_FILE_NAME}'` },
      });

      // List the files
      if (!data.files || !data.files.length) return null;

      const [config] = data.files;
      setConfigFileId(config.id);
      return config;
    },
    [fetchList]
  );

  const createConfigFile = useCallback(
    async (signal?: AbortSignal) => {
      await uploadFile(
        {
          file: new File([JSON.stringify([])], CONFIG_FILE_NAME),
          metadata: {
            name: "config.json",
            mimeType: "application/json",
          },
        },
        { signal }
      );
    },
    [uploadFile]
  );

  const updateConfig = useCallback(async () => {
    try {
      if (!configFileId) throw new Error("No config file id");

      await updateFile({
        id: configFileId,
        file: new File([JSON.stringify(allMenuItems)], CONFIG_FILE_NAME),
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
  }, [allMenuItems, configFileId, updateFile]);

  const getConfigOrCreate = useCallback(
    async (signal: AbortSignal) => {
      try {
        const fileMeta = await getConfigFileMeta();

        // List the files
        if (fileMeta) {
          const { data: config } = await fetchFile(fileMeta, {
            signal,
            responseType: "json",
          });

          // Set the menu items
          if (config && Array.isArray(config)) {
            setMenuItems(config);
          }
        } else createConfigFile();

        setIsLoaded(true);
      } catch (error) {
        if (error === "Authorizing") return;

        if (error instanceof Error) {
          if (error.name === "CanceledError") return;
          setError(`${error.name}: ${error.message}`);
          console.error(error);
        } else {
          setError("An unknown error ocurred");
          console.error(error);
        }
      }
    },
    [createConfigFile, fetchFile, getConfigFileMeta, setMenuItems]
  );

  function triggerDelayedUpload(timeout: number = TIMEOUT) {
    // Reset the timeout
    if (uploadTimeout) clearTimeout(uploadTimeout);

    const uploadChanges = async () => {
      // Upload the changes
      // and toggle the flags
      setIsUploading(true);

      await updateConfig();

      setUploadTimeout(undefined);
      setIsUploading(false);
    };

    // Set the new timeout
    const timeoutId = setTimeout(uploadChanges, timeout);
    setUploadTimeout(timeoutId);
  }

  function toggleMenuItem(index: number, value?: boolean) {
    if (!allMenuItems || !enabledMenuItems) return Promise.resolve(false);

    allMenuItems[index].enabled = value ?? !enabledMenuItems[index].enabled;
    setMenuItems(allMenuItems);

    triggerDelayedUpload();
  }

  function addMenuItem(item: SpinnerOption) {
    if (!allMenuItems) return Promise.resolve(false);

    allMenuItems.push(item);
    setMenuItems(allMenuItems);

    triggerDelayedUpload(0);
  }

  useEffect(() => {
    if (!isDriveLoaded) return undefined;

    const controller = new AbortController();
    const signal = controller.signal;

    getConfigOrCreate(signal);

    return () => {
      controller.abort();
    };
  }, [getConfigOrCreate, isDriveLoaded]);

  useEffect(() => {
    const alertUser = (event: BeforeUnloadEvent) => {
      // See: https://stackoverflow.com/a/69232120/13351497
      event.preventDefault();
      return (event.returnValue = "Aún hay información sin guardar");
    };

    if (!window.onbeforeunload)
      if (uploadTimeout || isUploading)
        window.addEventListener("beforeunload", alertUser);

    return () => window.removeEventListener("beforeunload", alertUser);
  }, [uploadTimeout, isUploading]);

  return (
    <spinnerMenuContext.Provider
      value={{
        isLoaded,
        enabledMenuItems,
        allMenuItems,
        toggleMenuItem,
        addMenuItem,
      }}
    >
      {isUploading && (
        <div className="fixed inset-x-1/2 top-2 w-fit -translate-x-1/2 rounded-lg bg-emerald-700 p-2 text-white">
          <Spinner text="Guardando..." />
        </div>
      )}
      {error && (
        <div className="w-full rounded-sm bg-red-500 p-2 text-white">
          {error}
        </div>
      )}
      {children}
    </spinnerMenuContext.Provider>
  );
}

export function useSpinnerMenuContext() {
  const context = useContext(spinnerMenuContext);
  if (context === undefined)
    throw new Error(
      "useSpinnerMenuContext must be used within a SpinnerMenuContextProvider"
    );
  return context;
}
