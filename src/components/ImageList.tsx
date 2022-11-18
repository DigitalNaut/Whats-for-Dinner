import { useCallback, useEffect, useRef, useState } from "react";
import {
  faDownload,
  faSync,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useGoogleDrive } from "src/hooks/GoogleDriveContext";
import Spinner from "src/components/Spinner";
import ImagePreview from "src/components/ImagePreview";
import AwaitingPermissionsNotice from "src/components/AwaitingPermissionsNotice";
import ProgressBar from "src/components/ProgressBar";

type ImageListProps = {
  refreshDate: number;
};

type ListItemProps = {
  file: gapi.client.drive.File;
  downloadFile: (file: gapi.client.drive.File) => Promise<void>;
  removeFile: (file: gapi.client.drive.File) => Promise<boolean>;
};

function ListItem({ file, downloadFile, removeFile }: ListItemProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!file.id)
    return (
      <div className="flex gap-2 items-center">
        <FontAwesomeIcon icon={faTimes} />
        <i>File unavailable</i>
      </div>
    );

  return (
    <div
      key={file.id}
      className={`group w-full flex gap-2 hover:bg-white/20 rounded-sm items-center p-2 ${
        isDeleting ? "opacity-50 line-through grayscale" : ""
      }`}
    >
      {file.iconLink && (
        <img
          title={`MIME Type: "${file.mimeType}"`}
          src={file.iconLink}
          className={`w-[20px] h-[20px] ${isDeleting ? "grayscale" : ""}`}
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
            disabled={isDownloading || isDeleting}
            className="flex gap-2"
            title="Descargar"
            onClick={async () => {
              setIsDownloading(true);
              await downloadFile(file);
              setIsDownloading(false);
            }}
          >
            {isDownloading ? (
              <Spinner size="sm" />
            ) : (
              <FontAwesomeIcon icon={faDownload} />
            )}
          </button>
          <button
            disabled={isDownloading || isDeleting}
            className="flex gap-2"
            title="Borrar"
            onClick={async () => {
              setIsDeleting(true);
              const wasDeleted = await removeFile(file);
              await new Promise((resolve) => setTimeout(resolve, 500));
              setIsDeleting(!wasDeleted);
            }}
          >
            {isDeleting ? (
              <Spinner size="sm" />
            ) : (
              <FontAwesomeIcon icon={faTrash} />
            )}
          </button>
        </>
      )}
    </div>
  );
}

export default function ImageList({ refreshDate }: ImageListProps) {
  const { fetchList, fetchFile, deleteFile, hasScope } = useGoogleDrive();
  const [error, setError] = useState<string>();

  const [driveFiles, setDriveFiles] = useState<gapi.client.drive.File[]>();
  const [driveFilePreview, setDriveFilePreview] = useState<{
    fileInfo: gapi.client.drive.File;
    data: ArrayBuffer;
    file: File;
  }>();
  const [downloadProgress, setDownloadProgress] = useState<number>();
  const downloadController = useRef<AbortController>();

  const [loadingDriveFiles, setLoadingDriveFiles] = useState(true);

  const listFiles = useCallback(
    async function (signal?: AbortSignal) {
      setLoadingDriveFiles(true);

      try {
        const { data } = await fetchList({ signal });
        if (data.files?.length) setDriveFiles(data.files);
        else {
          setDriveFiles(undefined);
          if (data.error) setError(`${data.error.code}: ${data.error.message}`);
        }
      } catch (error) {
        if (error === "Authorizing") return;

        if (error instanceof Error) {
          if (error.name === "CanceledError") return;
          setError(`${error.name}: ${error.message}`);
        } else {
          setError("An unknown error ocurred");
          console.error(error);
        }
      }

      setLoadingDriveFiles(false);
    },
    [fetchList]
  );

  async function downloadFile(fileInfo: gapi.client.drive.File) {
    downloadController.current?.abort();
    downloadController.current = new AbortController();

    try {
      const { data } = await fetchFile(fileInfo, {
        signal: downloadController.current?.signal,
        onDownloadProgress: ({ progress }) => setDownloadProgress(progress),
      });
      setTimeout(() => setDownloadProgress(undefined), 250);

      if (data === false) setError("File download failed");
      else if (data instanceof ArrayBuffer)
        setDriveFilePreview({
          fileInfo,
          data,
          file: new File([data], fileInfo.name || "Unknown file", {
            type: fileInfo.mimeType || "application/octet-stream",
          }),
        });
      else if ("error" in data)
        setError(
          `Error ${data.error.code || "unknown"}: ${
            data.error.message || "No message"
          }`
        );
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "CanceledError") return;
        setError(`${error.name}: ${error.message}`);
      } else {
        setError("An unknown error ocurred");
        console.error(error);
      }
    }
  }

  async function removeFile(fileInfo: gapi.client.drive.File) {
    try {
      const { data } = await deleteFile(fileInfo);

      if (data === "") {
        listFiles();
        return true;
      }

      if (data.error)
        setError(
          `Error ${data.error.code || "unknown"}: ${
            data.error.message || "No message"
          }`
        );
    } catch (error) {
      if (error instanceof Error) setError(`${error.name}: ${error.message}`);
      else {
        setError("An unknown error ocurred");
        console.error(error);
      }
    }

    return false;
  }

  const cancelDownload = () => {
    downloadController.current?.abort();
    setDownloadProgress(undefined);
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    listFiles(signal);

    return () => controller.abort();
  }, [hasScope, listFiles, refreshDate]);

  if (!hasScope)
    return (
      <AwaitingPermissionsNotice>
        <button data-filled onClick={() => listFiles()}>
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
        {driveFiles?.map((file) => (
          <ListItem
            key={file.id}
            file={file}
            downloadFile={downloadFile}
            removeFile={removeFile}
          />
        ))}
        {!driveFiles && <i>No hay imágenes</i>}
      </div>
      <button
        data-filled
        onClick={() => listFiles()}
        disabled={loadingDriveFiles}
        title="Actualizar lista"
        className="w-fit"
      >
        {loadingDriveFiles ? (
          <Spinner size="sm" />
        ) : (
          <FontAwesomeIcon icon={faSync} />
        )}
      </button>

      <h3 className="text-lg">Imagen descargada</h3>
      {downloadProgress && (
        <>
          <ProgressBar progress={downloadProgress} />{" "}
          <button data-filled onClick={cancelDownload}>
            Cancelar
          </button>
        </>
      )}
      <ImagePreview
        src={driveFilePreview?.file}
        fileName={driveFilePreview?.fileInfo.name}
        onClick={() => setDriveFilePreview(undefined)}
      />
    </>
  );
}
