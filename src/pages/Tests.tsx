import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link } from "react-router-dom";
import Floating from "src/components/Floating";

import ImageList from "src/components/ImageList";
import ImageUpload from "src/components/ImageUpload";
import Spinner from "src/components/Spinner";
import SpinningWheel from "src/components/SpinningWheel";
import { useGoogleDrive } from "src/hooks/GoogleDriveContext";
import { useSpinnerMenuContext } from "src/hooks/SpinnerMenuContext";

function Tests() {
  const { enabledMenuItems } = useSpinnerMenuContext();
  const { isLoaded } = useGoogleDrive();
  const [refreshDate, setRefreshDate] = useState(Date.now());

  if (!isLoaded)
    return (
      <div className="absolute inset-0 grid place-items-center">
        <Spinner />
      </div>
    );

  return (
    <>
      <SpinningWheel choices={enabledMenuItems} />
      <form
        className="flex flex-col gap-8"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex">
          <div className="w-1/2 p-2">
            <h2 className="mb-4 text-xl">Guardar imagen</h2>
            <ImageUpload onUpload={() => setRefreshDate(Date.now())} />
          </div>

          <div className="flex w-1/2 flex-col gap-4 p-2">
            <h2 className="mb-4 text-xl">Imágenes guardadas</h2>
            <ImageList refreshDate={refreshDate} />
          </div>
        </div>

        {/* <InputText name="dish-name" label="Nombre del platillo" />
        <InputFile name="dish-image" label="Imagen del platillo" /> */}
        <button data-filled className="w-full">
          Añadir
        </button>
      </form>

      <Floating>
        <Link to="/menu">
          <button data-filled className="flex items-center gap-1">
            <FontAwesomeIcon icon={faEdit} />
            <span>Editar menú</span>
          </button>
        </Link>
      </Floating>
    </>
  );
}

export default Tests;
