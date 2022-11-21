import type { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-full min-h-screen w-screen max-w-screen-md bg-gradient-to-br from-[#5B0B68] to-[#4C1D95] text-white shadow-2xl md:min-h-[calc(100vh-24px)] md:rounded-xl lg:min-h-[calc(100vh-48px)]">
      <div className="inset-0 grid h-full w-full grid-cols-1 grid-rows-[auto,_1fr] bg-svg-abstract-shapes bg-top bg-repeat pt-6">
        {children}
        <div className="overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function MenuLayout({ children }: PropsWithChildren) {
  return (
    <div className="grid h-screen w-screen max-w-screen-md grid-cols-1 grid-rows-[auto,_1fr] overflow-y-hidden bg-gray-700 text-white shadow-2xl md:h-[calc(100vh-24px)] md:rounded-xl lg:h-[calc(100vh-48px)]">
      {children}
      <div className="overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6">
        <Outlet />
      </div>
    </div>
  );
}
