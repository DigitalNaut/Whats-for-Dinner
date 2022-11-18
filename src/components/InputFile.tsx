import type { ChangeEventHandler, InputHTMLAttributes } from "react";
import { useState } from "react";
import {
  faCloudUpload,
  faImage,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type InputFileProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "required" | "name"
>;

function InputFile({ name, ...props }: InputFileProps) {
  const [file, setFile] = useState<File>();
  const [fileUrl, setFileUrl] = useState<string>();

  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
    const [file] = event.target.files || [];
    setFile(file);

    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(URL.createObjectURL(file));
  };

  const removeFileHandler = () => {
    setFile(undefined);
    setFileUrl(undefined);
  };

  return (
    <div>
      <div className="flex flex-col items-center gap-2">
        <div className="group relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border border-gray-400 bg-gray-700 hover:bg-gray-800">
          {fileUrl ? (
            <div className="group">
              <div className="absolute h-full w-full">
                <img
                  src={file ? fileUrl : ""}
                  alt={file?.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                role="button"
                className="absolute hidden h-full w-full flex-col items-center justify-center gap-2 bg-black/50 group-hover:flex"
                onClick={removeFileHandler}
              >
                <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                <span className="text-sm">Remover</span>
              </button>
            </div>
          ) : (
            <label
              htmlFor={name + "-id"}
              className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2"
            >
              <FontAwesomeIcon
                icon={faImage}
                className="h-6 w-6 group-hover:hidden"
              />
              <FontAwesomeIcon
                icon={faCloudUpload}
                className="hidden h-6 w-6 group-hover:block"
              />
              <span className="text-sm">Seleccionar</span>
            </label>
          )}
        </div>
        {file ? (
          <div className="flex max-w-[70%] items-center gap-4 overflow-hidden text-ellipsis p-2">
            <div className="flex min-w-0 max-w-full flex-col flex-nowrap gap-0.5">
              <span className="w-full truncate">{file.name}</span>
              <span className="text-xs">{file.size * 0.001} kb</span>
            </div>
            <button
              data-filled
              role="button"
              className="w-fit max-w-xs"
              onClick={removeFileHandler}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ) : (
          <span className="p-2">Ningún archivo seleccionado</span>
        )}
      </div>
      <input
        hidden
        data-filled
        id={name + "-id"}
        name={name}
        type="file"
        onChange={onChangeHandler}
        accept="image/png, image/jpeg, image/webp"
        {...props}
      />
    </div>
  );
}

export default InputFile;
