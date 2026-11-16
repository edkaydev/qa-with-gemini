"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Lock,
  ShieldCheck,
  Target,
  X,
} from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { reportToText, type QaReport } from "@/lib/report";
import { cn } from "@/lib/utils";

function ratingTone(rating: number) {
  if (rating >= 4) return { text: "text-success", fill: "bg-success", pill: "success" as const };
  if (rating === 3) return { text: "text-warning", fill: "bg-umu-yellow", pill: "yellow" as const };
  if (rating >= 1) return { text: "text-danger", fill: "bg-danger", pill: "red" as const };
  return { text: "text-faint", fill: "bg-line", pill: "neutral" as const };
}

function sentimentTone(sentiment: QaReport["overallSentiment"]) {
  if (sentiment === "Positive") return "success" as const;
  if (sentiment === "Mixed") return "yellow" as const;
  if (sentiment === "Concerned") return "red" as const;
  return "neutral" as const;
}

function priorityTone(priority: string) {
  if (priority === "Immediate") return "red" as const;
  if (priority === "This semester") return "yellow" as const;
  return "neutral" as const;
}

export function QaReportDrawer({
  open,
  onClose,
  report,
}: {
  open: boolean;
  onClose: () => void;
  report: QaReport | null;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeRef.current?.focus(), 40);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const average = useMemo(() => {
    if (!report) return 0;
    const scored = report.courseRatings.filter((item) => item.rating > 0);
    if (scored.length === 0) return 0;
    return scored.reduce((total, item) => total + item.rating, 0) / scored.length;
  }, [report]);

  if (!open || !report) return null;

  async function copySummary() {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(reportToText(report));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex justify-end bg-ink/45 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qa-report-title"
        className="flex h-full w-full max-w-2xl animate-slide-in-right flex-col bg-white shadow-float"
      >
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-7 sm:py-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-umu-red-soft text-umu-red">
                <ShieldCheck size={20} aria-hidden="true" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="qa-report-title" className="text-base font-bold tracking-tight text-ink">
                    Quality Assurance summary
                  </h2>
                  <StatusPill tone="neutral" icon={<Lock size={10} aria-hidden="true" />}>
                    Internal view
                  </StatusPill>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  For the Quality Assurance Directorate. Not part of the student conversation.
                </p>
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-1 hover:text-ink"
              aria-label="Close QA summary"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="chat-scroll flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="animate-fade-up rounded-2xl border border-line bg-surface-1 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-kicker">Overview</p>
                <h3 className="mt-1.5 text-lg font-bold leading-snug tracking-tight text-ink">
                  {report.headline}
                </h3>
              </div>
              <StatusPill tone={sentimentTone(report.overallSentiment)}>
                {report.overallSentiment}
              </StatusPill>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{report.overview}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Target size={12} className="text-faint" aria-hidden="true" />
                Average rating{" "}
                <strong className="font-bold text-ink">
                  {average > 0 ? `${average.toFixed(1)}/5` : "Not rated"}
                </strong>
              </span>
              <span className="text-line">·</span>
              <span>
                Generated{" "}
                {new Date(report.generatedAt).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <section className="mt-6 animate-fade-up" style={{ animationDelay: "80ms" }}>
            <div className="flex items-end justify-between gap-3">
              <h3 className="text-sm font-bold tracking-tight text-ink">Course-by-course</h3>
              <span className="text-[10px] font-medium text-faint">1–5 scale</span>
            </div>
            <div className="mt-3 space-y-2">
              {report.courseRatings.map((rating) => {
                const tone = ratingTone(rating.rating);
                return (
                  <div key={rating.course} className="rounded-2xl border border-line bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold leading-snug text-ink">{rating.course}</p>
                        <p className="mt-0.5 text-[10px] text-muted">{rating.lecturer}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="flex items-center gap-1" aria-hidden="true">
                          {[1, 2, 3, 4, 5].map((dot) => (
                            <span
                              key={dot}
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                dot <= rating.rating ? tone.fill : "bg-line",
                              )}
                            />
                          ))}
                        </div>
                        <span className={cn("text-xs font-bold tabular-nums", tone.text)}>
                          {rating.rating > 0 ? `${rating.rating}/5` : "—"}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-muted">{rating.basis}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-6 animate-fade-up" style={{ animationDelay: "140ms" }}>
            <h3 className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-ink">
              <CheckCircle2 size={15} className="text-success" aria-hidden="true" />
              Strengths
            </h3>
            <div className="mt-3 space-y-2">
              {report.strengths.length === 0 ? (
                <p className="rounded-xl border border-line bg-surface-1 p-3 text-[11px] text-muted">
                  No clear strengths were recorded in this conversation.
                </p>
              ) : (
                report.strengths.map((strength) => (
                  <div
                    key={`${strength.title}-${strength.evidence}`}
                    className="rounded-2xl border border-success-line bg-success-soft/60 p-4"
                  >
                    <p className="text-xs font-bold text-success">{strength.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink/70">
                      {strength.evidence}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="mt-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <h3 className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-ink">
              <AlertTriangle size={15} className="text-danger" aria-hidden="true" />
              Red flags
            </h3>
            <div className="mt-3 space-y-2">
              {report.redFlags.length === 0 ? (
                <p className="rounded-xl border border-line bg-surface-1 p-3 text-[11px] text-muted">
                  No red flags were recorded in this conversation.
                </p>
              ) : (
                report.redFlags.map((flag) => (
                  <div
                    key={`${flag.title}-${flag.evidence}`}
                    className="rounded-2xl border border-danger-line bg-danger-soft/60 p-4"
                  >
                    <p className="text-xs font-bold text-danger">{flag.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink/70">{flag.evidence}</p>
                    <div className="mt-2.5 rounded-lg border border-danger-line/70 bg-white/70 p-2.5">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-danger">
                        Recommended action
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-ink/80">
                        {flag.recommendation}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="mt-6 animate-fade-up" style={{ animationDelay: "260ms" }}>
            <h3 className="text-sm font-bold tracking-tight text-ink">Priority actions</h3>
            <div className="mt-3 space-y-2">
              {report.actions.length === 0 ? (
                <p className="rounded-xl border border-line bg-surface-1 p-3 text-[11px] text-muted">
                  No priority actions were recorded in this conversation.
                </p>
              ) : (
                report.actions.map((action, index) => (
                  <div
                    key={`${action.priority}-${index}`}
                    className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4"
                  >
                    <StatusPill tone={priorityTone(action.priority)}>{action.priority}</StatusPill>
                    <p className="text-[11px] leading-relaxed text-ink/80">{action.action}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <div className="mt-6 animate-fade-up rounded-2xl border border-line bg-surface-1 p-4" style={{ animationDelay: "320ms" }}>
            <p className="flex items-start gap-2 text-[10px] leading-relaxed text-muted">
              <Lock size={12} className="mt-0.5 shrink-0 text-faint" aria-hidden="true" />
              This summary is generated from the conversation and is intended for internal quality
              assurance review. It does not include the student&apos;s name.
            </p>
          </div>
        </div>

        <div className="safe-bottom bg-white px-5 py-4 sm:px-7">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">
              Close
            </button>
            <button type="button" onClick={copySummary} className="btn-primary gap-2">
              {copied ? (
                <>
                  <Check size={15} aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <ClipboardCopy size={15} aria-hidden="true" />
                  Copy summary
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
