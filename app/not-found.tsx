import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-1">
      <SiteHeader />
      <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-umu-red-soft text-umu-red">
          <Compass size={26} aria-hidden="true" />
        </span>
        <p className="label-kicker mt-6">404</p>
        <h1 className="mt-2 text-balance text-3xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
          This page doesn&apos;t exist.
        </h1>
        <p className="mt-3 max-w-[420px] text-sm leading-relaxed text-muted">
          It may have been moved, removed, or never existed. Head back to the evaluation
          experiences.
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Link href="/" className="btn-primary">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to all solutions
          </Link>
          <Link href="/solution1" className="btn-secondary">
            Focus mode
          </Link>
          <Link href="/solution2" className="btn-secondary">
            Conversation mode
          </Link>
        </div>
      </div>
    </div>
  );
}
