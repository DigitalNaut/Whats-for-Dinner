import type { ChangeEventHandler } from "react";
import { useState, useEffect } from "react";
import {
  faCloudUpload,
  faImage,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type InputFileProps = {
  name: string;
  label?: string;
  hint?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

function InputFile({ name }: InputFileProps) {
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

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  return (
    <div>
      <div className="flex flex-col gap-2 items-center">
        <div className="group relative w-32 h-32 rounded-full bg-gray-700 hover:bg-gray-800 border border-gray-400 cursor-pointer overflow-hidden">
          {fileUrl ? (
            <div className="group">
              <div className="absolute w-full h-full">
                <img
                  src={file ? fileUrl : ""}
                  alt={file?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                role="button"
                className="absolute flex-col gap-2 items-center justify-center w-full h-full hidden group-hover:flex bg-black/50"
                onClick={removeFileHandler}
              >
                <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                <span className="text-sm">Remover</span>
              </button>
            </div>
          ) : (
            <label
              htmlFor={name + "-id"}
              className="flex flex-col gap-2 items-center justify-center w-full h-full cursor-pointer"
            >
              <FontAwesomeIcon
                icon={faImage}
                className="w-6 h-6 group-hover:hidden"
              />
              <FontAwesomeIcon
                icon={faCloudUpload}
                className="w-6 h-6 hidden group-hover:block"
              />
              <span className="text-sm">Seleccionar</span>
            </label>
          )}
        </div>
        {file ? (
          <div className="flex gap-4 p-2 items-center max-w-[70%] overflow-hidden text-ellipsis">
            <div className="flex flex-col gap-0.5 max-w-full min-w-0 flex-nowrap">
              <span className="w-full truncate">{file.name}</span>
              <span className="text-xs">{file.size * 0.001} kb</span>
            </div>
            <button
              data-filled
              role="button"
              className="max-w-xs w-fit"
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
        data-filled
        id={name + "-id"}
        type="file"
        className="hidden"
        onChange={onChangeHandler}
        accept="image/png, image/jpeg, image/webp"
      />
    </div>
  );
}

export default InputFile;
