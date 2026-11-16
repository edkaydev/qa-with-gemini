import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  size?: number;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
};

export function Logo({
  href = "/",
  size = 42,
  showWordmark = true,
  className,
  wordmarkClassName,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-umu-red/20",
        className,
      )}
      aria-label="Uganda Martyrs University — home"
    >
      <Image
        src="/umu-logo.png"
        alt="Uganda Martyrs University crest"
        width={size}
        height={size}
        priority
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />
      {showWordmark ? (
        <span className={cn("min-w-0", wordmarkClassName)}>
          <span className="block truncate text-[13px] font-bold leading-tight tracking-tight text-ink sm:text-sm">
            Uganda Martyrs University
          </span>
          <span className="block truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted sm:text-[11px]">
            Office of Quality Assurance
          </span>
        </span>
      ) : null}
    </Link>
  );
}
