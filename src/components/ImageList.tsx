import { forwardRef, useImperativeHandle } from "react";
import { useEffect, useState } from "react";
import {
  faDownload,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useGoogleDrive } from "src/hooks/GoogleDriveContext";
import Spinner from "src/components/Spinner";
import ImagePreview from "src/components/ImagePreview";
import AwaitingPermissionsNotice from "src/components/AwaitingPermissionsNotice";

export type ImageListActions = {
  listFiles(): void;
};

const ImageList = forwardRef<ImageListActions>(function List(_, ref) {
  const { fetchFiles, fetchFile, deleteFile, userTokens } = useGoogleDrive();
  const [error, setError] = useState<string>();

  const [driveFiles, setDriveFiles] = useState<gapi.client.drive.File[]>();
  const [driveFilePreview, setDriveFilePreview] = useState<{
    fileInfo: gapi.client.drive.File;
    data: ArrayBuffer;
    file: File;
  }>();

  const [loadingDriveFiles, setLoadingDriveFiles] = useState(true);

  async function listFiles() {
    setLoadingDriveFiles(true);

    try {
      const files = await fetchFiles();
      if (files?.length) setDriveFiles(files);
      else setDriveFiles(undefined);
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      else if (typeof error === "string") setError(error);
      else {
        setError("An unknown error ocurred");
        console.error(error);
      }
    }

    setLoadingDriveFiles(false);
  }

  async function getFile(fileInfo: gapi.client.drive.File) {
    try {
      const { data } = await fetchFile(fileInfo);

      if (data === false) setError("File download failed");
      else if (data instanceof ArrayBuffer)
        setDriveFilePreview({
          fileInfo,
          data,
          file: new File([data], fileInfo.name || "Unknown file", {
            type: fileInfo.mimeType || "application/octet-stream",
          }),
        });
      else if (data.error)
        setError(
          `Error ${data.error.code || "unknown"}: ${
            data.error.message || "No message"
          }`
        );
    } catch (error) {
      if (error instanceof Error)
        setError(`Error fetching image: ${error.message}`);
      else if (typeof error === "string")
        setError(`Error fetching image: ${error}`);
      else {
        setError("An unknown error ocurred");
        console.error(error);
      }
    }
  }

  async function removeFile(fileInfo: gapi.client.drive.File) {
    try {
      const { data } = await deleteFile(fileInfo);

      console.log("File delete:");
      console.log(data);

      if (data === "") listFiles();
      else if (data.error)
        setError(
          `Error ${data.error.code || "unknown"}: ${
            data.error.message || "No message"
          }`
        );
    } catch (error) {
      if (error instanceof Error)
        setError(`Error fetching image: ${error.message}`);
      else if (typeof error === "string")
        setError(`Error fetching image: ${error}`);
      else {
        setError("An unknown error ocurred");
        console.error(error);
      }
    }
  }

  useImperativeHandle(ref, () => ({
    listFiles,
  }));

  useEffect(() => {
    listFiles();
  }, [userTokens]);

  if (!userTokens)
    return (
      <AwaitingPermissionsNotice>
        <button data-filled onClick={listFiles}>
          Reintentar
        </button>
      </AwaitingPermissionsNotice>
    );

  return (
    <>
      {error && (
        <div className="p-2 rounded-sm w-full bg-red-500 text-white">
          {error}
        </div>
      )}
      <div className="flex flex-col">
        {driveFiles &&
          driveFiles.map((file) =>
            file.id ? (
              <div
                key={file.id}
                className="group w-full flex gap-2 hover:bg-white/20 rounded-sm items-center p-2"
              >
                {file.iconLink && (
                  <img
                    title={`MIME Type: "${file.mimeType}"`}
                    src={file.iconLink}
                    className="w-[20px] h-[20px]"
                    alt="File icon"
                  />
                )}
                <span
                  title={file.name}
                  className="flex-1 text-ellipsis overflow-hidden whitespace-nowrap"
                >
                  {file.name?.split(".")[0]}
                </span>
                <span>
                  {file.size ? (Number(file.size) * 0.001).toFixed(2) : "?"}
                  &nbsp;kb
                </span>
                {file.id && (
                  <>
                    <button
                      className="flex gap-2"
                      title="Descargar"
                      onClick={() => getFile(file)}
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                    <button
                      className="flex gap-2"
                      title="Borrar"
                      onClick={() => removeFile(file)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <FontAwesomeIcon icon={faTimes} />
                <em>File unavailable</em>
              </div>
            )
          )}

        {!driveFiles && <div>No files found</div>}
      </div>
      <button data-filled onClick={listFiles} disabled={loadingDriveFiles}>
        {loadingDriveFiles ? <Spinner /> : "Refresh list"}
      </button>

      <h3 className="text-lg">Image preview</h3>
      <ImagePreview
        file={driveFilePreview?.file}
        fileName={driveFilePreview?.fileInfo.name}
        onClick={() => setDriveFilePreview(undefined)}
      />
    </>
  );
});

export default ImageList;
