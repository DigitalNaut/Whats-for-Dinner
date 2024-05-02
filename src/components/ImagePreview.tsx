import {
  type DetailedHTMLProps,
  type ImgHTMLAttributes,
  type ReactEventHandler,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";

import { useLanguageContext } from "src/contexts/LanguageContext";
import FontAwesomeIcon from "src/components/common/FontAwesomeIcon";

type ImagePreviewProps = {
  fileName?: string;
  showDownloadLink?: true;
} & Pick<
  DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
  "src" | "onClick" | "title" | "onError" | "onLoad"
>;

export default function ImagePreview({
  src,
  onError,
  onLoad,
  fileName,
  showDownloadLink,
  ...props
}: ImagePreviewProps) {
  const { t } = useLanguageContext();
  const [error, setError] = useState<string>();
  const isInteractive = src && props.onClick;
  const fileUrl = src ? src : "https://via.placeholder.com/128";

  const handleLoaded: ReactEventHandler<HTMLImageElement> = (event) => {
    setError("");
    onLoad?.(event);
  };

  const handleError: ReactEventHandler<HTMLImageElement> = (event) => {
    setError("No disponible");
    onError?.(event);
  };

  return (
    <div className="group relative m-auto w-fit overflow-hidden rounded-md">
      <img
        src={fileUrl}
        title={fileName}
        alt={t("Preview")}
        className={twMerge(
          "size-[128px] rounded-md object-cover object-center",
          isInteractive ? "cursor-pointer bg-black" : "",
        )}
        width="128"
        height="128"
        onLoad={handleLoaded}
        onError={handleError}
        {...props}
      />
      {error && (
        <div className="absolute left-0 top-0 flex size-full items-center justify-center bg-black/50 text-center">
          <span className="text-white">{error}</span>
        </div>
      )}
      {isInteractive && (
        <>
          <div className="pointer-events-none absolute inset-0 z-10 grid size-full place-items-center group-hover:bg-black/50">
            <span className="invisible inset-x-full inset-y-0 group-hover:visible">
              <FontAwesomeIcon className="fa-xmark" />
            </span>
          </div>
          {showDownloadLink && (
            <a
              href={fileUrl}
              className="absolute inset-x-0 bottom-0 z-10 rounded-bl-md bg-black/50 p-2"
              download
            >
              Download <FontAwesomeIcon className="fa-download" />
            </a>
          )}
        </>
      )}
    </div>
  );
}
