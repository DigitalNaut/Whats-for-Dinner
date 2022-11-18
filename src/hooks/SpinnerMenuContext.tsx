import type { PropsWithChildren } from "react";
import {
  useCallback,
  useEffect,
  useState,
  useContext,
  createContext,
} from "react";

import type { SpinnerOption } from "src/components/SpinningWheel";
import { useGoogleDrive } from "src/hooks/GoogleDriveContext";

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
    isLoaded: isDriveLoaded,
  } = useGoogleDrive();
  const [allMenuItems, setAllMenuItems] = useState<SpinnerOption[]>();
  const [enabledMenuItems, setSpinnerMenuItems] = useState<SpinnerOption[]>();

  const getConfig = useCallback(
    async (signal: AbortSignal) => {
      try {
        const { data } = await fetchList({
          signal,
          params: { q: "name = 'config.json'" },
        });

        // List the files
        if (data.files && data.files.length) {
          const { data: config } = await fetchFile(data.files[0], {
            signal,
            responseType: "json",
          });

          // Set the menu items
          if (config && Array.isArray(config)) {
            setAllMenuItems(config);
            setSpinnerMenuItems(config);
          }
        } else {
          // Create the config file
          await uploadFile(
            {
              file: new File([JSON.stringify([])], "config.json"),
              metadata: {
                name: "config.json",
                mimeType: "application/json",
              },
            },
            { signal }
          );
        }

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
    [fetchFile, fetchList, uploadFile]
  );

  function updateMenuItems() {
    if (!allMenuItems) return;
    setSpinnerMenuItems(allMenuItems.filter(({ enabled }) => enabled));
  }

  function toggleMenuItem(index: number, value?: boolean) {
    if (!allMenuItems || !enabledMenuItems) return;

    allMenuItems[index].enabled = value ?? !enabledMenuItems[index].enabled;
    updateMenuItems();
  }

  function addMenuItem(item: SpinnerOption) {
    if (!allMenuItems) return;

    allMenuItems.push(item);
    setAllMenuItems(allMenuItems);
    updateMenuItems();
  }

  useEffect(() => {
    if (!isDriveLoaded) return;

    const controller = new AbortController();
    const signal = controller.signal;

    getConfig(signal);

    return () => controller.abort();
  }, [getConfig, isDriveLoaded]);

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
