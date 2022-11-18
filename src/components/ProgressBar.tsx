import styles from "src/styles/ProgressBar.module.css";

type LoadingBarProps = {
  progress: number;
};

export default function ProgressBar({ progress }: LoadingBarProps) {
  const percentage = progress > 100 ? 100 : progress < 0 ? 0 : progress * 100;

  return (
    <div className="h-1 w-full rounded-sm bg-white/20">
      <div
        className={`${styles.stripes} h-full rounded-full transition-all duration-300 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
