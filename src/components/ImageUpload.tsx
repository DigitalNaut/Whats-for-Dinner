import { useCallback, useEffect, useRef, useState } from "react";
import { faCloudArrowUp, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useGoogleDriveContext } from "src/contexts/GoogleDriveContext";
import Spinner from "src/components/common/Spinner";
import ProgressBar from "src/components/common/ProgressBar";
import { useGoogleDriveAPI } from "src/hooks/useGoogleDriveAPI";

export default function ImageUpload({ onUpload }: { onUpload(): void }) {
  const { hasScope } = useGoogleDriveContext();
  const { uploadFile } = useGoogleDriveAPI();

  const [imageFileToUpload, setImageFileToUpload] = useState<{
    file: File;
    url: string;
  }>();
  const [isUploadingFile, setIsUpLoadingFile] = useState<
    "Authorizing" | boolean
  >(false);
  const [uploadProgress, setUploadProgress] = useState<number>();
  const [error, setError] = useState<string>();
  const uploadController = useRef<AbortController>();

  const handleImageInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError(undefined);

    const [file] = event.target.files || [];

    if (!file) return;

    if (file.size > 1024 * 1024 * 5) {
      setError("El archivo no puede ser mayor a 5.0 MB");
      return;
    }

    if (
      !file.type.startsWith("image/") &&
      file.type === "application/json" &&
      file.name !== "config.json"
    ) {
      setError("El archivo debe ser una imagen");
      return;
    }

    setUploadProgress(undefined);

    imageFileToUpload?.url && URL.revokeObjectURL(imageFileToUpload.url);
    setImageFileToUpload({ file, url: URL.createObjectURL(file) });
  };

  const uploadFileHandler = useCallback(async () => {
    setError(undefined);
    setIsUpLoadingFile(true);

    if (!imageFileToUpload) return setError("No file selected");

    uploadController.current = new AbortController();

    try {
      const { data } = await uploadFile(
        {
          file: imageFileToUpload.file,
          metadata: {
            name: imageFileToUpload.file.name,
            mimeType: imageFileToUpload.file.type,
          },
        },
        {
          signal: uploadController.current.signal,
          onUploadProgress: ({ progress }) => setUploadProgress(progress),
        }
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
        return Promise.reject(error);
      }

      if (error instanceof Error) {
        if (error.name === "CanceledError") return Promise.reject(error);
        setError(error.message);
      } else {
        setError("An unknown error ocurred");
        console.error(error);
      }
    }
    setIsUpLoadingFile(false);
    return Promise.resolve();
  }, [imageFileToUpload, onUpload, uploadFile]);

  const cancelUploadHandler = () => {
    uploadController.current?.abort();
    setUploadProgress(undefined);
    setIsUpLoadingFile(false);
  };

  useEffect(() => {
    if (isUploadingFile !== "Authorizing") return;
    if (hasScope) uploadFileHandler();
  }, [isUploadingFile, hasScope, uploadFileHandler]);

  return (
    <div className="flex w-full flex-col gap-2 overflow-hidden">
      {error && (
        <div className="w-full rounded-sm bg-red-500 p-2 text-white">
          {error}
        </div>
      )}
      <input
        type="file"
        size={1_000_000}
        onChange={handleImageInputChange}
        accept="image/png, image/jpeg, image/webp, application/json"
        className="w-full text-ellipsis"
      />
      {imageFileToUpload && (
        <>
          <img
            src={imageFileToUpload.url || "https://via.placeholder.com/128"}
            className="size-[128px] rounded-md object-cover object-center"
          />
          {uploadProgress && <ProgressBar progress={uploadProgress} />}
          <div className="flex gap-1">
            <button
              data-filled
              onClick={uploadFileHandler}
              disabled={Boolean(isUploadingFile)}
              className="flex items-center gap-2"
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
              onClick={cancelUploadHandler}
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
