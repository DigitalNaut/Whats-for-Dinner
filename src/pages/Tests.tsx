import SpinningWheel from "src/components/SpinningWheel";
import { useSpinnerMenuContext } from "src/hooks/SpinnerMenuContext";

function Tests() {
  const { enabledMenuItems } = useSpinnerMenuContext();
  // const { isLoaded } = useGoogleDrive();
  // const [refreshDate, setRefreshDate] = useState(Date.now());

  // if (!isLoaded)
  //   return (
  //     <div className="absolute inset-0 grid place-items-center">
  //       <Spinner />
  //     </div>
  //   );

  return (
    <SpinningWheel choices={enabledMenuItems} />
    // <form
    //   className="flex flex-col gap-8"
    //   onSubmit={(event) => event.preventDefault()}
    // >
    //   <div className="flex">
    //     <div className="w-1/2 p-2">
    //       <h2 className="text-xl mb-4">Guardar imagen</h2>
    //       <ImageUpload onUpload={() => setRefreshDate(Date.now())} />
    //     </div>

    //     <div className="w-1/2 p-2 flex flex-col gap-4">
    //       <h2 className="text-xl mb-4">Imágenes guardadas</h2>
    //       <ImageList refreshDate={refreshDate} />
    //     </div>
    //   </div>

    //   <InputText name="dish-name" label="Nombre del platillo" />
    //   <InputFile name="dish-image" label="Imagen del platillo" />
    //   <button data-filled className="w-full">
    //     Añadir
    //   </button>
    // </form>
  );
}

export default Tests;
