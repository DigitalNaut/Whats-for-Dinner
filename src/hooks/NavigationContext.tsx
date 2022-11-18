import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import type { To } from "react-router-dom";
import { useEffect } from "react";
import { createContext, useContext, useState } from "react";

export type NavigationProps = {
  title: string;
  backTo: To;
  menu?: JSX.Element;
};
type NavigationContext = NavigationProps & {
  setTitle: Dispatch<SetStateAction<string>>;
  setBackTo: Dispatch<SetStateAction<To>>;
  setMenu: Dispatch<SetStateAction<JSX.Element | undefined>>;
};

const navigationContext = createContext<NavigationContext>({
  backTo: "",
  title: "",
  setTitle: () => null,
  setBackTo: () => null,
  setMenu: () => null,
});

export function NavigationProvider({ children }: PropsWithChildren) {
  const [backTo, setBackTo] = useState<To>("");
  const [title, setTitle] = useState<string>("");
  const [menu, setMenu] = useState<JSX.Element>();

  return (
    <navigationContext.Provider
      value={{ title, setTitle, backTo, setBackTo, menu, setMenu }}
    >
      {children}
    </navigationContext.Provider>
  );
}

export function useDynamicHeader({
  backTo,
  title,
  menu,
}: Partial<NavigationProps>) {
  const { setBackTo, setTitle, setMenu } = useContext(navigationContext);

  useEffect(() => {
    backTo && setBackTo(backTo);
    title && setTitle(title);
    menu && setMenu(menu);

    return () => {
      setBackTo("");
      setTitle("");
    };
  }, [backTo, title, menu, setBackTo, setTitle, setMenu]);
}

export function useNavigationContext() {
  const context = useContext(navigationContext);
  if (context === undefined)
    throw new Error(
      "useNavigationContext must be used within a NavigationProvider"
    );
  return context;
}
