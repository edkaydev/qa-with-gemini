import {
  Braces,
  Brain,
  Cpu,
  Database,
  Languages,
  Satellite,
  type LucideIcon,
} from "lucide-react";
import type { CourseIconName } from "@/lib/courses";
import { cn } from "@/lib/utils";

const icons: Record<CourseIconName, LucideIcon> = {
  cpu: Cpu,
  database: Database,
  braces: Braces,
  languages: Languages,
  satellite: Satellite,
  brain: Brain,
};

export function CourseIcon({
  icon,
  tint,
  ink,
  size = "md",
  className,
}: {
  icon: CourseIconName;
  tint: string;
  ink: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = icons[icon];
  const box = size === "lg" ? "h-14 w-14 rounded-2xl" : size === "sm" ? "h-9 w-9 rounded-xl" : "h-11 w-11 rounded-2xl";
  const glyph = size === "lg" ? 24 : size === "sm" ? 16 : 20;
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", box, className)}
      style={{ backgroundColor: tint, color: ink }}
      aria-hidden="true"
    >
      <Icon size={glyph} strokeWidth={1.9} />
    </span>
  );
}
