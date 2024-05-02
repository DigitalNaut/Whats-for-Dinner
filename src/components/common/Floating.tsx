import { type PropsWithChildren } from "react";

export default function Floating({ children }: PropsWithChildren) {
  return (
    <div className="fixed bottom-16 left-1/2 flex w-fit -translate-x-1/2 items-center">
      {children}
    </div>
  );
}
