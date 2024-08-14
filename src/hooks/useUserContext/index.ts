import { createContext, useContext } from "react";

import { UserContext } from "./types";

const userContext = createContext<UserContext | null>(null);

export const UserContextProvider = userContext.Provider;

export function useUser() {
  const context = useContext(userContext);

  if (!context) throw new Error("useUser must be used within a UserProvider");

  return context;
}
