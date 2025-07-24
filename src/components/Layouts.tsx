import type { JSX, PropsWithChildren } from "react";

type Props = {
  header: JSX.Element;
};

const baseStyle =
  "m-auto size-full w-screen max-w-[min(var(--breakpoint-xl),100%)] flex flex-col overflow-hidden bg-linear-to-br shadow-2xl md:rounded-xl";
export function BaseAppLayout({ children, header }: PropsWithChildren<Props>) {
  return (
    <div
      className={`${baseStyle} relative grow gap-2 overflow-y-auto from-[#5B0B68] to-[#4C1D95] pt-8 text-white md:rounded-xl`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[url(/src/assets/transparent-geometry.svg)] bg-top bg-repeat" />
      {header}
      {children}
    </div>
  );
}

export function MenuLayout({ children, header }: PropsWithChildren<Props>) {
  return (
    <div className={`${baseStyle} bg-gray-700 text-white md:rounded-xl`}>
      {header}
      <div className="flex grow flex-col overflow-y-auto">{children}</div>
    </div>
  );
}
