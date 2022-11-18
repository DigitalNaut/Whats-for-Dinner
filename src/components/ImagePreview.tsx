import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

type ImagePreviewProps = {
  fileName?: string;
  src?: File | string;
  onClick?: () => void;
};

export default function ImagePreview({
  src,
  fileName,
  onClick,
}: ImagePreviewProps) {
  const [error, setError] = useState<string>();
  const isInteractive = src && onClick;
  const fileUrl =
    src instanceof File
      ? URL.createObjectURL(src)
      : typeof src === "string" && src
      ? src
      : "https://via.placeholder.com/128";

  return (
    <div className="group m-auto relative w-fit rounded-md overflow-hidden">
      <img
        src={fileUrl}
        alt="Prevista"
        className={`w-[128px] h-[128px] object-cover object-center rounded-md ${
          isInteractive ? "cursor-pointer bg-black" : ""
        }`}
        title={fileName}
        width="128"
        height="128"
        onClick={onClick}
        onLoad={() => setError(undefined)}
        onError={() => {
          setError("Imagen no válida");
        }}
      />
      {error && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center text-center justify-center bg-black/50">
          <span className="text-white">{error}</span>
        </div>
      )}
      {isInteractive && (
        <div className="absolute group-hover:bg-black/50 z-10 w-full h-full inset-0 pointer-events-none grid place-items-center">
          <span className="invisible group-hover:visible inset-x-full inset-y-0">
            <FontAwesomeIcon icon={faTimes} />
          </span>
        </div>
      )}
    </div>
  );
}
