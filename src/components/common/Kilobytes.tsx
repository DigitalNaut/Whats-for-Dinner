type KilobytesProps = {
  value?: number;
  className?: string;
};

function formatBytes(value?: string | number, decimals = 2) {
  const bytes = Number(value);

  if (!Number(bytes)) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

export default function Kilobytes({ value, className }: KilobytesProps) {
  return <span className={className}>{formatBytes(value)}</span>;
}
