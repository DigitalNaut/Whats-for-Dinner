import { createContext, useContext } from "react";
import { z } from "zod";

import { UserSettingsContext } from "./types";

export const userSettingsSchema = z.object({
  preferredLanguage: z
    .string({
      required_error: "preferredLanguage is required",
    })
    .default("en"),
});

const userSettingsContext = createContext<UserSettingsContext | null>(null);

export const UserSettingsContextProvider = userSettingsContext.Provider;

export function useUserSettingsContext() {
  const context = useContext(userSettingsContext);
  if (!context)
    throw new Error(
      "useUserSettingsContext must be used within a UserSettingsProvider",
    );

  return context;
}
