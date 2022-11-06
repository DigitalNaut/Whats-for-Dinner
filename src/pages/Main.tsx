import { useState } from "react";

import { useGoogleDrive } from "src/hooks/GoogleDriveContext";
import Spinner from "src/components/Spinner";
import ImageUpload from "src/components/ImageUpload";
import ImageList from "src/components/ImageList";

export default function Main() {
  const { isLoaded } = useGoogleDrive();
  const [refreshDate, setRefreshDate] = useState(new Date());

  if (!isLoaded)
    return (
      <div className="absolute inset-0 grid place-items-center">
        <Spinner />
      </div>
    );

  return (
    <div className="flex p-6">
      <div className="flex-1">
        <h2 className="text-xl mb-4">Guardar imagen</h2>
        <ImageUpload onUpload={() => setRefreshDate(new Date())} />
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <h2 className="text-xl mb-4">Imágenes guardadas</h2>
        <ImageList refreshDate={refreshDate} />
      </div>
    </div>
  );
}
