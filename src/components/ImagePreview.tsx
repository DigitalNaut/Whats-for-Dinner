import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ImagePreviewProps = {
  fileName?: string;
  file?: File;
  onClick?: () => void;
};

export default function ImagePreview({
  file,
  fileName,
  onClick,
}: ImagePreviewProps) {
  return (
    <div className="group relative w-fit">
      <img
        src={
          file ? URL.createObjectURL(file) : "https://via.placeholder.com/128"
        }
        alt="File preview"
        className={`w-[128px] h-[128px] object-cover object-center rounded-md ${
          file ? "cursor-pointer bg-black" : ""
        }`}
        title={fileName}
        width="128"
        height="128"
        onClick={onClick}
      />
      {file && (
        <div className="absolute group-hover:bg-black/50 z-10 w-full h-full inset-0 pointer-events-none grid place-items-center">
          <span className="invisible group-hover:visible inset-x-full inset-y-0">
            <FontAwesomeIcon icon={faTimes} />
          </span>
        </div>
      )}
    </div>
  );
}
