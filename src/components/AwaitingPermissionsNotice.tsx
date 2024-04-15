import type { PropsWithChildren } from "react";

import { useLanguageContext } from "src/contexts/LanguageContext";

export default function AwaitingPermissionsNotice({
  children,
}: PropsWithChildren) {
  const { t } = useLanguageContext();

  return (
    <div className="grid place-items-center rounded-lg border-2 border-dashed border-white p-2">
      <div className="text-center">
        <h3 className="font-bold">{t("Awaiting Permissions")}</h3>
        <p>{t("Grant permissions on screen")}</p>
      </div>
      {children}
    </div>
  );
}
