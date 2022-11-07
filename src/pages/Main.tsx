import { useState } from "react";

import { useGoogleDrive } from "src/hooks/GoogleDriveContext";
import Spinner from "src/components/Spinner";
import ImageUpload from "src/components/ImageUpload";
import ImageList from "src/components/ImageList";

export default function Main() {
  const { isLoaded } = useGoogleDrive();
  const [refreshDate, setRefreshDate] = useState(Date.now());

  if (!isLoaded)
    return (
      <div className="absolute inset-0 grid place-items-center">
        <Spinner />
      </div>
    );

  return (
    <div className="flex pt-6">
      <div className="w-1/2 p-2">
        <h2 className="text-xl mb-4">Guardar imagen</h2>
        <ImageUpload onUpload={() => setRefreshDate(Date.now())} />
      </div>

      <div className="w-1/2 p-2 flex flex-col gap-4">
        <h2 className="text-xl mb-4">Imágenes guardadas</h2>
        <ImageList refreshDate={refreshDate} />
      </div>
    </div>
  );
}
