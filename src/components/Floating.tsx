import type { PropsWithChildren } from "react";

export default function Floating({ children }: PropsWithChildren) {
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-16 flex items-center w-fit">
      {children}
    </div>
  );
}
