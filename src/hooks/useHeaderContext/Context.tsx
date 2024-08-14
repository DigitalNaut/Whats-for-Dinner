import { type PropsWithChildren, useState } from "react";

import type { HeaderProps } from "./types";
import { HeaderContextProvider } from ".";

export function HeaderProvider({ children }: PropsWithChildren) {
  const [headerProperties, setHeaderProperties] = useState<HeaderProps>({
    showMenuButton: false,
    altBackButton: undefined,
    altColor: false,
    elements: undefined,
  });

  return (
    <HeaderContextProvider
      value={{
        headerProperties,
        setHeaderProperties,
      }}
    >
      {children}
    </HeaderContextProvider>
  );
}
