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
  // const [driveFile, setDriveFile] = useState<gapi.client.drive.File>();

  const [loadingDriveFiles, setLoadingDriveFiles] = useState(true);
  const [uploadingFile, setUpLoadingFile] = useState(false);

  const handleInputChange = async (
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
      const fileData = await fileToUpload.text();

      uploadFile(
        {
          fileData,
          metadata: {
            name: fileToUpload.name,
            mimeType: fileToUpload.type,
            parents: ["appDataFolder"],
          },
        },
        (jsonResp) => {
          if (jsonResp === false) setError("File upload failed");
          else if (jsonResp.error) {
            setError(
              `Error ${jsonResp.error.code || "unknown"}: ${
                jsonResp.error.message
              }`
            );
          } else {
            console.log("File upload result:");
            console.log(jsonResp);

            listFiles();
          }

          setUpLoadingFile(false);
        }
      );
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

  async function getFile(fileId: string, mimeType: string) {
    try {
      await fetchFile(
        {
          fileId,
          mimeType,
        },
        (response) => {
          console.log(`File fetched: ${String(response).length}`);
          console.log(JSON.parse(response as string));
        }
      );
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

  if (!isLoaded) return <div>Loading...</div>;

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
              onChange={handleInputChange}
              accept="image/png, image/jpeg, image/webp"
            />
            {fileToUpload && (
              <>
                <img
                  src={
                    fileToUpload
                      ? URL.createObjectURL(fileToUpload)
                      : "https://via.placeholder.com/150"
                  }
                  className="w-[150px] h-[150px] rounded-md"
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
                        onClick={() =>
                          getFile(file.id || "", file.mimeType || "")
                        }
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
        </div>
      </div>
    </>
  );
}
