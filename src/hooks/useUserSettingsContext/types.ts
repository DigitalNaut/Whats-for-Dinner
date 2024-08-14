import type { Dispatch } from "react";
import type { userSettingsSchema } from ".";
import { z } from "zod";

export type UserSettings = z.infer<typeof userSettingsSchema>;

export type ActionType = {
  type: "set" | "reset";
  payload: Partial<UserSettings>;
};

export type UserSettingsContext = {
  userSettings: UserSettings;
  setUserSetting: Dispatch<Partial<UserSettings>>;
  resetUserSettings: () => void;
};
