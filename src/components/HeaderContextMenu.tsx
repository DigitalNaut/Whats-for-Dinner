import {
  type MenuItemProps,
  type MenuProps,
  Menu,
  MenuButton,
  MenuItem,
  MenuSeparator,
} from "@ariakit/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { type PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export function ContextMenuItem({ key, className, ...props }: MenuItemProps) {
  return (
    <MenuItem
      className={twMerge(
        "flex cursor-default scroll-m-2 items-center gap-2 rounded-sm bg-gray-50 p-2 text-gray-900 hover:bg-white hover:text-purple-800 focus:ring-1 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 active:bg-purple-600 active:text-white disabled:opacity-25",
        className,
      )}
      key={key}
      {...props}
    />
  );
}

export function ContextMenuSeparator() {
  return (
    <MenuSeparator
      orientation="horizontal"
      className="my-2 h-0 w-full border-t-gray-300"
    />
  );
}

export function ContextMenu({
  children,
  store,
}: PropsWithChildren<{
  store: MenuProps["store"];
}>) {
  return (
    <Menu
      store={store}
      gutter={8}
      className="absolute w-max overflow-hidden rounded-md bg-white p-0.5 shadow-lg outline-none"
    >
      {children}
    </Menu>
  );
}

export function ContextMenuButton({ store }: { store: MenuProps["store"] }) {
  return (
    <MenuButton
      aria-label="Menú"
      store={store}
      className="-mt-2 -ml-2 flex aspect-square size-8 flex-col items-center overflow-auto rounded-lg p-2 shadow-lg outline-none focus:ring-1 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
    >
      <FontAwesomeIcon icon={faEllipsisV} />
    </MenuButton>
  );
}
