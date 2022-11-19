import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import type { To } from "react-router-dom";
import type { MenuItemProps } from "ariakit/menu";
import { useMemo, useEffect, createContext, useContext, useState } from "react";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, useMenuState } from "ariakit/menu";

export type NavigationProps = {
  title: string;
  backTo: To;
  menu?: JSX.Element;
  altBackButton?: JSX.Element;
  altColor?: boolean;
};
type NavigationContext = NavigationProps & {
  setTitle: Dispatch<SetStateAction<string>>;
  setBackTo: Dispatch<SetStateAction<To>>;
  setMenuContent: Dispatch<SetStateAction<JSX.Element | undefined>>;
  setAltBackButton: Dispatch<SetStateAction<JSX.Element | undefined>>;
  setAltColor: Dispatch<SetStateAction<boolean>>;
  Item: typeof Item;
};

const navigationContext = createContext<NavigationContext>({
  backTo: "",
  title: "",
  setTitle: () => null,
  setBackTo: () => null,
  setMenuContent: () => null,
  setAltBackButton: () => null,
  setAltColor: () => null,
  Item: () => <></>,
});

function PopupMenu({ children }: PropsWithChildren) {
  const menuState = useMenuState({ gutter: 8 });

  return (
    <div className="relative z-10">
      <MenuButton
        state={menuState}
        className="flex flex-col overflow-auto rounded-lg p-2 shadow-lg outline-none"
      >
        <FontAwesomeIcon icon={faEllipsis} />
      </MenuButton>
      <Menu
        state={menuState}
        className="absolute w-max overflow-hidden rounded-md bg-white shadow-lg outline-none"
      >
        {children}
      </Menu>
    </div>
  );
}

function Item({ key, className, ...props }: MenuItemProps) {
  return (
    <MenuItem
      className={`flex cursor-default scroll-m-2 items-center gap-2 bg-gray-50 p-2 text-gray-900 outline-none 
    hover:bg-white hover:text-purple-800 active:bg-purple-600 active:text-white aria-disabled:opacity-25 ${className}`}
      key={key}
      {...props}
    />
  );
}

export function NavigationProvider({ children }: PropsWithChildren) {
  const [backTo, setBackTo] = useState<To>("");
  const [title, setTitle] = useState<string>("");
  const [menuContent, setMenuContent] = useState<JSX.Element>();
  const [altBackButton, setAltBackButton] = useState<JSX.Element>();
  const [altColor, setAltColor] = useState(false);

  return (
    <navigationContext.Provider
      value={{
        title,
        setTitle,
        backTo,
        setBackTo,
        menu: useMemo(
          () =>
            menuContent ? <PopupMenu>{menuContent}</PopupMenu> : undefined,
          [menuContent]
        ),
        setMenuContent,
        altBackButton,
        setAltBackButton,
        Item,
        altColor,
        setAltColor,
      }}
    >
      {children}
    </navigationContext.Provider>
  );
}

export function useHeader({
  backTo,
  title,
  menuItems,
}: Partial<Omit<NavigationProps, "menu">> & { menuItems?: JSX.Element }) {
  const { setBackTo, setTitle, setMenuContent } = useNavigationContext();

  const setHeader = () => {
    setTitle(title || "");
    setBackTo(backTo || "");
    setMenuContent(menuItems);
  };

  const resetHeader = () => {
    setTitle("");
    setBackTo("");
    setMenuContent(undefined);
  };

  useEffect(() => {
    setHeader();

    return () => {
      resetHeader();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useNavigationContext() {
  const context = useContext(navigationContext);
  if (context === undefined)
    throw new Error(
      "useNavigationContext must be used within a NavigationProvider"
    );
  return context;
}
