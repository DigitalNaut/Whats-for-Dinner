type LoadingBarProps = {
  progress: number;
};

export default function ProgressBar({ progress }: LoadingBarProps) {
  const percentage = progress > 100 ? 100 : progress < 0 ? 0 : progress * 100;

  return (
    <div className="w-full h-1 bg-white/20 rounded-sm">
      <div
        className="h-full bg-white rounded-sm transition-all ease-out duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
