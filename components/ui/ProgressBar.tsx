import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  tone?: "red" | "success" | "yellow" | "ink";
  size?: "sm" | "md";
  className?: string;
  label?: string;
};

const toneClass = {
  red: "bg-umu-red",
  success: "bg-success",
  yellow: "bg-umu-yellow",
  ink: "bg-ink",
};

export function ProgressBar({
  value,
  tone = "red",
  size = "md",
  className,
  label,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted">
          <span>{label}</span>
          <span className="tabular-nums">{Math.round(clamped)}%</span>
        </div>
      ) : null}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-surface-2",
          size === "sm" ? "h-1.5" : "h-2",
        )}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            toneClass[tone],
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
