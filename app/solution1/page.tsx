"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  History,
  Lock,
  MapPin,
  PenLine,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Reveal } from "@/components/ui/Reveal";
import { CourseIcon } from "@/components/ui/CourseIcon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatusPill } from "@/components/ui/StatusPill";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EvaluationFlow } from "@/components/solution1/EvaluationFlow";
import {
  COURSES,
  STUDENT,
  courseById,
  courseContext,
  courseSchedule,
  type Course,
} from "@/lib/courses";
import {
  answerLabel,
  buildQuestions,
} from "@/lib/evaluation";
import {
  clearEvaluations,
  readEvaluations,
  writeEvaluations,
  type EvaluationRecord,
  type EvaluationStore,
} from "@/lib/storage";
import { cn, greeting, initials } from "@/lib/utils";

type View =
  | { name: "dashboard" }
  | { name: "evaluate"; courseId: string }
  | { name: "complete"; courseId: string }
  | { name: "review"; courseId: string };

function StudentChip() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-umu-red text-xs font-bold text-white">
        S
      </span>
      <div className="hidden text-left md:block">
        <p className="text-xs font-semibold leading-tight text-ink">Student</p>
        <p className="text-[10px] leading-tight text-muted">
          {STUDENT.programme} · {STUDENT.year}
        </p>
      </div>
    </div>
  );
}

function CourseCard({
  course,
  record,
  onOpen,
}: {
  course: Course;
  record?: EvaluationRecord;
  onOpen: () => void;
}) {
  const questions = useMemo(() => buildQuestions(course), [course]);
  const answered = questions.filter((question) => record?.answers?.[question.id]?.trim()).length;
  const completed = Boolean(record?.completedAt);
  const started = answered > 0 && !completed;
  const progress = Math.round((answered / questions.length) * 100);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group card-surface flex h-full w-full flex-col p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-umu-red/25 hover:shadow-lift focus:outline-none focus-visible:ring-4 focus-visible:ring-umu-red/20 sm:p-5"
      aria-label={`${completed ? "Review" : started ? "Resume" : "Start"} evaluation for ${course.title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <CourseIcon icon={course.icon} tint={course.tint} ink={course.ink} />
        <StatusPill
          tone={completed ? "success" : started ? "red" : "neutral"}
          icon={completed ? <Check size={11} aria-hidden="true" /> : undefined}
        >
          {completed ? "Complete" : started ? "In progress" : "Not started"}
        </StatusPill>
      </div>

      <div className="mt-4">
        <h3 className="text-[15px] font-bold leading-snug tracking-[-0.01em] text-ink">
          {course.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-[9px] font-bold text-muted">
            {initials(course.lecturer)}
          </span>
          <span className="text-[11px] font-medium text-muted">{course.lecturer}</span>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-[11px] text-muted">
        <p className="flex items-center gap-1.5">
          <CalendarDays size={12} className="text-faint" aria-hidden="true" />
          {courseSchedule(course)}
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin size={12} className="text-faint" aria-hidden="true" />
          {course.venue}
        </p>
      </div>

      {started ? (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-[10px] font-medium text-muted">
            <span>{answered} of {questions.length} answered</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <ProgressBar value={progress} size="sm" />
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-between pt-4">
        <span
          className={cn(
            "text-[11px] font-semibold",
            completed ? "text-success" : started ? "text-umu-red" : "text-ink",
          )}
        >
          {completed ? "Review response" : started ? "Resume evaluation" : "Start evaluation"}
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-1 text-muted transition-all group-hover:bg-umu-red group-hover:text-white">
          <ArrowRight size={13} aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}

function ClearanceCard({
  completedCount,
  onViewClearance,
}: {
  completedCount: number;
  onViewClearance: () => void;
}) {
  const total = COURSES.length;
  const percent = (completedCount / total) * 100;
  const allComplete = completedCount === total;

  return (
    <div className="card-surface overflow-hidden">
      <div className={cn("h-1", allComplete ? "bg-success" : "bg-umu-red")} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label-kicker">Clearance</p>
            <h2 className="mt-1 text-base font-bold tracking-tight text-ink">Evaluation status</h2>
          </div>
          <StatusPill tone={allComplete ? "success" : completedCount > 0 ? "red" : "neutral"}>
            {allComplete ? "Exam card ready" : completedCount > 0 ? "On track" : "Not started"}
          </StatusPill>
        </div>

        <div className="mt-5 flex items-center gap-5">
          <ProgressRing
            value={percent}
            size={96}
            stroke={7}
            tone={allComplete ? "success" : "red"}
            label="Evaluation clearance"
          >
            <div className="text-center">
              <p className="text-xl font-black leading-none text-ink">{completedCount}</p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted">
                of {total}
              </p>
            </div>
          </ProgressRing>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">
              {allComplete ? "Cleared for examinations" : `${total - completedCount} ${total - completedCount === 1 ? "unit" : "units"} left`}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              {allComplete
                ? "All six unit evaluations are in. Your Semester II exam card is ready."
                : "Complete all six unit evaluations to unlock your Semester II examination card."}
            </p>
            {allComplete ? (
              <button
                type="button"
                onClick={onViewClearance}
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-success"
              >
                View clearance
                <ChevronRight size={12} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <ProgressBar value={percent} tone={allComplete ? "success" : "red"} size="sm" />
        </div>

        <div className="mt-4 rounded-xl border border-line bg-surface-1 p-3">
          <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-muted">
            <Lock size={12} className="mt-0.5 shrink-0 text-faint" aria-hidden="true" />
            Clearance only records that you submitted. Your answers are never shown to your
            lecturer with your name.
          </p>
        </div>
      </div>
    </div>
  );
}

function ExamCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-white shadow-lift">
      <div className="h-1.5 bg-umu-red" />
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/umu-logo.png"
              alt="Uganda Martyrs University crest"
              width={52}
              height={52}
              className="h-[52px] w-[52px] object-contain"
            />
            <div>
              <p className="text-sm font-bold leading-tight text-ink">Uganda Martyrs University</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
                Office of Quality Assurance
              </p>
            </div>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-success-soft text-success">
            <BadgeCheck size={24} aria-hidden="true" />
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-surface-1 p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Semester II Examination Clearance
          </p>
          <p className="mt-2 text-xl font-black tracking-tight text-ink">Student</p>
          <p className="text-xs text-muted">
            {STUDENT.programme} · {STUDENT.year}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-faint">Academic year</p>
              <p className="mt-0.5 text-xs font-semibold text-ink">{STUDENT.academicYear}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-faint">Evaluation clearance</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-success">
                <CheckCircle2 size={12} aria-hidden="true" />
                Complete
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-success-soft px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-success">
              <Check size={16} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold text-success">Cleared for examinations</p>
              <p className="text-[10px] text-success/80">All six unit evaluations submitted</p>
            </div>
          </div>
          <ShieldCheck size={20} className="text-success/70" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function DashboardView({
  store,
  completedCount,
  onOpenCourse,
  onReset,
  onViewClearance,
}: {
  store: EvaluationStore;
  completedCount: number;
  onOpenCourse: (courseId: string) => void;
  onReset: () => void;
  onViewClearance: () => void;
}) {
  const allComplete = completedCount === COURSES.length;

  return (
    <div className="bg-surface-1/60">
      <div className="container-page py-8 sm:py-12">
        <Reveal>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone="red">Focus mode</StatusPill>
                <StatusPill tone="neutral">
                  {STUDENT.semester} · {STUDENT.academicYear}
                </StatusPill>
              </div>
              <h1 className="mt-4 text-balance text-3xl font-black leading-tight tracking-[-0.03em] text-ink sm:text-4xl">
                {greeting()}.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                One question at a time. Tap an answer and move on. Your feedback is confidential,
                and your clearance updates as you go.
              </p>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="btn-ghost -ml-2 w-fit gap-1.5 text-[11px] sm:-ml-0"
            >
              <RotateCcw size={13} aria-hidden="true" />
              Reset progress
            </button>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-ink">Your units</h2>
                <p className="mt-0.5 text-[11px] text-muted">
                  Six units · one short evaluation each
                </p>
              </div>
              <span className="text-[11px] font-semibold text-muted">
                {completedCount}/{COURSES.length} complete
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {COURSES.map((course, index) => (
                <Reveal key={course.id} delay={index * 55}>
                  <CourseCard
                    course={course}
                    record={store[course.id]}
                    onOpen={() => onOpenCourse(course.id)}
                  />
                </Reveal>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: ClipboardCheck,
                  title: "Every answer counts",
                  body: "Results are grouped across the cohort, never shown with your name.",
                },
                {
                  icon: Sparkles,
                  title: "Designed for focus",
                  body: "One question fills the screen, so nothing gets skimmed.",
                },
                {
                  icon: ShieldCheck,
                  title: "Confidential",
                  body: "Only the QA Directorate sees the aggregated picture.",
                },
              ].map((item, index) => (
                <Reveal key={item.title} delay={index * 70}>
                  <div className="h-full rounded-2xl border border-line bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft">
                    <item.icon size={16} className="text-umu-red" aria-hidden="true" />
                    <p className="mt-2.5 text-xs font-bold text-ink">{item.title}</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <aside className="h-fit space-y-4 lg:sticky lg:top-[96px]">
            <Reveal delay={80}>
              <ClearanceCard completedCount={completedCount} onViewClearance={onViewClearance} />
            </Reveal>
            {allComplete ? (
              <div className="animate-scale-in">
                <ExamCard />
              </div>
            ) : null}
            <Reveal delay={140}>
              <div className="card-surface p-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-umu-yellow-soft text-[#7A5A00]">
                    <Lock size={15} aria-hidden="true" />
                  </span>
                  <h3 className="text-sm font-bold text-ink">What happens next</h3>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-muted">
                  Your ratings go to the Quality Assurance Directorate. They are combined with other
                  students&apos; responses and used to follow up with units that need support.
                </p>
                <div className="mt-4 space-y-2">
                  {["Read by the QA office", "Grouped, never attributed", "Used to fix next semester"].map(
                    (item, index) => (
                      <div key={item} className="flex items-center gap-2 text-[11px] text-muted">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-1 text-[9px] font-bold text-ink">
                          {index + 1}
                        </span>
                        {item}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </div>
    </div>
  );
}

function CompletionView({
  course,
  store,
  completedCount,
  onDashboard,
  onOpenCourse,
}: {
  course: Course;
  store: EvaluationStore;
  completedCount: number;
  onDashboard: () => void;
  onOpenCourse: (courseId: string) => void;
}) {
  const allComplete = completedCount === COURSES.length;
  const nextCourse = COURSES.find((item) => !store[item.id]?.completedAt);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-surface-1/60">
      <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 animate-scale-in items-center justify-center rounded-full bg-success-soft ring-8 ring-success-soft/50">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white">
              <Check size={22} aria-hidden="true" />
            </span>
          </div>
          <div className="mt-5 flex justify-center">
            <StatusPill tone="success" icon={<Check size={11} aria-hidden="true" />}>
              Response recorded
            </StatusPill>
          </div>
          <h1 className="mt-4 text-balance text-3xl font-black leading-tight tracking-[-0.03em] text-ink sm:text-4xl">
            {allComplete ? "You're cleared for exams." : "That unit is done."}
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted">
            {allComplete
              ? "All six unit evaluations are submitted. Your Semester II examination clearance is complete."
              : `Your response for ${course.shortTitle} is in. Your evaluation clearance has been updated.`}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="card-surface flex items-center gap-4 p-4 sm:p-5">
            <CourseIcon icon={course.icon} tint={course.tint} ink={course.ink} size="lg" />
            <div className="min-w-0">
              <p className="text-sm font-bold leading-snug text-ink">{course.title}</p>
              <p className="mt-0.5 text-[11px] text-muted">
                {course.lecturer} · {courseSchedule(course)}
              </p>
              <p className="mt-1 text-[10px] text-faint">{course.venue}</p>
            </div>
          </div>
          <div className="card-surface flex items-center justify-center gap-4 p-4 sm:p-5">
            <ProgressRing
              value={(completedCount / COURSES.length) * 100}
              size={72}
              stroke={6}
              tone={allComplete ? "success" : "red"}
              label="Evaluation clearance"
            >
              <p className="text-sm font-black text-ink">
                {completedCount}/{COURSES.length}
              </p>
            </ProgressRing>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">
                Clearance
              </p>
              <p className="text-xs font-bold text-ink">
                {allComplete ? "Complete" : `${COURSES.length - completedCount} units left`}
              </p>
            </div>
          </div>
        </div>

        {allComplete ? (
          <div className="mt-6 animate-fade-up">
            <ExamCard />
          </div>
        ) : nextCourse ? (
          <div className="mt-6 card-surface p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <CourseIcon icon={nextCourse.icon} tint={nextCourse.tint} ink={nextCourse.ink} />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Next up
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-ink">{nextCourse.shortTitle}</p>
                  <p className="text-[11px] text-muted">
                    {nextCourse.lecturer} · {courseSchedule(nextCourse)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenCourse(nextCourse.id)}
                className="btn-primary w-full gap-2 sm:w-auto"
              >
                Evaluate this unit
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={onDashboard} className="btn-secondary">
            Back to my units
          </button>
          {!allComplete && nextCourse ? (
            <button
              type="button"
              onClick={() => onOpenCourse(nextCourse.id)}
              className="btn-primary gap-2"
            >
              Continue
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <p className="mx-auto mt-6 max-w-md text-center text-[10px] leading-relaxed text-faint">
          Your answers are confidential and reported in aggregate. Clearance only records that a
          response was submitted.
        </p>
      </div>
    </div>
  );
}

function ReviewView({
  course,
  record,
  onBack,
  onEdit,
}: {
  course: Course;
  record?: EvaluationRecord;
  onBack: () => void;
  onEdit: () => void;
}) {
  const questions = useMemo(() => buildQuestions(course), [course]);
  const completedDate = record?.completedAt
    ? new Date(record.completedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Today";

  return (
    <div className="min-h-[calc(100vh-72px)] bg-surface-1/60">
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        <button type="button" onClick={onBack} className="btn-ghost -ml-2 gap-1.5 text-xs sm:text-sm">
          <ArrowRight size={16} className="rotate-180" aria-hidden="true" />
          Back to my units
        </button>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CourseIcon icon={course.icon} tint={course.tint} ink={course.ink} />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-ink">{course.title}</h1>
              <p className="text-[11px] text-muted">
                {course.lecturer} · {courseContext(course)}
              </p>
            </div>
          </div>
          <StatusPill tone="success" icon={<Check size={11} aria-hidden="true" />}>
            Submitted {completedDate}
          </StatusPill>
        </div>

        <div className="mt-6 card-surface overflow-hidden">
          <div className="bg-surface-1 px-5 py-4">
            <div className="flex items-center gap-2">
              <History size={15} className="text-muted" aria-hidden="true" />
              <p className="text-xs font-semibold text-ink">Your response</p>
              <span className="text-[10px] text-faint">· {questions.length} questions</span>
            </div>
          </div>
          <div className="space-y-4 px-5 py-4">
            {questions.map((question, index) => {
              const value = record?.answers?.[question.id] ?? "";
              return (
                <div key={question.id}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-1 text-[10px] font-bold text-muted">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium leading-relaxed text-muted">
                        {question.prompt}
                      </p>
                      <p
                        className={cn(
                          "mt-2 text-sm font-semibold",
                          value ? "text-ink" : "text-faint",
                        )}
                      >
                        {value ? answerLabel(question, value) : "Skipped"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onBack} className="btn-secondary">
            Back to my units
          </button>
          <button type="button" onClick={onEdit} className="btn-primary gap-2">
            <PenLine size={15} aria-hidden="true" />
            Update response
          </button>
        </div>
        <p className="mt-4 text-center text-[10px] text-faint">
          Updating your response replaces the previous answers for this unit.
        </p>
      </div>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-surface-1/60">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-umu-red border-t-transparent" />
        <p className="text-xs font-medium text-muted">Loading your units…</p>
      </div>
    </div>
  );
}

export default function SolutionOnePage() {
  const [ready, setReady] = useState(false);
  const [store, setStore] = useState<EvaluationStore>({});
  const [view, setView] = useState<View>({ name: "dashboard" });
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    setStore(readEvaluations());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeEvaluations(store);
  }, [ready, store]);

  const completedCount = COURSES.filter((course) => store[course.id]?.completedAt).length;
  const activeCourse = "courseId" in view ? courseById(view.courseId) : undefined;
  const activeRecord = activeCourse ? store[activeCourse.id] : undefined;

  function openCourse(courseId: string) {
    const record = store[courseId];
    if (record?.completedAt) {
      setView({ name: "review", courseId });
      return;
    }
    setView({ name: "evaluate", courseId });
  }

  function handleProgress(courseId: string, answers: Record<string, string>) {
    setStore((previous) => ({
      ...previous,
      [courseId]: {
        ...previous[courseId],
        answers,
        updatedAt: new Date().toISOString(),
      },
    }));
  }

  function handleComplete(courseId: string, answers: Record<string, string>) {
    setStore((previous) => ({
      ...previous,
      [courseId]: {
        ...previous[courseId],
        answers,
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
    }));
    setView({ name: "complete", courseId });
  }

  function handleEdit(courseId: string) {
    setStore((previous) => ({
      ...previous,
      [courseId]: {
        ...previous[courseId],
        completedAt: undefined,
        updatedAt: new Date().toISOString(),
      },
    }));
    setView({ name: "evaluate", courseId });
  }

  function resetProgress() {
    clearEvaluations();
    setStore({});
    setView({ name: "dashboard" });
    setResetOpen(false);
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader
        backHref="/"
        backLabel="All solutions"
        right={<StudentChip />}
        confidential
      />

      {!ready ? (
        <LoadingView />
      ) : view.name === "evaluate" && activeCourse ? (
        <EvaluationFlow
          course={activeCourse}
          initialAnswers={activeRecord?.answers ?? {}}
          onExit={() => setView({ name: "dashboard" })}
          onProgress={(answers) => handleProgress(activeCourse.id, answers)}
          onComplete={(answers) => handleComplete(activeCourse.id, answers)}
        />
      ) : view.name === "complete" && activeCourse ? (
        <CompletionView
          course={activeCourse}
          store={store}
          completedCount={completedCount}
          onDashboard={() => setView({ name: "dashboard" })}
          onOpenCourse={openCourse}
        />
      ) : view.name === "review" && activeCourse ? (
        <ReviewView
          course={activeCourse}
          record={activeRecord}
          onBack={() => setView({ name: "dashboard" })}
          onEdit={() => handleEdit(activeCourse.id)}
        />
      ) : (
        <DashboardView
          store={store}
          completedCount={completedCount}
          onOpenCourse={openCourse}
          onReset={() => setResetOpen(true)}
          onViewClearance={() => {
            const lastCompleted = [...COURSES]
              .reverse()
              .find((course) => store[course.id]?.completedAt);
            if (lastCompleted) setView({ name: "complete", courseId: lastCompleted.id });
          }}
        />
      )}

      <ConfirmDialog
        open={resetOpen}
        title="Reset evaluation progress?"
        description="This clears the draft and submitted responses saved in this browser. It does not affect any response already sent to the university."
        confirmLabel="Reset progress"
        onConfirm={resetProgress}
        onCancel={() => setResetOpen(false)}
        destructive
      />

      <footer className="bg-white">
        <div className="container-page flex flex-col gap-2 py-6 text-[10px] text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>Uganda Martyrs University · Office of Quality Assurance</p>
          <p className="inline-flex items-center gap-1.5">
            <Lock size={11} aria-hidden="true" />
            Confidential. Reported in aggregate.
          </p>
        </div>
      </footer>
    </div>
  );
}
