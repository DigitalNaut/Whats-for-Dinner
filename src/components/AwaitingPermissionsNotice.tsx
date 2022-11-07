import type { PropsWithChildren } from "react";

export default function AwaitingPermissionsNotice({
  children,
}: PropsWithChildren) {
  return (
    <div className="grid place-items-center border-dashed border-white border-2 rounded-lg p-2">
      <div className="text-center">
        <h3 className="font-bold">Esperando permisos</h3>
        <p>Otorga los permisos que aparecen en pantalla para continuar</p>
      </div>
      {children}
    </div>
  );
}
