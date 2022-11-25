import type { ChangeEventHandler, InputHTMLAttributes } from "react";
import { createRef, useState } from "react";
import {
  faCloudUpload,
  faImage,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Spinner from "src/components/Spinner";

export type FileInfo = Partial<Pick<File, "name" | "size">> & {
  url?: string;
};
type InputFileProps = {
  name: string;
  label?: string;
  onChange?: (fileInfo: FileInfo) => void;
} & Pick<InputHTMLAttributes<HTMLInputElement>, "required">;

function resizeImage(
  file: File,
  { maxWidth, maxHeight }: { maxWidth: number; maxHeight: number }
) {
  return new Promise((resolve: (value: File) => void, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject("Could not obtain canvas context");
        } else {
          const ratio = Math.max(maxWidth / img.width, maxHeight / img.height);
          const width = img.width * ratio;
          const height = img.height * ratio;
          const xOffset = (maxWidth - width) / 2;
          const yOffset = (maxHeight - height) / 2;

          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            width > maxWidth ? xOffset : 0,
            height > maxHeight ? yOffset : 0,
            width,
            height
          );

          ctx.canvas.toBlob(
            (blob) => {
              if (blob) {
                const newFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(newFile);
              } else {
                reject("Could not obtain blob");
              }
            },
            "image/png",
            1
          );
        }
      };
      img.onerror = (error) => reject(error);
      img.src = event.target?.result as string;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export default function InputFile({
  name,
  label = "Seleccionar",
  onChange,
  ...props
}: InputFileProps) {
  const [file, setFile] = useState<File>();
  const [fileUrl, setFileUrl] = useState<string>();
  const [isResizing, setIsResizing] = useState(false);
  const labelRef = createRef<HTMLDivElement>();
  const inputRef = createRef<HTMLInputElement>();

  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const [file] = event.target.files || [];

    if (!file) return;

    setIsResizing(true);
    const resizedImage = await resizeImage(file, {
      maxWidth: 256,
      maxHeight: 256,
    });
    setIsResizing(false);

    setFile(resizedImage);

    if (fileUrl) URL.revokeObjectURL(fileUrl);

    const url = URL.createObjectURL(resizedImage);
    setFileUrl(url);

    onChange?.({ url, name: resizedImage?.name, size: resizedImage?.size });
  };

  const removeFileHandler = () => {
    setFile(undefined);
    setFileUrl(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <input
          data-filled
          className="peer pointer-events-none absolute inset-1/2 h-0 w-0 overflow-hidden opacity-0"
          style={{ padding: 0 }}
          id={name}
          name={name}
          ref={inputRef}
          type="file"
          onChange={onChangeHandler}
          accept="image/png, image/jpeg, image/webp"
          {...props}
        />
        <div
          id={name + "-label"}
          ref={labelRef}
          className="group relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border border-gray-400 bg-gray-700 hover:bg-gray-800 
            peer-invalid:ring-2 peer-invalid:ring-red-300 peer-invalid:ring-offset-2 peer-invalid:ring-offset-gray-700 
            peer-focus:ring-2 peer-focus:ring-white peer-focus:ring-offset-2 peer-focus:ring-offset-blue-600"
        >
          {fileUrl ? (
            <div className="group">
              <div className="absolute h-full w-full">
                <img
                  src={fileUrl}
                  alt={file?.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                className="absolute hidden h-full w-full flex-col items-center justify-center gap-2 bg-black/50 group-hover:flex"
                role="button"
                onClick={removeFileHandler}
              >
                <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                <span className="text-sm">Eliminar</span>
              </button>
            </div>
          ) : (
            <label
              htmlFor={name}
              className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2"
            >
              {isResizing ? (
                <>
                  <Spinner text="" />
                  <span className="text-sm">Procesando...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={faImage}
                    className="h-6 w-6 group-hover:hidden"
                  />
                  <FontAwesomeIcon
                    icon={faCloudUpload}
                    className="hidden h-6 w-6 group-hover:block"
                  />
                  <span className="text-sm">{label}</span>
                </>
              )}
            </label>
          )}
        </div>
        {file ? (
          <div className="flex max-w-[70%] items-center gap-4 overflow-hidden text-ellipsis p-2">
            <div className="flex min-w-0 max-w-full flex-col flex-nowrap gap-0.5">
              <span className="w-full truncate">{file.name}</span>
              <span className="text-xs">{file.size * 0.001} KB</span>
            </div>
            <button
              className="w-fit max-w-xs"
              data-filled
              aria-label="Eliminar"
              role="button"
              onClick={removeFileHandler}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ) : (
          <span id="hint" className="p-2">
            Ningún archivo seleccionado
          </span>
        )}
      </div>
    </>
  );
}
