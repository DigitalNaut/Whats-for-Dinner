import type { ChangeEventHandler, InputHTMLAttributes } from "react";
import { createRef, useState } from "react";
import {
  faCloudUpload,
  faImage,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Spinner from "src/components/common/Spinner";
import Kilobytes from "src/components/common/Kilobytes";
import { resizeImage } from "src/utils/imageResize";

export type FileInfo = Partial<Pick<File, "name" | "size">> & {
  url?: string;
  file?: File;
};
type InputFileProps = {
  name: string;
  label?: string;
  onChange?: (fileInfo: FileInfo) => void;
} & Pick<InputHTMLAttributes<HTMLInputElement>, "required">;

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
    event,
  ) => {
    const file = event.target.files?.item(0);

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
    onChange?.({
      url,
      name: resizedImage?.name,
      size: resizedImage?.size,
      file: resizedImage,
    });
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
          className="peer pointer-events-none absolute inset-1/2 size-0 overflow-hidden opacity-0"
          style={{ padding: 0 }}
          id={name}
          ref={inputRef}
          type="file"
          onChange={onChangeHandler}
          accept="image/png, image/jpeg, image/webp"
          {...props}
        />
        <div
          id={name + "-label"}
          ref={labelRef}
          className="group relative size-32 cursor-pointer overflow-hidden rounded-full border border-gray-400 bg-gray-700 hover:bg-gray-800 peer-invalid:ring-2 
            peer-invalid:ring-red-300 peer-invalid:ring-offset-2 peer-invalid:ring-offset-gray-700 peer-focus:ring-2 
            peer-focus:ring-white peer-focus:ring-offset-2 peer-focus:ring-offset-blue-600"
        >
          {fileUrl ? (
            <div className="group">
              <div className="absolute size-full">
                <img
                  src={fileUrl}
                  alt={file?.name}
                  className="size-full object-cover"
                />
              </div>
              <button
                className="absolute hidden size-full flex-col items-center justify-center gap-2 bg-black/50 group-hover:flex"
                role="button"
                onClick={removeFileHandler}
              >
                <FontAwesomeIcon icon={faTimes} className="size-6" />
                <span className="text-sm">Eliminar</span>
              </button>
            </div>
          ) : (
            <label
              htmlFor={name}
              className="flex size-full cursor-pointer flex-col items-center justify-center gap-2"
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
                    className="size-6 group-hover:hidden"
                  />
                  <FontAwesomeIcon
                    icon={faCloudUpload}
                    className="hidden size-6 group-hover:block"
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
              <Kilobytes className="text-xs" value={file.size} />
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
