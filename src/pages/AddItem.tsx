import type { FormEventHandler, Reducer } from "react";
import { useReducer } from "react";

import ImagePreview from "src/components/ImagePreview";
import InputFile from "src/components/InputFile";
import InputText from "src/components/InputText";
import Switcher from "src/components/Switcher";

enum ActionType {
  SetName,
  SetURL,
  Reset,
}

type Action = {
  type: ActionType;
  payload: string;
};

const initialFormState = {
  imageName: "",
  imageUrl: "",
};
const stateReducer: Reducer<typeof initialFormState, Action> = (
  prevState,
  action
) => {
  switch (action.type) {
    case ActionType.Reset:
      return initialFormState;
    case ActionType.SetName:
      return { ...prevState, imageName: action.payload };
    case ActionType.SetURL:
      return { ...prevState, imageUrl: action.payload };
    default:
      throw new Error("Invalid action type" + action.type);
  }
};

export default function AddItem() {
  const [formState, formDispatch] = useReducer(stateReducer, initialFormState);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-2xl text-center">Nuevo platillo</h2>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <InputText
          required
          name="dish-name"
          label="Nombre del platillo"
          value={formState.imageName}
          onChange={({ target: { value: payload } }) => {
            formDispatch({
              type: ActionType.SetName,
              payload,
            });
          }}
          onClear={() => {
            formDispatch({
              type: ActionType.SetName,
              payload: "",
            });
          }}
        />

        <Switcher
          initialState={true}
          onChange={() => null}
          labels={["Imagen", "URL"]}
          renders={{
            firstOption: <InputFile required name="dish-image" />,
            secondOption: (
              <>
                <InputText
                  required
                  name="dish-url"
                  label="URL de la imagen"
                  value={formState.imageUrl}
                  onChange={({ target: { value: payload } }) => {
                    formDispatch({
                      type: ActionType.SetURL,
                      payload,
                    });
                  }}
                  onClear={() => {
                    formDispatch({
                      type: ActionType.SetURL,
                      payload: "",
                    });
                  }}
                />
                <ImagePreview src={formState.imageUrl} />
                <span>{}</span>
              </>
            ),
          }}
        />
        <button type="submit" data-filled>
          Añadir
        </button>
      </form>
    </div>
  );
}
