import { faWarning } from "@fortawesome/free-solid-svg-icons";
import {
  type FormEventHandler,
  type Reducer,
  useReducer,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ImagePreview from "src/components/ImagePreview";
import InputFile, { type FileInfo } from "src/components/InputFile";
import InputText from "src/components/InputText";
import Kilobytes from "src/components/common/Kilobytes";
import Spinner from "src/components/common/Spinner";
import Switcher from "src/components/common/Switcher";
import ThemedButton from "src/components/common/ThemedButton";
import { useGoogleDriveAPI } from "src/hooks/useGoogleDriveAPI";
import { useGoogleDriveContext } from "src/hooks/useGoogleDriveContext";
import { useLanguageContext } from "src/hooks/useLanguageContext";
import { useSpinnerMenu } from "src/hooks/useSpinnerMenu";

type StateActionType = "setName" | "setURL" | "reset";

type ErrorActionType =
  | "formError"
  | "invalidImageURL"
  | "invalidImageFile"
  | "reset";

type UploadMode = "File" | "URL";

type Action<ActionType> = {
  type: ActionType;
  payload: string;
};

const inputFields = {
  DISH_NAME: "dishName",
  DISH_URL: "imageUrl",
  DISH_IMAGE: "imageImage",
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
    case "reset":
      return initialFormState;

    case "setName":
      return { ...prevState, imageName: action.payload };

    case "setURL":
      return { ...prevState, imageUrl: action.payload };

    default:
      throw new Error(`Invalid action type: ${JSON.stringify(action.type)}`);
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
    case "reset":
      return initialErrorState;

    case "formError":
      return { ...prevState, formError: action.payload };

    case "invalidImageURL":
      return { ...prevState, invalidImageURL: action.payload };

    case "invalidImageFile":
      return { ...prevState, invalidImageFile: action.payload };

    default:
      throw new Error(`Invalid action type: ${JSON.stringify(action.type)}`);
  }
};

function getStringField(formData: FormData, key: string): string | null {
  const val = formData.get(key);
  return typeof val === "string" && val.length > 0 ? val : null;
}

function getFileField(formData: FormData, key: string): File | null {
  const val = formData.get(key);
  return val instanceof File && val.size > 0 ? val : null;
}

export default function AddItem() {
  const { t } = useLanguageContext();
  const navigate = useNavigate();
  const { addMenuItem } = useSpinnerMenu();
  const { hasScope } = useGoogleDriveContext();
  const { uploadFile } = useGoogleDriveAPI();

  const [uploadMode, setUploadMode] = useState<UploadMode>("File");
  const [fileInfo, setFileInfo] = useState<FileInfo>();
  const uploadController = useRef<AbortController>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>();
  const [formState, formDispatch] = useReducer(stateReducer, initialFormState);
  const [errorState, errorDispatch] = useReducer(
    errorReducer,
    initialErrorState,
  );

  const uploadFileHandler = async (imageFileToUpload: File) => {
    setIsUploadingFile(true);

    if (!imageFileToUpload) {
      errorDispatch({
        type: "invalidImageFile",
        payload: t("No image file selected"),
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
          type: "invalidImageFile",
          payload: t("Image upload failed"),
        });
      else if (data.error) {
        errorDispatch({
          type: "invalidImageFile",
          payload: `Error ${data.error.code || "unknown"}: ${data.error.message}`,
        });
      } else return data.id;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "CanceledError") return Promise.reject(error);
        errorDispatch({
          type: "invalidImageFile",
          payload: error.message,
        });
      } else {
        errorDispatch({
          type: "invalidImageFile",
          payload: t("Unknown error"),
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
        type: "formError",
        payload: errorState.invalidImageURL,
      });
      return false;
    }

    const dishName = formData.get(inputFields.DISH_NAME);

    if (!dishName) {
      errorDispatch({
        type: "formError",
        payload: t("Dish name is required"),
      });
      return false;
    }

    const dishURL = formData.get(inputFields.DISH_URL);

    if (uploadMode === "URL" && !dishURL) {
      errorDispatch({
        type: "formError",
        payload: t("Enter valid URL"),
      });
      return false;
    }

    const dishImage: File | null = formData.get(inputFields.DISH_IMAGE) as File;

    if (uploadMode === "File" && !dishImage) {
      errorDispatch({
        type: "formError",
        payload: t("Must select an image"),
      });
      return false;
    }

    return true;
  };

  // TODO: Add error handling
  const handleSubmitForm: FormEventHandler<HTMLFormElement> = (event) =>
    void (async () => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      if (fileInfo?.file)
        formData.append(inputFields.DISH_IMAGE, fileInfo.file);

      if (!validateForm(formData)) return;

      const dishName = getStringField(formData, inputFields.DISH_NAME);
      const dishURL = getStringField(formData, inputFields.DISH_URL);
      const dishImage = getFileField(formData, inputFields.DISH_IMAGE);

      if (!dishName) return;

      if (uploadMode === "URL" && dishURL) {
        addMenuItem({
          label: dishName,
          imageUrl: dishURL,
          enabled: true,
          key: Date.now(),
        });
        await navigate(-1);
      }

      if (uploadMode === "File" && dishImage) {
        const imageId = await uploadFileHandler(dishImage);

        if (!imageId) {
          errorDispatch({
            type: "formError",
            payload: t("Image upload failed"),
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

        await navigate(-1);
      } else
        errorDispatch({
          type: "formError",
          payload: t("Please fill all fields"),
        });
    })();

  if (!hasScope)
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h1 className="text-center text-2xl font-bold">
          {t("Permission required to upload images")}
        </h1>
        <p className="text-center">
          {t("Please allow access to your Google Drive account")}
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
            <div className="flex max-w-md min-w-0 flex-col flex-nowrap gap-0.5 overflow-hidden text-center">
              <span className="w-full truncate">{fileInfo.name}</span>
              {fileInfo.size ? (
                <Kilobytes className="text-xs" value={fileInfo.size} />
              ) : (
                <span>{t("Unknown size")}</span>
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
              {t("Cancel")}
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-center text-2xl">{t("Add dish")}</h2>
      <p>{t("Add dish details")}</p>
      <form className="flex flex-col gap-6" onSubmit={handleSubmitForm}>
        {errorState.formError && (
          <div className="flex w-full items-center gap-1 rounded-sm bg-amber-600 p-2 text-white">
            <FontAwesomeIcon icon={faWarning} />
            {errorState.formError}
          </div>
        )}
        <InputText
          required
          name={inputFields.DISH_NAME}
          label={t("Dish name")}
          value={formState.imageName}
          onChange={({ target: { value: payload } }) => {
            formDispatch({
              type: "setName",
              payload,
            });
          }}
          onClear={() => {
            formDispatch({
              type: "setName",
              payload: "",
            });
          }}
        />

        <Switcher
          initialState={"firstOption"}
          onChange={(state) => {
            errorDispatch({ type: "reset", payload: "" });

            switch (state) {
              case "firstOption":
                setUploadMode("File");
                return "File";
              case "secondOption":
                setUploadMode("URL");
                if (fileInfo?.url) URL.revokeObjectURL(fileInfo.url);
                setFileInfo(undefined);
                return "URL";
              default:
                throw new Error("Invalid upload mode");
            }
          }}
          labels={[t("Upload image"), t("Use URL")]}
          renders={{
            firstOption: (
              <InputFile
                required
                name={inputFields.DISH_IMAGE}
                onChange={(info) => {
                  setFileInfo(info);
                }}
              />
            ),
            secondOption: (
              <>
                <InputText
                  required
                  name={inputFields.DISH_URL}
                  label={t("Image URL")}
                  value={formState.imageUrl}
                  error={errorState.invalidImageURL}
                  onChange={({ target: { value: payload } }) => {
                    formDispatch({
                      type: "setURL",
                      payload,
                    });
                  }}
                  onClear={() => {
                    formDispatch({
                      type: "setURL",
                      payload: "",
                    });
                  }}
                />
                <ImagePreview
                  src={formState.imageUrl}
                  onLoad={() => {
                    errorDispatch({
                      type: "invalidImageURL",
                      payload: "",
                    });
                  }}
                  onError={() =>
                    errorDispatch({
                      type: "invalidImageURL",
                      payload: t("Invalid image URL"),
                    })
                  }
                />
              </>
            ),
          }}
        />
        <ThemedButton className="w-full text-center" type="submit">
          {t("Add dish")}
        </ThemedButton>
      </form>
    </div>
  );
}
