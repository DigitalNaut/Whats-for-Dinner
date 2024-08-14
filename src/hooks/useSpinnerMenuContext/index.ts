import { createContext, useContext } from "react";

import type { SpinnerMenuContext } from "./types";

const spinnerMenuContext = createContext<SpinnerMenuContext | null>(null);

export const SpinnerMenuProvider = spinnerMenuContext.Provider;

export function useSpinnerMenuContext() {
  const context = useContext(spinnerMenuContext);

  if (!context)
    throw new Error(
      "useSpinnerMenuContext must be used within a SpinnerMenuContextProvider",
    );

  return context;
}
