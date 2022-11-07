import { useEffect, useState } from "react";
import {
  faCloudArrowUp,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useGoogleDrive } from "src/hooks/GoogleDriveContext";
import Spinner from "src/components/Spinner";

export default function ImageUpload({ onUpload }: { onUpload(): void }) {
  const { uploadFile, hasScope } = useGoogleDrive();

  const [imageFileToUpload, setImageFileToUpload] = useState<File>();
  const [isUploadingFile, setIsUpLoadingFile] = useState(false);
  const [error, setError] = useState<string>();

  const handleImageInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const [file] = event.target.files || [];

    if (file) setImageFileToUpload(file);
  };

  const uploadFileHandler = async (signal?: AbortSignal) => {
    setError(undefined);
    setIsUpLoadingFile(true);

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
      setIsUpLoadingFile(false);
    } catch (error) {
      if (error === "Authorizing") return;

      if (error instanceof Error) {
        if (error.name === "AbortError") return;
        setError(error.message);
      } else if (typeof error === "string") setError(error);
      else {
        setError("An unknown error ocurred");
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (!hasScope) return;

    const controller = new AbortController();
    const signal = controller.signal;
    if (isUploadingFile) uploadFileHandler(signal);
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
          <button
            data-filled
            onClick={() => uploadFileHandler()}
            disabled={isUploadingFile}
            className="flex gap-2 items-center"
          >
            {isUploadingFile ? (
              <Spinner text="Cargando..." />
            ) : hasScope ? (
              <>
                <FontAwesomeIcon icon={faCloudArrowUp} />
                <span>Cargar</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faShieldHalved} />
                <span>Otorgar permiso y cargar</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
