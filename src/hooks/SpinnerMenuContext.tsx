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

enum State {
  Loading,
  Idle,
  Waiting,
  Uploading,
  Dirty,
}

const spinnerMenuContext = createContext<{
  allMenuItems?: SpinnerOption[];
  enabledMenuItems?: SpinnerOption[];
  isLoaded: boolean;
  toggleMenuItems: (indexes: number[], value?: boolean) => void;
  addMenuItem: (item: SpinnerOption) => void;
  deleteMenuItems: (indexes: number[], value?: boolean) => void;
}>({
  isLoaded: false,
  toggleMenuItems: () => {
    throw new Error("SpinnerMenuContext not initialized");
  },
  addMenuItem: () => {
    throw new Error("SpinnerMenuContext not initialized");
  },
  deleteMenuItems: () => {
    throw new Error("SpinnerMenuContext not initialized");
  },
});

export function SpinnerMenuContextProvider({ children }: PropsWithChildren) {
  const [error, setError] = useState<string>();
  const {
    fetchFile,
    fetchList,
    uploadFile,
    updateFile,
    isLoaded: isDriveLoaded,
  } = useGoogleDrive();
  const [menuItems, setMenuItems] = useState<SpinnerOption[]>();
  const [configFileId, setConfigFileId] = useState<string>();
  const [state, setState] = useState<State>(State.Loading);
  const [uploadTimeoutId, setUploadTimeoutId] = useState<NodeJS.Timeout>();

  const getConfigFileMeta = useCallback(
    async (signal?: AbortSignal) => {
      const { data } = await fetchList({
        signal,
        params: { q: `name = '${CONFIG_FILE_NAME}'` },
      });

      if (!data.files?.length) return null;

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

  const updateConfig = useCallback(
    async (contents: SpinnerOption[]) => {
      try {
        if (!configFileId) throw new Error("No config file ID");

        await updateFile({
          id: configFileId,
          file: new File([JSON.stringify(contents)], CONFIG_FILE_NAME),
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
    [configFileId, updateFile]
  );

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
          if (config && Array.isArray(config)) setMenuItems(config);
        } else createConfigFile();

        setState(State.Idle);
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
    [createConfigFile, fetchFile, getConfigFileMeta]
  );

  const triggerDelayedUpload = useCallback(
    (timeout: number = TIMEOUT) => {
      // Reset the timeout & set state to waiting
      if (uploadTimeoutId) clearTimeout(uploadTimeoutId);
      setState(State.Waiting);

      const uploadFile = async () => {
        // Upload the changes
        // disable the timeout and toggle the flags
        setState(State.Uploading);

        await updateConfig(menuItems || []);

        if (uploadTimeoutId) clearTimeout(uploadTimeoutId);
        setUploadTimeoutId(undefined);
        setState(State.Idle);
      };

      // Set the timeout
      const timeoutId = setTimeout(() => {
        uploadFile();
      }, timeout);
      setUploadTimeoutId(timeoutId);
    },
    [menuItems, updateConfig, uploadTimeoutId]
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
    setState(State.Dirty);
  }

  function addMenuItem(item: SpinnerOption) {
    if (!menuItems) return;

    setMenuItems((prevItems) => prevItems && [...prevItems, item]);
    setState(State.Dirty);
  }

  async function deleteMenuItems(indexes: number[]) {
    if (!menuItems) return;
    if (!indexes.length) return;

    const confirmDelete = confirm(
      "Se borrarán todos los elementos seleccionados"
    );

    if (!confirmDelete) return;

    setMenuItems(
      (prevItems) =>
        prevItems &&
        [...prevItems].filter((_, index) => !indexes.includes(index))
    );
    setState(State.Dirty);
  }

  useEffect(() => {
    if (state !== State.Dirty) return;

    triggerDelayedUpload();
  }, [state, triggerDelayedUpload]);

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
      if (uploadTimeoutId || state !== State.Idle)
        window.addEventListener("beforeunload", alertUser);

    return () => window.removeEventListener("beforeunload", alertUser);
  }, [state, uploadTimeoutId]);

  return (
    <spinnerMenuContext.Provider
      value={{
        isLoaded: state !== State.Loading,
        allMenuItems: menuItems,
        enabledMenuItems: menuItems?.filter(({ enabled }) => enabled),
        toggleMenuItems,
        addMenuItem,
        deleteMenuItems,
      }}
    >
      {children}
      {state === State.Uploading && (
        <div className="fixed inset-x-1/2 top-2 w-fit -translate-x-1/2 rounded-lg bg-emerald-700 p-2 text-white">
          <Spinner text="Guardando..." />
        </div>
      )}
      {error && (
        <div className="w-full rounded-sm bg-red-500 p-2 text-white">
          {error}
        </div>
      )}
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
