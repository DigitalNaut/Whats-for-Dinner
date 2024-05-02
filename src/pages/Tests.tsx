import { useState } from "react";
import { Link } from "react-router-dom";
import { t } from "i18next";
// import { Link } from "react-router-dom";
// import Floating from "src/components/common/Floating";

import FontAwesomeIcon from "src/components/common/FontAwesomeIcon";
import ImageList from "src/components/ImageList";
import ImageUpload from "src/components/ImageUpload";
import Spinner from "src/components/common/Spinner";
// import SpinningWheel from "src/components/SpinningWheel";
import { useGoogleDriveContext } from "src/contexts/GoogleDriveContext";
// import { useSpinnerMenuContext } from "src/contexts/SpinnerMenuContext";

function Tests() {
  // const { enabledMenuItems } = useSpinnerMenuContext();
  const { isLoaded } = useGoogleDriveContext();
  const [refreshDate, setRefreshDate] = useState(() => Date.now());

  if (!isLoaded)
    return (
      <div className="absolute inset-0 grid place-items-center">
        <Spinner />
      </div>
    );

  return (
    <>
      {/* <SpinningWheel choices={enabledMenuItems} /> */}
      <Link className="m-auto flex items-center gap-1 underline" to="/">
        <FontAwesomeIcon className="fa-chevron-left" />
        {t("Back to home")}
      </Link>
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
      </form>

      {/* <Floating>
        <Link to="/menu" tabIndex={-1}>
          <Theme className="fa-edit">Editar menú</ThemedButton>
        </Link>
      </Floating> */}
    </>
  );
}

export default Tests;
