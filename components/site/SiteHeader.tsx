import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  backHref?: string;
  backLabel?: string;
  right?: ReactNode;
  className?: string;
  confidential?: boolean;
};

export function SiteHeader({
  backHref,
  backLabel = "All solutions",
  right,
  className,
  confidential = false,
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-white/90 shadow-soft backdrop-blur-xl",
        className,
      )}
    >
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          {backHref ? (
            <Link
              href={backHref}
              className="group inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-xl border border-line bg-white px-3 text-xs font-semibold text-muted transition-colors hover:border-umu-red/30 hover:text-ink sm:text-sm"
            >
              <ArrowLeft
                size={15}
                className="transition-transform group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
          ) : null}
          <Logo size={40} />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {confidential ? (
            <span className="hidden items-center gap-1.5 rounded-full border border-success-line bg-success-soft px-3 py-1.5 text-[11px] font-semibold text-success sm:inline-flex">
              <ShieldCheck size={13} aria-hidden="true" />
              Confidential
            </span>
          ) : null}
          {right}
        </div>
      </div>
    </header>
  );
}
