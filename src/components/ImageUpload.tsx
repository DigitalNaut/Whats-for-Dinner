import { useEffect, useRef, useState } from "react";
import { faCloudArrowUp, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useGoogleDrive } from "src/hooks/GoogleDriveContext";
import Spinner from "src/components/Spinner";

export default function ImageUpload({ onUpload }: { onUpload(): void }) {
  const { uploadFile, hasScope } = useGoogleDrive();

  const [imageFileToUpload, setImageFileToUpload] = useState<File>();
  const [isUploadingFile, setIsUpLoadingFile] = useState<
    "Authorizing" | boolean
  >(false);
  const [error, setError] = useState<string>();
  const abortController = useRef(new AbortController());

  const handleImageInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const [file] = event.target.files || [];

    if (file) setImageFileToUpload(file);
  };

  const uploadFileHandler = async (signal?: AbortSignal) => {
    setError(undefined);
    setIsUpLoadingFile(true);
    abortController.current = new AbortController();

    if (!imageFileToUpload) return setError("No file selected");

    try {
      const { data } = await uploadFile(
        {
          file: imageFileToUpload,
          metadata: {
            name: imageFileToUpload.name,
            mimeType: imageFileToUpload.type,
          },
        },
        signal
      );

      if (data === false) setError("File upload failed");
      else if (data.error) {
        setError(
          `Error ${data.error.code || "unknown"}: ${data.error.message}`
        );
      } else onUpload();

      setImageFileToUpload(undefined);
    } catch (error) {
      if (error === "Authorizing") {
        setIsUpLoadingFile("Authorizing");
        return;
      }

      if (error instanceof Error) {
        if (error.name === "CanceledError") return;
        setError(error.message);
      } else {
        setError("An unknown error ocurred");
        console.error(error);
      }
    }
    setIsUpLoadingFile(false);
  };

  useEffect(() => {
    if (isUploadingFile !== "Authorizing") return;
    if (hasScope) uploadFileHandler();
  }, [isUploadingFile, hasScope]);

  return (
    <div className="flex flex-col gap-2 w-full overflow-hidden">
      {error && (
        <div className="p-2 rounded-sm w-full bg-red-500 text-white">
          {error}
        </div>
      )}
      <input
        type="file"
        onChange={handleImageInputChange}
        accept="image/png, image/jpeg, image/webp"
        className="text-ellipsis w-full"
      />
      {imageFileToUpload && (
        <>
          <img
            src={
              imageFileToUpload
                ? URL.createObjectURL(imageFileToUpload)
                : "https://via.placeholder.com/128"
            }
            className="w-[128px] h-[128px] rounded-md object-cover object-center"
          />
          {isUploadingFile.toString()}
          <div className="flex gap-1">
            <button
              data-filled
              onClick={async () =>
                await uploadFileHandler(abortController.current.signal)
              }
              disabled={Boolean(isUploadingFile)}
              className="flex gap-2 items-center"
            >
              {isUploadingFile ? (
                <Spinner
                  text={
                    isUploadingFile === "Authorizing"
                      ? "Autorizando..."
                      : "Cargando..."
                  }
                />
              ) : (
                <>
                  <FontAwesomeIcon icon={faCloudArrowUp} />
                  <span>Cargar</span>
                </>
              )}
            </button>
            <button
              data-filled
              onClick={() => {
                abortController.current.abort();
                setIsUpLoadingFile(false);
              }}
              disabled={!isUploadingFile}
              className={isUploadingFile ? "" : "hidden"}
              title="Cancelar"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
