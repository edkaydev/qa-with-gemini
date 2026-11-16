import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "red" | "yellow" | "success" | "info" | "dark";

const tones: Record<Tone, string> = {
  neutral: "border-line bg-surface-1 text-muted",
  red: "border-umu-red/20 bg-umu-red-soft text-umu-red",
  yellow: "border-umu-yellow/40 bg-umu-yellow-soft text-[#7A5A00]",
  success: "border-success-line bg-success-soft text-success",
  info: "border-info-line bg-info-soft text-info",
  dark: "border-ink/10 bg-ink text-white",
};

export function StatusPill({
  children,
  tone = "neutral",
  className,
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
