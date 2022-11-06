import { useState } from "react";
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useGoogleDrive } from "src/hooks/GoogleDriveContext";
import Spinner from "src/components/Spinner";

export default function ImageUpload({ onUpload }: { onUpload(): void }) {
  const { uploadFile } = useGoogleDrive();

  const [imageFileToUpload, setImageFileToUpload] = useState<File>();
  const [uploadingFile, setUpLoadingFile] = useState(false);
  const [error, setError] = useState<string>();

  const handleImageInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const [file] = event.target.files || [];

    if (file) setImageFileToUpload(file);
  };

  const uploadFileHandler = async () => {
    setError(undefined);
    setUpLoadingFile(true);

    if (!imageFileToUpload) return setError("No file selected");

    try {
      const { data } = await uploadFile({
        file: imageFileToUpload,
        metadata: {
          name: imageFileToUpload.name,
          mimeType: imageFileToUpload.type,
        },
      });

      if (data === false) setError("File upload failed");
      else if (data.error) {
        setError(
          `Error ${data.error.code || "unknown"}: ${data.error.message}`
        );
      } else onUpload();

      setImageFileToUpload(undefined);
      setUpLoadingFile(false);
    } catch (error) {
      setUpLoadingFile(false);

      if (error instanceof Error) setError(error.message);
      else if (typeof error === "string") setError(error);
      else {
        setError("An unknown error ocurred");
        console.error(error);
      }
    }
  };

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
            onClick={uploadFileHandler}
            disabled={uploadingFile}
            className="flex gap-2 items-center"
          >
            {uploadingFile ? (
              <Spinner text="Uploading..." />
            ) : (
              <>
                <FontAwesomeIcon icon={faCloudArrowUp} />
                <span>Upload</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
