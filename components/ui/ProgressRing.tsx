import { cn } from "@/lib/utils";

type ProgressRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  tone?: "red" | "success" | "yellow";
  className?: string;
  children?: React.ReactNode;
  label?: string;
};

const strokeClass = {
  red: "stroke-umu-red",
  success: "stroke-success",
  yellow: "stroke-umu-yellow",
};

export function ProgressRing({
  value,
  size = 104,
  stroke = 8,
  tone = "red",
  className,
  children,
  label = "Progress",
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-surface-2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-700 ease-out", strokeClass[tone])}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
