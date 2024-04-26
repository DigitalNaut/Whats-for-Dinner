import {
  type PropsWithChildren,
  type Dispatch,
  createContext,
  useContext,
  useReducer,
  useEffect,
} from "react";
import { z } from "zod";

import { useLocalStorage } from "src/hooks/useLocalStorage";

const userSettingsSchema = z.object({
  preferredLanguage: z
    .string({
      required_error: "preferredLanguage is required",
    })
    .default("en"),
});

type UserSettings = z.infer<typeof userSettingsSchema>;

type ActionType = {
  type: "set" | "reset";
  payload: Partial<UserSettings>;
};

type UserSettingsContext = {
  userSettings: UserSettings;
  setUserSetting: Dispatch<Partial<UserSettings>>;
  resetUserSettings: () => void;
};

const userSettingsKey = "userSettings";
const defaultUserSettings: UserSettings = userSettingsSchema.parse({});
const userSettingsContext = createContext<UserSettingsContext | null>(null);

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
    <userSettingsContext.Provider
      value={{
        userSettings,
        setUserSetting,
        resetUserSettings,
      }}
    >
      {children}
    </userSettingsContext.Provider>
  );
}

export function useUserSettingsContext() {
  const context = useContext(userSettingsContext);
  if (!context)
    throw new Error(
      "useUserSettingsContext must be used within a UserSettingsProvider",
    );

  return context;
}
