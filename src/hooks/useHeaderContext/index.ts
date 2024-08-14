import { createContext, useContext } from "react";

import { HeaderContext } from "./types";

const headerContext = createContext<HeaderContext | null>(null);

export const HeaderContextProvider = headerContext.Provider;

export function useHeaderContext() {
  const context = useContext(headerContext);

  if (!context)
    throw new Error("useHeaderContext must be used within a HeaderProvider");

  return context;
}
