import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";

import useGoogleDrive from "src/hooks/GoogleDrive";
import Spinner from "src/components/Spinner";

export default function Main() {
  const { uploadFile, fetchFiles, isLoaded } = useGoogleDrive();

  const [file, setFile] = useState<File>();
  const [error, setError] = useState<string>();
  const [driveFiles, setDriveFiles] = useState<gapi.client.drive.File[]>();

  const [loadingDriveFiles, setLoadingDriveFiles] = useState(true);
  const [uploadingFile, setUpLoadingFile] = useState(false);

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const [file] = event.target.files || [];

    if (file) setFile(file);
  };

  const uploadFileHandler = async () => {
    setError(undefined);
    setUpLoadingFile(true);

    if (!file) return setError("No file selected");

    try {
      uploadFile(
        {
          contentType: file.type,
          fileData: await file.text(),
          filename: file.name,
          metadata: {
            name: file.name,
            mimeType: "application/vnd.google-apps.file",
            parents: ["root"],
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
            {file && (
              <>
                <img
                  src={
                    file
                      ? URL.createObjectURL(file)
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
                      <FontAwesomeIcon icon={faCloudArrowUp} /> Upload
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-xl mb-4">Files saved</h2>
          {driveFiles ? (
            driveFiles.map((file) => <div key={file.id}>{file.name}</div>)
          ) : (
            <div>No files found</div>
          )}
          <button data-filled onClick={listFiles} disabled={loadingDriveFiles}>
            {loadingDriveFiles ? <Spinner /> : "Refresh list"}
          </button>
        </div>
      </div>
    </>
  );
}
