import type {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  MutableRefObject,
} from "react";
import type { To } from "react-router-dom";
import type { MenuItemProps, MenuProps } from "ariakit/menu";
import {
  createRef,
  useEffect,
  createContext,
  useContext,
  useState,
} from "react";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, useMenuState } from "ariakit/menu";

export type HeaderProps = {
  title: string;
  backTo: To;
  altBackButton?: JSX.Element;
  altColor?: boolean;
};
type HeaderContext = {
  headerProperties: HeaderProps;
  setHeaderProperties: Dispatch<SetStateAction<HeaderProps>>;
  menuButton: JSX.Element;
  createMenu: (items: (MenuItem: typeof Item) => JSX.Element) => {
    menu: JSX.Element;
    menuRef: MutableRefObject<HTMLElement | null>;
  };
};

const headerContext = createContext<HeaderContext>({
  headerProperties: {
    title: "",
    backTo: "/",
  },
  menuButton: <></>,
  setHeaderProperties: () => null,
  createMenu: () => ({ menu: <></>, menuRef: { current: null } }),
});

function PopupMenu({
  menuState,
  forwardRef,
}: {
  forwardRef: MenuProps["ref"];
  menuState: MenuProps["state"];
}) {
  return (
    <div className="relative z-10">
      <MenuButton
        state={menuState}
        className="flex flex-col overflow-auto rounded-lg p-2 shadow-lg outline-none"
      >
        <FontAwesomeIcon icon={faEllipsis} />
      </MenuButton>
      <div ref={forwardRef} />
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

export function HeaderProvider({ children }: PropsWithChildren) {
  const [headerProperties, setHeaderProperties] = useState<HeaderProps>({
    title: "",
    backTo: "",
    altBackButton: undefined,
    altColor: false,
  });
  const menuState = useMenuState({ gutter: 8 });
  const menuRef = createRef<HTMLDivElement>();
  const menuButton = <PopupMenu menuState={menuState} forwardRef={menuRef} />;

  const createMenu = (items: (MenuItem: typeof Item) => JSX.Element) => {
    return {
      menu: (
        <Menu
          state={menuState}
          className="absolute w-max overflow-hidden rounded-md bg-white shadow-lg outline-none"
        >
          {items(Item)}
        </Menu>
      ),
      menuRef,
    };
  };

  return (
    <headerContext.Provider
      value={{
        headerProperties,
        setHeaderProperties,
        menuButton,
        createMenu,
      }}
    >
      {children}
    </headerContext.Provider>
  );
}

export function useHeader(props: Omit<HeaderProps, "menu">) {
  const { setHeaderProperties } = useHeaderContext();

  useEffect(() => {
    setHeaderProperties(props);

    return () => {
      setHeaderProperties({
        title: "",
        backTo: "",
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useHeaderContext() {
  const context = useContext(headerContext);
  if (context === undefined)
    throw new Error("useHeaderContext must be used within a HeaderProvider");
  return context;
}
