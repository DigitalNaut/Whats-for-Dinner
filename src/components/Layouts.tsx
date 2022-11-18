import { Outlet } from "react-router-dom";

import { MenuHeader, TitleHeader } from "src/components/Header";

export function MainLayout() {
  return (
    <div
      className="h-full w-screen max-w-screen-md bg-gradient-to-br from-[#5B0B68]
          to-[#4C1D95] text-white shadow-2xl md:rounded-xl"
    >
      <div className="inset-0 h-full w-full rounded-[inherit] bg-svg-abstract-shapes bg-top bg-repeat p-3 sm:p-4 md:p-5 lg:p-6">
        <TitleHeader>¿Qué para comer?</TitleHeader>
        <Outlet />
      </div>
    </div>
  );
}

export function MenuLayout() {
  return (
    <div
      className="h-full w-screen max-w-screen-md
      bg-gray-700 text-white shadow-2xl md:rounded-xl"
    >
      <MenuHeader />
      <div className="rounded-[inherit] p-3 sm:p-4 md:p-5 lg:p-6">
        <Outlet />
      </div>
    </div>
  );
}
