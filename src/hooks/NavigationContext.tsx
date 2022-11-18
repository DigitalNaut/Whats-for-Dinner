import type { PropsWithChildren } from "react";
import type { To } from "react-router-dom";
import { useEffect } from "react";
import { createContext, useContext, useState } from "react";

export type NavigationProps = {
  title: string;
  backTo: To;
};
type NavigationContext = NavigationProps & {
  useDynamicHeader(props: Partial<NavigationProps>): void;
};

const navigationContext = createContext<NavigationContext>({
  backTo: "",
  title: "",
  useDynamicHeader: () => null,
});

export function NavigationProvider({ children }: PropsWithChildren) {
  const [backTo, setBackTo] = useState<To>("");
  const [title, setTitle] = useState<string>("");

  const useDynamicHeader: NavigationContext["useDynamicHeader"] = ({
    backTo: newBackTo,
    title: newTitle,
  }) =>
    useEffect(() => {
      newBackTo && setBackTo(newBackTo);
      newTitle && setTitle(newTitle);

      return () => {
        setBackTo("");
        setTitle("");
      };
    }, [newBackTo, newTitle]);

  return (
    <navigationContext.Provider value={{ backTo, title, useDynamicHeader }}>
      {children}
    </navigationContext.Provider>
  );
}

export function useNavigationContext() {
  const context = useContext(navigationContext);
  if (context === undefined)
    throw new Error(
      "useNavigationContext must be used within a NavigationProvider"
    );
  return context;
}
