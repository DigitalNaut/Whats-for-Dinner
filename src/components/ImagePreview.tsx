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
    <img
      src={file ? URL.createObjectURL(file) : "https://via.placeholder.com/128"}
      alt="File preview"
      className={`w-[128px] h-[128px] object-cover object-center rounded-md ${
        file ? "cursor-pointer bg-black" : ""
      }`}
      title={fileName}
      width="128"
      height="128"
      onClick={onClick}
    />
  );
}
