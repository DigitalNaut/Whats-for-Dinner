import type { FormEventHandler, Reducer } from "react";
import { useState, useReducer } from "react";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ImagePreview from "src/components/ImagePreview";
import InputFile from "src/components/InputFile";
import InputText from "src/components/InputText";
import Switcher from "src/components/Switcher";
import { useSpinnerMenuContext } from "src/hooks/SpinnerMenuContext";
import { useNavigate } from "react-router-dom";

enum FormFields {
  DishName = "dishName",
  DishURL = "dishURL",
  DishImage = "dishImage",
}
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
  const navigate = useNavigate();
  const { addMenuItem } = useSpinnerMenuContext();
  const [error, setError] = useState<string>();

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    setError(undefined);
    const formData = new FormData(event.currentTarget);

    const label = formData.get(FormFields.DishName)?.toString().trim();
    const imageUrl = formData.get(FormFields.DishURL)?.toString().trim();

    if (label && imageUrl) {
      addMenuItem({
        label,
        imageUrl,
        enabled: true,
      });
      navigate("/menu");
    } else setError("Por favor llena todos los campos");
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-center text-2xl">Nuevo platillo</h2>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {error && (
          <div className="flex w-full items-center gap-1 rounded-sm bg-amber-600 p-2 text-white">
            <FontAwesomeIcon icon={faWarning} />
            {error}
          </div>
        )}
        <InputText
          required
          name={FormFields.DishName}
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
            firstOption: <InputFile required name={FormFields.DishImage} />,
            secondOption: (
              <>
                <InputText
                  required
                  name={FormFields.DishURL}
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
