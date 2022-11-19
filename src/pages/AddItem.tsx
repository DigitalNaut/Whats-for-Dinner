import type { FormEventHandler, Reducer } from "react";
import { useReducer } from "react";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ImagePreview from "src/components/ImagePreview";
import InputFile from "src/components/InputFile";
import InputText from "src/components/InputText";
import Switcher from "src/components/Switcher";
import { useSpinnerMenuContext } from "src/hooks/SpinnerMenuContext";
import { useNavigate } from "react-router-dom";
import { useHeader } from "src/hooks/NavigationContext";

enum FormFields {
  DishName = "dishName",
  DishURL = "dishURL",
  DishImage = "dishImage",
}
enum StateActionType {
  SetName,
  SetURL,
  Reset,
}
enum ErrorActionType {
  FormError,
  InvalidImageURL,
  Reset,
}

type Action<ActionType> = {
  type: ActionType;
  payload: string;
};

const initialFormState = {
  imageName: "",
  imageUrl: "",
};
const stateReducer: Reducer<
  typeof initialFormState,
  Action<StateActionType>
> = (prevState, action) => {
  switch (action.type) {
    case StateActionType.Reset:
      return initialFormState;

    case StateActionType.SetName:
      return { ...prevState, imageName: action.payload };

    case StateActionType.SetURL:
      return { ...prevState, imageUrl: action.payload };

    default:
      throw new Error("Invalid action type" + action.type);
  }
};

const initialErrorState = {
  formError: "",
  invalidImageURL: "",
};
const errorReducer: Reducer<
  typeof initialErrorState,
  Action<ErrorActionType>
> = (prevState, action) => {
  switch (action.type) {
    case ErrorActionType.Reset:
      return initialErrorState;

    case ErrorActionType.FormError:
      return { ...prevState, formError: action.payload };

    case ErrorActionType.InvalidImageURL:
      return { ...prevState, invalidImageURL: action.payload };

    default:
      throw new Error("Invalid action type" + action.type);
  }
};

export default function AddItem() {
  const navigate = useNavigate();
  const { addMenuItem } = useSpinnerMenuContext();

  const [formState, formDispatch] = useReducer(stateReducer, initialFormState);
  const [errorState, errorDispatch] = useReducer(
    errorReducer,
    initialErrorState
  );

  useHeader({
    title: "Crear",
  });

  // const resetForm = (form: HTMLFormElement) => {
  //   formDispatch({ type: ActionType.Reset, payload: "" });
  //   form.reset();
  // };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const label = formData.get(FormFields.DishName)?.toString().trim();
    const imageUrl = formData.get(FormFields.DishURL)?.toString().trim();

    if (errorState.invalidImageURL !== "") {
      errorDispatch({
        type: ErrorActionType.FormError,
        payload: errorState.invalidImageURL,
      });
      return;
    }

    if (label && imageUrl) {
      addMenuItem({
        label,
        imageUrl,
        enabled: true,
      });
      navigate("/menu");
    } else
      errorDispatch({
        type: ErrorActionType.FormError,
        payload: "Por favor llena todos los campos: Nombre del platillo y URL",
      });
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-center text-2xl">Nuevo platillo</h2>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {errorState.formError && (
          <div className="flex w-full items-center gap-1 rounded-sm bg-amber-600 p-2 text-white">
            <FontAwesomeIcon icon={faWarning} />
            {errorState.formError}
          </div>
        )}
        <InputText
          required
          name={FormFields.DishName}
          label="Nombre del platillo"
          value={formState.imageName}
          onChange={({ target: { value: payload } }) => {
            formDispatch({
              type: StateActionType.SetName,
              payload,
            });
          }}
          onClear={() => {
            formDispatch({
              type: StateActionType.SetName,
              payload: "",
            });
          }}
        />

        <Switcher
          initialState={true}
          onChange={() =>
            errorDispatch({ type: ErrorActionType.Reset, payload: "" })
          }
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
                  error={errorState.invalidImageURL}
                  onChange={({ target: { value: payload } }) => {
                    formDispatch({
                      type: StateActionType.SetURL,
                      payload,
                    });
                  }}
                  onClear={() => {
                    formDispatch({
                      type: StateActionType.SetURL,
                      payload: "",
                    });
                  }}
                />
                <ImagePreview
                  src={formState.imageUrl}
                  onLoad={() => {
                    errorDispatch({
                      type: ErrorActionType.InvalidImageURL,
                      payload: "",
                    });
                  }}
                  onError={() =>
                    errorDispatch({
                      type: ErrorActionType.InvalidImageURL,
                      payload: "URL de imagen no válida",
                    })
                  }
                />
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
