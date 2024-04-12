import type { FormEventHandler, Reducer } from "react";
import { useState, useReducer, useRef } from "react";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useGoogleDriveAPI } from "src/hooks/useGoogleDriveAPI";
import { useGoogleDriveContext } from "src/contexts/GoogleDriveContext";
import { useHeader } from "src/contexts/HeaderContext";
import { useNavigate } from "react-router-dom";
import { useSpinnerMenuContext } from "src/contexts/SpinnerMenuContext";
import ImagePreview from "src/components/ImagePreview";
import InputFile from "src/components/InputFile";
import InputText from "src/components/InputText";
import Kilobytes from "src/components/common/Kilobytes";
import Spinner from "src/components/common/Spinner";
import Switcher, { SwitcherState } from "src/components/common/Switcher";
import type { FileInfo } from "src/components/InputFile";

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
  InvalidImageFile,
  Reset,
}
enum UploadMode {
  File,
  URL,
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
  invalidImageFile: "",
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

    case ErrorActionType.InvalidImageFile:
      return { ...prevState, invalidImageFile: action.payload };

    default:
      throw new Error("Invalid action type" + action.type);
  }
};

export default function AddItem() {
  const navigate = useNavigate();
  const { addMenuItem } = useSpinnerMenuContext();
  const { hasScope } = useGoogleDriveContext();
  const { uploadFile } = useGoogleDriveAPI();

  const [uploadMode, setUploadMode] = useState<UploadMode>(UploadMode.File);
  const [fileInfo, setFileInfo] = useState<FileInfo>();
  const uploadController = useRef<AbortController>();
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>();
  const [formState, formDispatch] = useReducer(stateReducer, initialFormState);
  const [errorState, errorDispatch] = useReducer(
    errorReducer,
    initialErrorState,
  );

  useHeader({
    backTo: "menu",
  });

  // const resetForm = (form: HTMLFormElement) => {
  //   formDispatch({ type: ActionType.Reset, payload: "" });
  //   form.reset();
  // };

  const uploadFileHandler = async (imageFileToUpload: File) => {
    setIsUploadingFile(true);

    if (!imageFileToUpload) {
      errorDispatch({
        type: ErrorActionType.InvalidImageFile,
        payload: "No se ha seleccionado ninguna imagen",
      });
      return null;
    }

    if (uploadController.current) uploadController.current.abort();
    uploadController.current = new AbortController();

    try {
      const { data } = await uploadFile(
        {
          file: imageFileToUpload,
          metadata: {
            name: imageFileToUpload.name,
            mimeType: imageFileToUpload.type,
          },
        },
        {
          signal: uploadController.current.signal,
          onUploadProgress: ({ progress }) => setUploadProgress(progress),
        },
      );

      if (data === false)
        errorDispatch({
          type: ErrorActionType.InvalidImageFile,
          payload: "No se ha podido subir la imagen",
        });
      else if (data.error) {
        errorDispatch({
          type: ErrorActionType.InvalidImageFile,
          payload: `Error ${data.error.code || "unknown"}: ${data.error.message}`,
        });
      } else return data.id;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "CanceledError") return Promise.reject(error);
        errorDispatch({
          type: ErrorActionType.InvalidImageFile,
          payload: error.message,
        });
      } else {
        errorDispatch({
          type: ErrorActionType.InvalidImageFile,
          payload: "Error desconocido",
        });
        console.error(error);
      }
    }
    setIsUploadingFile(false);
    return Promise.resolve(null);
  };

  const validateForm = (formData: FormData) => {
    if (errorState.invalidImageURL !== "") {
      errorDispatch({
        type: ErrorActionType.FormError,
        payload: errorState.invalidImageURL,
      });
      return null;
    }

    const dishName = formData.get(FormFields.DishName)?.toString().trim();
    const dishURL = formData.get(FormFields.DishURL)?.toString().trim();
    const dishImage: File | null = formData.get(FormFields.DishImage) as File;

    if (!dishName) {
      errorDispatch({
        type: ErrorActionType.FormError,
        payload: "El nombre del plato no puede estar vacío",
      });
      return null;
    }

    if (uploadMode === UploadMode.URL && !dishURL) {
      errorDispatch({
        type: ErrorActionType.FormError,
        payload: "Debes escribir una URL",
      });
      return null;
    }

    if (uploadMode === UploadMode.File && !dishImage) {
      errorDispatch({
        type: ErrorActionType.FormError,
        payload: "Debes seleccionar una imagen",
      });
      return null;
    }

    return {
      dishName,
      dishURL,
      dishImage,
    };
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    if (fileInfo?.file) formData.append(FormFields.DishImage, fileInfo.file);
    const validation = validateForm(formData);

    if (!validation) return;

    const { dishName, dishURL, dishImage } = validation;

    if (uploadMode === UploadMode.URL && dishURL) {
      addMenuItem({
        label: dishName,
        imageUrl: dishURL,
        enabled: true,
        key: Date.now(),
      });
      navigate("/menu");
    }
    if (uploadMode === UploadMode.File && dishImage) {
      const imageId = await uploadFileHandler(dishImage);

      if (!imageId) {
        errorDispatch({
          type: ErrorActionType.FormError,
          payload: "No se ha podido subir la imagen",
        });
        return;
      }

      addMenuItem({
        label: dishName,
        fileId: imageId,
        imageUrl: URL.createObjectURL(dishImage),
        enabled: true,
        key: Date.now(),
      });
      navigate("/menu");
    } else
      errorDispatch({
        type: ErrorActionType.FormError,
        payload: "Por favor llena todos los campos: Nombre del platillo y URL",
      });
  };

  if (!hasScope)
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h1 className="text-center text-2xl font-bold">
          No tienes permisos para subir imágenes
        </h1>
        <p className="text-center">
          Necesitas iniciar sesión con Google para subir imágenes
        </p>
      </div>
    );

  if (isUploadingFile)
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-slate-200 p-6 text-slate-600">
          <h2 className="w-full text-xl font-medium">Cargando archivo</h2>
          <div className="relative size-32 overflow-hidden rounded-full">
            {fileInfo && (
              <img
                src={fileInfo?.url}
                alt={fileInfo?.name}
                className="size-full object-cover"
              />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-white">
              <span className="text-2xl font-black">
                {uploadProgress
                  ? `${(uploadProgress * 100).toFixed(1)}%`
                  : "..."}
              </span>
              <span className="text-xs">
                <Spinner />
              </span>
            </div>
          </div>
          {fileInfo && (
            <div className="flex min-w-0 max-w-md flex-col flex-nowrap gap-0.5 overflow-hidden text-center">
              <span className="w-full truncate">{fileInfo.name}</span>
              {fileInfo.size ? (
                <Kilobytes className="text-xs" value={fileInfo.size} />
              ) : (
                <span>Tamaño desconocido</span>
              )}
            </div>
          )}
          <div className="flex w-full justify-end">
            <button
              className="text-blue-700 hover:text-blue-800"
              onClick={() => {
                uploadController.current?.abort();
                setIsUploadingFile(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-center text-2xl">Añadir platillo</h2>
      <p>Introduce los datos del platillo:</p>
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
          initialState={SwitcherState.FirstOption}
          onChange={(state) => {
            errorDispatch({ type: ErrorActionType.Reset, payload: "" });

            switch (state) {
              case SwitcherState.FirstOption:
                setUploadMode(UploadMode.File);
                return UploadMode.File;
              case SwitcherState.SecondOption:
                setUploadMode(UploadMode.URL);
                fileInfo?.url && URL.revokeObjectURL(fileInfo.url);
                setFileInfo(undefined);
                return UploadMode.URL;
              default:
                throw new Error("Invalid upload mode");
            }
          }}
          labels={["Subir imagen", "Asociar URL"]}
          renders={{
            firstOption: (
              <InputFile
                required
                name={FormFields.DishImage}
                onChange={(info) => {
                  setFileInfo(info);
                }}
              />
            ),
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
