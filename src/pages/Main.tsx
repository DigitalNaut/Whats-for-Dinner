import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faDownload,
  faExternalLink,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import useGoogleDrive from "src/hooks/GoogleDrive";
import Spinner from "src/components/Spinner";

export default function Main() {
  const { uploadFile, fetchFiles, fetchFile, isLoaded } = useGoogleDrive();

  const [fileToUpload, setFileToUpload] = useState<File>();
  const [error, setError] = useState<string>();

  const [driveFiles, setDriveFiles] = useState<gapi.client.drive.File[]>();
  const [driveFileSelected, setDriveFileSelected] = useState<{
    fileInfo: gapi.client.drive.File;
    blob: File;
    data: string;
  }>();

  const [loadingDriveFiles, setLoadingDriveFiles] = useState(true);
  const [uploadingFile, setUpLoadingFile] = useState(false);

  const handleImageInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const [file] = event.target.files || [];

    if (file) setFileToUpload(file);
  };

  const uploadFileHandler = async () => {
    setError(undefined);
    setUpLoadingFile(true);

    if (!fileToUpload) return setError("No file selected");

    try {
      const { data } = await uploadFile({
        file: fileToUpload,
        metadata: {
          name: fileToUpload.name,
          mimeType: fileToUpload.type,
        },
      });

      if (data === false) setError("File upload failed");
      else if (data.error) {
        setError(
          `Error ${data.error.code || "unknown"}: ${data.error.message}`
        );
      } else listFiles();

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
      else if (data.error) {
        setError(
          `Error ${data.error.code || "unknown"}: ${data.error.message}`
        );
      }

      const newImageFile = new File([data], fileInfo.name || "Unknown image", {
        type: fileInfo.mimeType,
      });

      setDriveFileSelected({
        fileInfo,
        blob: newImageFile,
        data,
      });
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      else if (typeof error === "string") setError(error);
      else {
        setError("An unknown error ocurred");
        console.error(error);
      }
    }
  }

  useEffect(() => {
    if (!isLoaded) return;

    listFiles();
  }, [isLoaded]);

  if (!isLoaded)
    return (
      <div>
        <Spinner />
      </div>
    );

  return (
    <>
      {error && (
        <div className="p-2 rounded-sm w-full bg-red-500 text-white">
          {error}
        </div>
      )}
      <div className="flex p-6">
        <div className="flex-1">
          <h2 className="text-xl mb-4">File upload</h2>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              onChange={handleImageInputChange}
              accept="image/png, image/jpeg, image/webp"
            />
            {fileToUpload && (
              <>
                <img
                  src={
                    fileToUpload
                      ? URL.createObjectURL(fileToUpload)
                      : "https://via.placeholder.com/128"
                  }
                  className="w-[128px] h-[128px] rounded-md"
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
        </div>

        <div className="flex-1">
          <h2 className="text-xl mb-4">Files saved</h2>
          <div className="flex flex-col">
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
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex gap-2"
                      title="Open in Google Drive"
                    >
                      <FontAwesomeIcon icon={faExternalLink} />
                    </a>
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

          <img
            src={
              driveFileSelected
                ? URL.createObjectURL(driveFileSelected.blob)
                : "https://via.placeholder.com/128"
            }
            alt="File preview"
            className={`w-[128px] h-[128px] rounded-md ${
              driveFileSelected?.data ? "cursor-pointer bg-black" : ""
            }`}
            title={driveFileSelected?.fileInfo.name}
            width="128"
            height="128"
            onClick={() => setDriveFileSelected(undefined)}
          />

          <button data-filled onClick={listFiles} disabled={loadingDriveFiles}>
            {loadingDriveFiles ? <Spinner /> : "Refresh list"}
          </button>
        </div>
      </div>
    </>
  );
}
