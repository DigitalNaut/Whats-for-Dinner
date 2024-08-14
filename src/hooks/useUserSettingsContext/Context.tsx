import { type PropsWithChildren, useReducer, useEffect } from "react";

import { useLocalStorage } from "src/hooks/useLocalStorage";

import { ActionType, UserSettings } from "./types";
import { UserSettingsContextProvider, userSettingsSchema } from ".";

const userSettingsKey = "userSettings";
const defaultUserSettings: UserSettings = userSettingsSchema.parse({});

const reducer = (
  state: UserSettings,
  { type, payload }: ActionType,
): UserSettings => {
  switch (type) {
    case "set":
      return { ...state, ...payload };

    case "reset":
      return defaultUserSettings;

    default:
      return state;
  }
};

export default function UserSettingsProvider({ children }: PropsWithChildren) {
  const { data: savedUserSettings, saveData: saveUserSettings } =
    useLocalStorage(userSettingsKey, defaultUserSettings, userSettingsSchema);
  const [userSettings, setUserSettings] = useReducer(
    reducer,
    defaultUserSettings,
  );

  const setUserSetting = (payload: Partial<UserSettings>) => {
    setUserSettings({ type: "set", payload });
    saveUserSettings({ ...userSettings, ...payload });
  };

  const resetUserSettings = () => {
    setUserSettings({ type: "reset", payload: {} });
    saveUserSettings(defaultUserSettings);
  };

  useEffect(() => {
    if (savedUserSettings) {
      setUserSettings({ type: "set", payload: savedUserSettings });
    }
  }, [savedUserSettings]);

  return (
    <UserSettingsContextProvider
      value={{
        userSettings,
        setUserSetting,
        resetUserSettings,
      }}
    >
      {children}
    </UserSettingsContextProvider>
  );
}
