import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

export type HeaderProps = {
  showMenuButton?: boolean;
  altBackButton?: JSX.Element;
  altColor?: boolean;
  elements?: JSX.Element;
};

type HeaderContext = {
  headerProperties: HeaderProps;
  setHeaderProperties: Dispatch<SetStateAction<HeaderProps>>;
};

const headerContext = createContext<HeaderContext | null>(null);

export function HeaderProvider({ children }: PropsWithChildren) {
  const [headerProperties, setHeaderProperties] = useState<HeaderProps>({
    showMenuButton: false,
    altBackButton: undefined,
    altColor: false,
    elements: undefined,
  });

  return (
    <headerContext.Provider
      value={{
        headerProperties,
        setHeaderProperties,
      }}
    >
      {children}
    </headerContext.Provider>
  );
}

export function useHeaderContext() {
  const context = useContext(headerContext);

  if (!context)
    throw new Error("useHeaderContext must be used within a HeaderProvider");

  return context;
}
