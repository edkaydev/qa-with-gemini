import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ClipboardCheck,
  MessageCircle,
  MousePointerClick,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Logo } from "@/components/brand/Logo";
import { CourseIcon } from "@/components/ui/CourseIcon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusPill } from "@/components/ui/StatusPill";
import { COURSES } from "@/lib/courses";

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-umu-red/5 via-umu-yellow/10 to-transparent blur-2xl" />

      <div className="card-surface relative overflow-hidden p-5 shadow-lift sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CourseIcon icon="database" tint="#FEE2E2" ink="#A30000" size="sm" />
            <div>
              <p className="text-sm font-semibold text-ink">Data Mining & BI</p>
              <p className="text-[11px] text-muted">Mr. Mukyaake · Monday</p>
            </div>
          </div>
          <StatusPill tone="red">Question 3 of 7</StatusPill>
        </div>

        <div className="mt-5">
          <ProgressBar value={43} size="sm" />
        </div>

        <p className="mt-6 text-[15px] font-semibold leading-snug text-ink">
          New concepts were explained clearly, with examples beyond reading notes or slides.
        </p>

        <div className="mt-4 space-y-2">
          {[
            ["1", "Strongly disagree", false],
            ["2", "Disagree", false],
            ["3", "Neutral", false],
            ["4", "Agree", true],
            ["5", "Strongly agree", false],
          ].map(([key, label, selected]) => (
            <div
              key={key as string}
              className={
                selected
                  ? "flex items-center gap-3 rounded-xl border border-umu-red bg-umu-red-soft px-3 py-2.5"
                  : "flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5"
              }
            >
              <span
                className={
                  selected
                    ? "flex h-6 w-6 items-center justify-center rounded-full bg-umu-red text-[10px] font-bold text-white"
                    : "flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-[10px] font-bold text-muted"
                }
              >
                {selected ? <Check size={12} aria-hidden="true" /> : (key as string)}
              </span>
              <span
                className={
                  selected
                    ? "text-xs font-semibold text-umu-red"
                    : "text-xs font-medium text-muted"
                }
              >
                {label as string}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between pt-4">
          <span className="text-[11px] text-faint">Tap an answer to continue</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-umu-red">
            Auto-advance <ArrowRight size={12} aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className="absolute -bottom-10 -left-4 w-[240px] rotate-[-3deg] sm:-left-10">
        <div className="animate-float-slow rounded-2xl border border-line bg-white p-3.5 shadow-lift">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
              AI
            </span>
            <p className="text-[11px] font-semibold text-ink">Conversation mode</p>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            “The Monday block felt like a playlist, not a class. I stopped taking notes after week
            three.”
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Captured in the student&apos;s words
          </div>
        </div>
      </div>
    </div>
  );
}

type SolutionCardProps = {
  number: string;
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  tags: string[];
  icon: React.ReactNode;
  accent: "red" | "yellow" | "ink";
  preview: React.ReactNode;
};

const accentClasses = {
  red: {
    top: "from-umu-red to-[#FF6B6B]",
    number: "text-umu-red",
    icon: "bg-umu-red-soft text-umu-red",
    tag: "border-umu-red/15 bg-umu-red-soft text-umu-red",
    button: "bg-umu-red text-white hover:bg-umu-red-dark",
  },
  yellow: {
    top: "from-umu-yellow to-[#FFE66D]",
    number: "text-[#9A7A00]",
    icon: "bg-umu-yellow-soft text-[#7A5A00]",
    tag: "border-umu-yellow/30 bg-umu-yellow-soft text-[#7A5A00]",
    button: "bg-ink text-white hover:bg-[#2A2A44]",
  },
  ink: {
    top: "from-ink to-[#4A4A6A]",
    number: "text-ink",
    icon: "bg-surface-1 text-ink",
    tag: "border-line bg-surface-1 text-muted",
    button: "bg-ink text-white hover:bg-[#2A2A44]",
  },
};

function SolutionCard({
  number,
  href,
  eyebrow,
  title,
  description,
  tags,
  icon,
  accent,
  preview,
}: SolutionCardProps) {
  const styles = accentClasses[accent];
  return (
    <Link
      href={href}
      className="group card-surface relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus:outline-none focus-visible:ring-4 focus-visible:ring-umu-red/20 sm:p-7"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${styles.top}`} />
      <div className="flex items-start justify-between gap-4">
        <span className={`text-[13px] font-black tracking-tight ${styles.number}`}>{number}</span>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${styles.icon}`}
        >
          {icon}
        </span>
      </div>

      <div className="mt-6 flex-1">
        <p className="label-kicker">{eyebrow}</p>
        <h3 className="mt-2 text-xl font-bold leading-tight tracking-tight text-ink">{title}</h3>
        <p className="mt-2.5 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-5 space-y-2">{preview}</div>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${styles.tag}`}
            >
              {tag}
            </span>
          ))}
        </div>
        <span
          className={`mt-5 inline-flex min-h-[44px] w-full items-center justify-between rounded-xl px-4 text-sm font-semibold transition-colors ${styles.button}`}
        >
          Open {number}
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}

function FocusPreview() {
  return (
    <div className="rounded-xl border border-line bg-surface-1 p-3">
      <div className="flex items-center justify-between text-[10px] font-medium text-muted">
        <span>Question 2 of 7</span>
        <span>About 45s left</span>
      </div>
      <div className="mt-2">
        <ProgressBar value={29} size="sm" />
      </div>
      <div className="mt-3 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className={
              item < 3
                ? "h-5 flex-1 rounded-md bg-umu-red/80"
                : "h-5 flex-1 rounded-md bg-white ring-1 ring-line"
            }
          />
        ))}
      </div>
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="space-y-1.5 rounded-xl border border-line bg-surface-1 p-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[8px] font-bold text-white">
          AI
        </span>
        <p className="rounded-lg rounded-tl-sm bg-white px-2.5 py-1.5 text-[10px] leading-relaxed text-ink ring-1 ring-line">
          How did the Lab 2 practicals actually run?
        </p>
      </div>
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-lg rounded-tr-sm bg-umu-red px-2.5 py-1.5 text-[10px] leading-relaxed text-white">
          We never had one. It was notes on Moodle.
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[720px] hero-glow animate-glow"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute right-0 top-0 hidden h-[420px] w-[420px] dot-grid opacity-40 lg:block" aria-hidden="true" />

      <SiteHeader
        className="bg-white/70"
        right={
          <Link
            href="/solution1"
            className="hidden min-h-[40px] items-center gap-2 rounded-xl bg-ink px-4 text-xs font-semibold text-white transition-colors hover:bg-[#2A2A44] sm:inline-flex"
          >
            Student portal
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        }
      />

      <section className="relative">
        <div className="container-page pb-20 pt-14 sm:pb-28 sm:pt-20">
          <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
            <Reveal className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-muted backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-umu-red" aria-hidden="true" />
                Semester II · 2025/2026
                <span className="text-line">|</span>
                Course evaluation
              </div>

              <h1 className="mt-6 max-w-[620px] text-balance text-[44px] font-black leading-[1.02] tracking-[-0.045em] text-ink sm:text-6xl lg:text-[68px]">
                Your experience,
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-umu-red">actually heard.</span>
                  <span
                    className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded-sm bg-umu-yellow/60 sm:bottom-2 sm:h-4"
                    aria-hidden="true"
                  />
                </span>
              </h1>

              <p className="mt-6 max-w-[540px] text-base leading-relaxed text-muted sm:text-lg">
                Course evaluation at Uganda Martyrs University, rebuilt around how students
                actually think, speak, and remember. Two experiences. One goal: feedback that
                makes the next semester better.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#solutions" className="btn-primary group">
                  Choose an experience
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-success" aria-hidden="true" />
                  Confidential by design
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ClipboardCheck size={13} className="text-umu-red" aria-hidden="true" />
                  Reported in aggregate
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#9A7A00]" aria-hidden="true" />
                  Built with students
                </span>
              </div>
            </Reveal>

            <Reveal className="relative" delay={120}>
              <HeroPreview />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative bg-surface-1/60">
        <div className="container-page py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal>
              <div>
                <p className="label-kicker">The problem</p>
                <h2 className="mt-3 max-w-[460px] text-balance text-3xl font-black leading-tight tracking-[-0.03em] text-ink sm:text-4xl">
                  When the form is long and the exam is close, the data stops being honest.
                </h2>
                <p className="mt-4 max-w-[460px] text-sm leading-relaxed text-muted">
                  Students are not choosing to give false information. The process is making the
                  fastest answer the safest answer. That is a design problem — and it has three
                  layers.
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <figure className="relative rounded-3xl border border-line bg-white p-7 shadow-soft sm:p-9">
                <Quote size={28} className="text-umu-yellow" aria-hidden="true" />
                <blockquote className="mt-4 text-balance text-2xl font-bold leading-snug tracking-[-0.02em] text-ink sm:text-[28px]">
                  “I just tick anything to get my exam card.”
                </blockquote>
                <figcaption className="mt-4 text-xs font-medium text-muted">
                  Third-year Computer Science student · anonymous
                </figcaption>
                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  {[
                    ["Too long", "A wall of questions per unit."],
                    ["Too late", "Feedback after memory fades."],
                    ["Too thin", "Tick boxes miss the story."],
                  ].map(([title, body]) => (
                    <div
                      key={title}
                      className="rounded-xl border border-line bg-surface-1 p-3 transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      <p className="text-[11px] font-bold text-ink">{title}</p>
                      <p className="mt-1 text-[10px] leading-relaxed text-muted">{body}</p>
                    </div>
                  ))}
                </div>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="solutions" className="scroll-mt-24 py-16 sm:py-24">
        <div className="container-page">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label-kicker">The response</p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.03em] text-ink sm:text-4xl">
                Two solutions, one student.
              </h2>
            </div>
            <p className="max-w-[420px] text-sm leading-relaxed text-muted">
              Fix the form. Fix the voice. Each path removes a different reason the old evaluation
              failed.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <Reveal>
              <SolutionCard
                number="Solution 01"
                href="/solution1"
                eyebrow="Focus mode"
                title="One question. One answer. Next."
                description="A tap-through evaluation that keeps students reading instead of scrolling. Progress, time left, and a resume that respects their time."
                tags={["Auto-advance", "Progress bar", "Resume later"]}
                icon={<MousePointerClick size={20} aria-hidden="true" />}
                accent="red"
                preview={<FocusPreview />}
              />
            </Reveal>
            <Reveal delay={110}>
              <SolutionCard
                number="Solution 02"
                href="/solution2"
                eyebrow="Conversation mode"
                title="Say it the way you'd say it."
                description="A natural-language interview that asks one thing at a time, follows up on vague answers, and turns the conversation into a QA summary."
                tags={["AI interviewer", "One question at a time", "QA summary"]}
                icon={<MessageCircle size={20} aria-hidden="true" />}
                accent="yellow"
                preview={<ChatPreview />}
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="container-page py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <Reveal>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-umu-yellow">
                  What changes
                </p>
                <h2 className="mt-3 text-balance text-3xl font-black leading-tight tracking-[-0.03em] sm:text-4xl">
                  Better questions. Better evidence.
                </h2>
                <p className="mt-4 max-w-[480px] text-sm leading-relaxed text-white/60">
                  The Quality Assurance Directorate gets feedback that is specific, current, and
                  comparable across units — without asking students to choose between honesty and
                  their exam card.
                </p>
              </div>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: MousePointerClick,
                  value: "1",
                  label: "question on screen",
                  body: "Attention stays on the question that matters.",
                },
                {
                  icon: MessageCircle,
                  value: "6–8",
                  label: "guided prompts",
                  body: "The conversation follows up instead of moving on.",
                },
              ].map((item, index) => (
                <Reveal key={item.label} delay={index * 100}>
                  <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors duration-300 hover:bg-white/[0.08]">
                    <item.icon size={18} className="text-umu-yellow" aria-hidden="true" />
                    <p className="mt-4 text-3xl font-black tracking-tight">{item.value}</p>
                    <p className="text-xs font-semibold text-white/80">{item.label}</p>
                    <p className="mt-2 text-[11px] leading-relaxed text-white/50">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-line bg-surface-1 p-7 shadow-soft sm:flex-row sm:items-center sm:p-9">
              <div>
                <p className="label-kicker">Ready when you are</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.02em] text-ink">
                  Pick a path. See the difference.
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {COURSES.length} units · {COURSES.length} chances to say something useful.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/solution1" className="btn-primary">
                  Focus mode
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link href="/solution2" className="btn-secondary">
                  Conversation mode
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="bg-white">
        <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <Logo size={38} />
          <div className="flex flex-col gap-2 text-xs text-muted sm:items-end">
            <p>Office of Quality Assurance · Uganda Martyrs University</p>
            <p className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-success" aria-hidden="true" />
              Student feedback is confidential and reported in aggregate.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
