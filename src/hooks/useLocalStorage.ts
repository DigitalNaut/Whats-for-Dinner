import { useEffect, useState, useCallback, useMemo } from "react";
import { type z } from "zod";

function curriedSettingsToStorage<T extends Record<string, unknown>>(
  key: string,
  callback: (settings: T) => void,
) {
  return (settings: T) => {
    localStorage.setItem(key, JSON.stringify(settings));
    callback(settings);
  };
}

/**
 * Save and load data from local storage with a key. Validates the data with a schema.
 * It holds the data in state and saves it to local storage via the functions.
 * @param key The key to save the data under in local storage
 * @param defaultData The default data to use if no data is saved in local storage
 * @param schema The schema to validate the data with
 * @returns The data and a function to save the data
 */
export function useLocalStorage<T extends Record<string, unknown>>(
  key: string,
  defaultData: T,
  schema: z.Schema<T>,
) {
  const [data, setData] = useState<T>(defaultData);

  const saveToStorage = useMemo(
    () => curriedSettingsToStorage<T>(key, setData),
    [key],
  );

  const saveData = useCallback(
    (newData: T) => saveToStorage(newData),
    [saveToStorage],
  );

  useEffect(() => {
    // Load settings from local storage
    const savedSettings = localStorage.getItem(key);
    // If no settings are saved, save the default settings
    if (!savedSettings) {
      if (import.meta.env.DEV)
        console.log(`Setting up default settings for "${key}"`);

      saveData(defaultData);
    } else
      try {
        // If settings are saved, try to parse them
        const parsedSettings = JSON.parse(savedSettings);
        const validatedSettings = schema.parse(parsedSettings);
        setData(validatedSettings);
      } catch (e) {
        // If parsing fails, reset to default settings
        if (import.meta.env.DEV)
          console.error(
            `Could not parse settings from local storage for "${key}", resetting to default settings`,
          );
        saveData(defaultData);
      }
  }, [defaultData, key, schema, saveData]);

  return { data, saveData };
}
