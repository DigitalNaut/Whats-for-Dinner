import { useEffect, useState } from "react";
import { faDownload, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useGoogleDrive } from "src/hooks/GoogleDriveContext";
import Spinner from "src/components/Spinner";
import ImagePreview from "src/components/ImagePreview";
import AwaitingPermissionsNotice from "src/components/AwaitingPermissionsNotice";

export default function ImageList() {
  const { fetchFiles, fetchFile, userTokens } = useGoogleDrive();
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
      <div className="flex flex-col gap-2">
        {driveFiles &&
          driveFiles.map((file) =>
            file.id ? (
              <div key={file.id} className="w-fit flex gap-2">
                <div
                  title={`MIME Type: "${file.mimeType}"\nFile size: ${
                    file.size
                      ? (Number(file.size) * 0.001).toFixed(2) + " bytes"
                      : "Unknown"
                  }`}
                  className="flex gap-2 items-center"
                >
                  {file.iconLink && (
                    <img
                      src={file.iconLink}
                      className="w-[20px] h-[20px]"
                      alt="File icon"
                    />
                  )}
                  {file.name}
                </div>
                {file.id && (
                  <button
                    onClick={() => getFile(file)}
                    className="flex gap-2"
                    title="Get file"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                  </button>
                )}
              </div>
            ) : (
              <div>
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
}
