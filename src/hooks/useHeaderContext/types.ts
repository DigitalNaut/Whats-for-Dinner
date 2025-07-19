import type { JSX, Dispatch, SetStateAction } from "react";

export type HeaderProps = {
  showMenuButton?: boolean;
  altBackButton?: JSX.Element;
  altColor?: boolean;
  elements?: JSX.Element;
};

export type HeaderContext = {
  headerProperties: HeaderProps;
  setHeaderProperties: Dispatch<SetStateAction<HeaderProps>>;
};
