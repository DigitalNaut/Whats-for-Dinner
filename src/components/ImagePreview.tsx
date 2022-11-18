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
    <div className="group relative m-auto w-fit overflow-hidden rounded-md">
      <img
        src={fileUrl}
        alt="Prevista"
        className={`h-[128px] w-[128px] rounded-md object-cover object-center ${
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
        <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center bg-black/50 text-center">
          <span className="text-white">{error}</span>
        </div>
      )}
      {isInteractive && (
        <div className="pointer-events-none absolute inset-0 z-10 grid h-full w-full place-items-center group-hover:bg-black/50">
          <span className="invisible inset-x-full inset-y-0 group-hover:visible">
            <FontAwesomeIcon icon={faTimes} />
          </span>
        </div>
      )}
    </div>
  );
}
