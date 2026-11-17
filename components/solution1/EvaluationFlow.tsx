"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Keyboard,
  Mic,
  MicOff,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { Course } from "@/lib/courses";
import { courseContext } from "@/lib/courses";
import { useSpeechPlayback, useVoiceInput } from "@/lib/speech";
import {
  buildQuestions,
  firstUnansweredIndex,
  type EvaluationOption,
} from "@/lib/evaluation";
import { cn, estimateRemaining } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CourseIcon } from "@/components/ui/CourseIcon";
import { StatusPill } from "@/components/ui/StatusPill";

type EvaluationFlowProps = {
  course: Course;
  initialAnswers: Record<string, string>;
  onExit: () => void;
  onProgress: (answers: Record<string, string>) => void;
  onComplete: (answers: Record<string, string>) => void;
};

export function EvaluationFlow({
  course,
  initialAnswers,
  onExit,
  onProgress,
  onComplete,
}: EvaluationFlowProps) {
  const questions = useMemo(() => buildQuestions(course), [course]);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [index, setIndex] = useState(() => {
    const first = firstUnansweredIndex(questions, initialAnswers);
    return first >= questions.length ? questions.length - 1 : first;
  });
  const [advancing, setAdvancing] = useState(false);
  const [comment, setComment] = useState(initialAnswers.comment ?? "");
  const [readAloud, setReadAloud] = useState(false);
  const timer = useRef<number | null>(null);
  const appliedVoiceRef = useRef("");
  const playback = useSpeechPlayback();
  const voice = useVoiceInput();

  const question = questions[index];
  const selected = answers[question.id] ?? "";
  const progress = Math.round(((index + 1) / questions.length) * 100);

  useEffect(() => {
    if (question.kind === "text") {
      setComment(answers.comment ?? "");
    }
  }, [index, question.kind, answers.comment]);

  useEffect(() => {
    setReadAloud(window.localStorage.getItem("umu.qa.readAloud") === "true");
  }, []);

  useEffect(() => {
    appliedVoiceRef.current = "";
    voice.reset();
    voice.stop();
  }, [question.id, voice.reset, voice.stop]);

  useEffect(() => {
    if (!readAloud || !playback.supported) return;
    playback.speak(`${question.prompt} ${question.hint ?? ""}`);
  }, [question.id, readAloud, playback.supported, playback.speak]);

  useEffect(() => {
    if (question.kind !== "text" || !voice.finalText) return;
    if (!voice.finalText.startsWith(appliedVoiceRef.current)) return;
    const addition = voice.finalText.slice(appliedVoiceRef.current.length).trim();
    appliedVoiceRef.current = voice.finalText;
    if (addition) {
      setComment((previous) => `${previous}${previous ? " " : ""}${addition}`.slice(0, 1000));
    }
  }, [voice.finalText, question.kind]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      playback.stop();
    };
  }, [playback.stop]);

  function clearTimer() {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }

  function goBack() {
    clearTimer();
    setAdvancing(false);
    if (index === 0) {
      onExit();
      return;
    }
    setIndex(index - 1);
  }

  function finish(nextAnswers: Record<string, string>) {
    onProgress(nextAnswers);
    onComplete(nextAnswers);
  }

  function selectOption(option: EvaluationOption) {
    if (advancing) return;
    clearTimer();
    const nextAnswers = { ...answers, [question.id]: option.value };
    setAnswers(nextAnswers);
    onProgress(nextAnswers);
    setAdvancing(true);
    timer.current = window.setTimeout(() => {
      setAdvancing(false);
      if (index >= questions.length - 1) {
        finish(nextAnswers);
      } else {
        setIndex(index + 1);
      }
      timer.current = null;
    }, 320);
  }

  function submitComment(skip: boolean) {
    voice.stop();
    const nextAnswers = { ...answers };
    const trimmed = comment.trim();
    if (skip || !trimmed) {
      delete nextAnswers.comment;
    } else {
      nextAnswers.comment = trimmed;
    }
    finish(nextAnswers);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLInputElement ||
        target?.isContentEditable
      ) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goBack();
        return;
      }
      if (question.kind === "text") return;
      const number = Number.parseInt(event.key, 10);
      if (Number.isNaN(number) || number < 1) return;
      const option = question.options?.[number - 1];
      if (option) {
        event.preventDefault();
        selectOption(option);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className="min-h-[calc(100vh-72px)] bg-surface-1/60">
      <div className="mx-auto w-full max-w-3xl px-5 py-6 sm:px-8 sm:py-10">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goBack}
            className="btn-ghost -ml-2 gap-1.5 text-xs sm:text-sm"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {index === 0 ? "Back to units" : "Previous question"}
          </button>
          <div className="flex min-w-0 items-center gap-2.5">
            <CourseIcon
              icon={course.icon}
              tint={course.tint}
              ink={course.ink}
              size="sm"
              className="hidden sm:inline-flex"
            />
            <div className="min-w-0 text-right">
              <p className="truncate text-xs font-semibold text-ink">{course.shortTitle}</p>
              <p className="truncate text-[10px] text-muted">{course.lecturer}</p>
            </div>
          </div>
        </div>

        <div className="mt-7">
          <div className="mb-2 flex items-end justify-between gap-3">
            <p className="text-xs font-semibold text-ink" aria-live="polite">
              Question {index + 1} of {questions.length}
            </p>
            <p className="text-[11px] font-medium text-muted">
              {estimateRemaining(questions.length, index)}
            </p>
          </div>
          <ProgressBar value={progress} />
        </div>

        <div key={question.id} className="mt-8 animate-fade-up">
          <div className="card-surface p-6 shadow-soft sm:p-9">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-muted">
              <span>{course.lecturer}</span>
              <span className="text-line">·</span>
              <span>{courseContext(course)}</span>
              {question.optional ? (
                <>
                  <span className="text-line">·</span>
                  <StatusPill tone="neutral">Optional</StatusPill>
                </>
              ) : null}
            </div>

            <h1 className="mt-4 text-balance text-[22px] font-bold leading-snug tracking-[-0.02em] text-ink sm:text-[28px]">
              {question.prompt}
            </h1>
            {question.hint ? (
              <p className="mt-3 text-sm leading-relaxed text-muted">{question.hint}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {playback.supported ? (
                <button
                  type="button"
                  aria-pressed={readAloud}
                  onClick={() => {
                    const next = !readAloud;
                    setReadAloud(next);
                    window.localStorage.setItem("umu.qa.readAloud", String(next));
                    if (!next) playback.stop();
                  }}
                  className={cn(
                    "inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition-colors",
                    readAloud
                      ? "border-umu-red/30 bg-umu-red-soft text-umu-red"
                      : "border-line bg-white text-muted hover:border-umu-red/30 hover:text-ink",
                  )}
                >
                  {readAloud ? (
                    <Volume2 size={14} aria-hidden="true" />
                  ) : (
                    <VolumeX size={14} aria-hidden="true" />
                  )}
                  {readAloud ? "Reading questions aloud" : "Read questions aloud"}
                </button>
              ) : null}
              {question.kind === "text" && voice.supported ? (
                <button
                  type="button"
                  aria-pressed={voice.listening}
                  onClick={() => (voice.listening ? voice.stop() : voice.start())}
                  className={cn(
                    "inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition-colors",
                    voice.listening
                      ? "border-success-line bg-success-soft text-success"
                      : "border-line bg-white text-muted hover:border-umu-red/30 hover:text-ink",
                  )}
                >
                  {voice.listening ? (
                    <MicOff size={14} aria-hidden="true" />
                  ) : (
                    <Mic size={14} aria-hidden="true" />
                  )}
                  {voice.listening ? "Stop listening" : "Speak your answer"}
                </button>
              ) : null}
            </div>

            {question.kind === "text" && voice.interimText ? (
              <p className="mt-2 text-[11px] italic text-muted" aria-live="polite">
                Listening… {voice.interimText}
              </p>
            ) : null}
            {question.kind === "text" && voice.error ? (
              <p className="mt-2 text-[11px] text-danger">{voice.error}</p>
            ) : null}

            {question.kind === "text" ? (
              <div className="mt-7">
                <label htmlFor="evaluation-comment" className="sr-only">
                  Optional comment
                </label>
                <textarea
                  id="evaluation-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value.slice(0, 1000))}
                  rows={5}
                  maxLength={1000}
                  placeholder={question.placeholder}
                  className="input-base resize-none leading-relaxed"
                />
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-faint">
                  <span>{comment.length}/1000</span>
                  <span>Your name is never attached to this comment.</span>
                </div>
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => submitComment(true)}
                    className="btn-ghost gap-1.5"
                  >
                    <SkipForward size={15} aria-hidden="true" />
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={() => submitComment(false)}
                    disabled={!comment.trim()}
                    className="btn-primary gap-2"
                  >
                    Send my comment
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="mt-7 space-y-2"
                role="radiogroup"
                aria-label="Answer options"
              >
                {question.options?.map((option, optionIndex) => {
                  const isSelected = selected === option.value;
                  const keyLabel =
                    question.kind === "scale" && option.value === "na"
                      ? "–"
                      : String(optionIndex + 1);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => selectOption(option)}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-150 sm:gap-4 sm:px-4",
                        isSelected
                          ? "border-umu-red bg-umu-red-soft ring-1 ring-umu-red"
                          : "border-line bg-white hover:border-umu-red/30 hover:bg-umu-red-soft/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                          isSelected
                            ? "bg-umu-red text-white"
                            : "bg-surface-2 text-muted group-hover:bg-white group-hover:text-umu-red",
                        )}
                      >
                        {isSelected ? <Check size={14} aria-hidden="true" /> : keyLabel}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block text-sm font-semibold",
                            isSelected ? "text-umu-red" : "text-ink",
                          )}
                        >
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
                          {option.description}
                        </span>
                      </span>
                      <ArrowRight
                        size={15}
                        className={cn(
                          "shrink-0 transition-all",
                          isSelected
                            ? "text-umu-red"
                            : "text-faint opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 px-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-faint">
              <Keyboard size={13} aria-hidden="true" />
              <span className="hidden sm:inline">Tap an answer or press 1–6</span>
              <span className="sm:hidden">Tap an answer to continue</span>
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-semibold text-success transition-opacity",
                advancing ? "opacity-100" : "opacity-0",
              )}
              aria-live="polite"
            >
              <Check size={12} aria-hidden="true" />
              Got it — saved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
