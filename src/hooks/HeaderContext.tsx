import type {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  MutableRefObject,
} from "react";
import type { To } from "react-router-dom";
import type { MenuItemProps, MenuProps } from "@ariakit/react/menu";
import {
  createRef,
  useEffect,
  createContext,
  useContext,
  useState,
} from "react";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Menu,
  MenuButton,
  MenuItem,
  useMenuStore,
  MenuSeparator,
} from "@ariakit/react/menu";

export type HeaderProps = {
  title: string;
  backTo: To;
  showMenuButton?: boolean;
  altBackButton?: JSX.Element;
  altColor?: boolean;
};
type HeaderContext = {
  headerProperties: HeaderProps;
  setHeaderProperties: Dispatch<SetStateAction<HeaderProps>>;
  menuButton: JSX.Element;
  createMenu: (
    items: (
      MenuItem: typeof Item,
      MenuSeparator: typeof Separator,
    ) => JSX.Element,
  ) => {
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
  style,
}: {
  forwardRef: MenuProps["ref"];
  menuState: MenuProps["store"];
  style?: MenuProps["style"];
}) {
  return (
    <div className="relative z-10" style={style}>
      <MenuButton
        aria-label="Menú"
        store={menuState}
        className="flex flex-col overflow-auto rounded-lg p-2 shadow-lg outline-none
        focus:ring-1 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
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
      className={`flex cursor-default scroll-m-2 items-center gap-2 rounded-sm bg-gray-50 p-2 text-gray-900 hover:bg-white hover:text-purple-800
        focus:ring-1 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600
      active:bg-purple-600 active:text-white aria-disabled:opacity-25 ${className}`}
      key={key}
      {...props}
    />
  );
}

function Separator() {
  return (
    <MenuSeparator
      orientation="horizontal"
      className="my-2 h-0 w-full border-t-gray-300"
    />
  );
}

export function HeaderProvider({ children }: PropsWithChildren) {
  const [headerProperties, setHeaderProperties] = useState<HeaderProps>({
    title: "",
    backTo: "",
    showMenuButton: false,
    altBackButton: undefined,
    altColor: false,
  });
  const menuStore = useMenuStore();
  const menuRef = createRef<HTMLDivElement>();
  const { showMenuButton } = headerProperties;
  const menuButton = (
    <PopupMenu
      menuState={menuStore}
      forwardRef={menuRef}
      style={{ visibility: showMenuButton ? "visible" : "hidden" }}
    />
  );

  const createMenu = (
    items: (
      MenuItem: typeof Item,
      MenuSeparator: typeof Separator,
    ) => JSX.Element,
  ) => {
    return {
      menu: (
        <Menu
          store={menuStore}
          gutter={8}
          className="absolute w-max overflow-hidden rounded-md bg-white p-0.5 shadow-lg outline-none"
        >
          {items(Item, Separator)}
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
