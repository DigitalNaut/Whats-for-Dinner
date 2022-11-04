import { useEffect, useState } from "react";
import useGoogleDrive from "src/hooks/GoogleDrive";

export default function Main() {
  const { uploadFile, listFiles, isLoaded } = useGoogleDrive();
  const [file, setFile] = useState<File>();
  const [fileContent, setFileContent] = useState<string | ArrayBuffer | null>();
  const [error, setError] = useState<string>();
  const [driveFiles, setDriveFiles] = useState<gapi.client.drive.File[]>();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files || [];

    if (file) setFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target?.result);
    };
    reader.readAsText(file);

    setFileContent(reader.result);
  };

  const uploadFileHandler = async () => {
    setError(undefined);

    if (!file) return setError("No file selected");
    if (!fileContent) return setError("Failed to read file");

    uploadFile(
      {
        contentType: file.type,
        fileData: fileContent.toString(),
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
        }
      }
    );
  };

  useEffect(() => {
    if (!isLoaded) return;

    (async function fetchFiles() {
      try {
        const files = await listFiles();
        if (files?.length) setDriveFiles(files);
      } catch (error) {
        if (error instanceof Error) setError(error.message);
        else if (typeof error === "string") setError(error);
        else console.error(error);
      }
    })();
  }, [isLoaded]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="flex p-6">
      <div className="flex-1">
        <h2 className="text-xl">Upload a File</h2>
        <div className="flex flex-col gap-2">
          <input
            type="file"
            onChange={handleInputChange}
            accept="image/png, image/jpeg, image/webp"
          />
          <img
            src={
              file
                ? URL.createObjectURL(file)
                : "https://via.placeholder.com/150"
            }
            className="w-[150px] h-[150px]"
          />
          {error && (
            <div className="p-2 rounded-sm w-full bg-red-500 text-white">
              {error}
            </div>
          )}
          <button
            data-filled
            onClick={uploadFileHandler}
            disabled={file === undefined}
          >
            Upload
          </button>
        </div>
      </div>
      <div className="flex-1">
        <h2 className="text-xl">Files</h2>
        {driveFiles ? (
          driveFiles.map((file) => <div key={file.id}>{file.name}</div>)
        ) : (
          <div>No files</div>
        )}
      </div>
    </div>
  );
}
