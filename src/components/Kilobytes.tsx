type KilobytesProps = {
  value?: number;
  className?: string;
};

export default function Kilobytes({ value, className }: KilobytesProps) {
  return (
    <span className={className}>
      {value ? (value * 0.001).toFixed(2) : "?"}&nbsp;KB
    </span>
  );
}
