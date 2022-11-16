import type { PropsWithChildren } from "react";
import { useContext } from "react";
import { createContext } from "react";

import type { SpinnerOption } from "src/components/SpinningWheel";

const choices: SpinnerOption[] = [
  {
    label: "Tacos al pastor",
    enabled: true,
    imageUrl:
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Pozole", // c-spell-checker:disable-line
    enabled: true,
    imageUrl:
      "https://images.unsplash.com/photo-1649532245300-c3ed0565ffa4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Ensalada de atún",
    enabled: true,
    imageUrl:
      "https://images.unsplash.com/photo-1612949060306-4c298ad7f34c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Sopa de pollo",
    enabled: true,
    imageUrl:
      "https://images.unsplash.com/photo-1569058242276-0bc3e078cf86?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Ensalada verde",
    enabled: true,
    imageUrl:
      "https://images.unsplash.com/photo-1608032077018-c9aad9565d29?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Carne asada",
    enabled: true,
    imageUrl:
      "https://images.unsplash.com/photo-1612871689353-cccf581d667b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Pizza",
    enabled: true,
    imageUrl:
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Hamburguesa",
    enabled: true,
    imageUrl:
      "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Pollo empanizado", // c-spell-checker:disable-line
    enabled: true,
    imageUrl:
      "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Arroz con pollo",
    enabled: true,
    imageUrl:
      "https://images.unsplash.com/photo-1569058242252-623df46b5025?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Sushi",
    enabled: true,
    imageUrl:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
  {
    label: "Spaghetti",
    enabled: true,
    imageUrl:
      "https://images.unsplash.com/photo-1635264685671-739e75e73e0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
  },
];

const spinnerMenuContext = createContext<SpinnerOption[]>(choices);

export function SpinnerMenuContextProvider({ children }: PropsWithChildren) {
  return (
    <spinnerMenuContext.Provider value={choices}>
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
