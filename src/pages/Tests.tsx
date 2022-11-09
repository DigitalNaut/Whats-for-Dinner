import InputText from "src/components/InputText";

function Tests() {
  return (
    <form
      className="flex flex-col gap-2 rounded-md bg-gray-700 p-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <InputText name="dish-name" label="Nombre del platillo" />
      <button data-filled className="w-full">
        Añadir
      </button>
    </form>
  );
}

export default Tests;
