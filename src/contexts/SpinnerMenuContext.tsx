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
import { useGoogleDriveAPI } from "src/hooks/useGoogleDriveAPI";
import { useGoogleDriveContext } from "src/contexts/GoogleDriveContext";
import { useLanguageContext } from "src/contexts/LanguageContext";

const TIMEOUT = 2500;
const CONFIG_FILE_NAME = "config.json";

const State = ["Loading", "Idle", "Waiting", "Uploading", "Dirty"] as const;

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
  markMenuDirty: () => void;
};

const spinnerMenuContext = createContext<SpinnerMenuContext | null>(null);

export function SpinnerMenuContextProvider({ children }: PropsWithChildren) {
  const { t } = useLanguageContext();
  const [error, setError] = useState<string>();
  const { isLoaded: isDriveLoaded } = useGoogleDriveContext();
  const { fetchFile, fetchList, uploadFile, updateFile } = useGoogleDriveAPI();
  const [allMenuItems, setAllMenuItems] = useState<SpinnerOption[]>();
  const [state, setState] = useState<(typeof State)[number]>("Loading");
  const [uploadTimeoutId, setUploadTimeoutId] = useState<NodeJS.Timeout>();
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
          setAllMenuItems(defaultConfig);
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

        await updateConfigFile(allMenuItems || []);

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
    [allMenuItems, updateConfigFile, uploadTimeoutId],
  );

  // Upload the changes when dirty
  useEffect(() => {
    if (state !== "Dirty") return;

    triggerDelayedUpload();
  }, [state, triggerDelayedUpload]);

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

  const isLoaded = useMemo(() => state !== "Loading", [state]);

  const markMenuDirty = () => {
    setState("Dirty");
  };

  const enabledMenuItems = useMemo(
    () => allMenuItems?.filter(({ enabled }) => enabled),
    [allMenuItems],
  );

  return (
    <spinnerMenuContext.Provider
      value={{
        isLoaded,
        allMenuItems,
        setAllMenuItems,
        enabledMenuItems,
        setError,
        markMenuDirty,
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
