import { useContext, createContext } from "react";

import { GoogleDriveContextType } from "./types";

const googleDriveContext = createContext<GoogleDriveContextType | null>(null);

export const GoogleDriveContextProvider = googleDriveContext.Provider;

export function useGoogleDriveContext() {
  const context = useContext(googleDriveContext);

  if (!context)
    throw new Error("useGoogleDrive must be used within a GoogleDriveContext");

  return context;
}
