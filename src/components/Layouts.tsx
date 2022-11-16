import { Outlet } from "react-router-dom";

import { MenuHeader, TitleHeader } from "src/components/Header";

export function MainLayout() {
  return (
    <div
      className="text-white bg-gradient-to-br from-[#5B0B68] to-[#4C1D95] shadow-2xl
          md:rounded-xl max-w-screen-md w-screen h-full"
    >
      <div className="bg-svg-abstract-shapes inset-0 bg-repeat bg-top rounded-[inherit] w-full h-full p-3 sm:p-4 md:p-5 lg:p-6">
        <TitleHeader>¿Qué para comer?</TitleHeader>
        <Outlet />
      </div>
    </div>
  );
}

export function MenuLayout() {
  return (
    <div
      className="text-white bg-gray-700 shadow-2xl
      md:rounded-xl max-w-screen-md w-screen h-full"
    >
      <MenuHeader />
      <div className="rounded-[inherit] p-3 sm:p-4 md:p-5 lg:p-6">
        <Outlet />
      </div>
    </div>
  );
}
