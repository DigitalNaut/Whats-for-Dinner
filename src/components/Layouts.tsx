import type { JSX, PropsWithChildren } from "react";

type Props = {
  header: JSX.Element;
};

const baseStyle =
  "m-auto size-full w-screen max-w-(--breakpoint-md) flex flex-col overflow-hidden bg-linear-to-br shadow-2xl md:rounded-xl";
export function BaseAppLayout({ children, header }: PropsWithChildren<Props>) {
  return (
    <div
      className={`${baseStyle} from-[#5B0B68] to-[#4C1D95] text-white md:rounded-xl`}
    >
      <div className="flex size-full flex-col gap-2 overflow-y-auto bg-[url(/src/assets/transparent-geometry.svg)] bg-top bg-repeat pt-8">
        {header}
        {children}
      </div>
    </div>
  );
}

export function MenuLayout({ children, header }: PropsWithChildren<Props>) {
  return (
    <div className={`${baseStyle} bg-gray-700 text-white md:rounded-xl`}>
      {header}
      <div className="flex flex-col overflow-y-auto">{children}</div>
    </div>
  );
}
