"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Lock,
  MessageCircle,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Timer,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Reveal } from "@/components/ui/Reveal";
import { CourseIcon } from "@/components/ui/CourseIcon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusPill } from "@/components/ui/StatusPill";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { QaReportDrawer } from "@/components/solution2/QaReportDrawer";
import { COURSES, courseSchedule } from "@/lib/courses";
import {
  OPENING_MESSAGE,
  coveredCourseIds,
  sanitizeStudentStream,
  type TranscriptMessage,
} from "@/lib/prompts";
import { normalizeReport, type QaReport } from "@/lib/report";
import {
  clearConversation,
  readConversation,
  writeConversation,
  type ChatMessage,
} from "@/lib/storage";
import { useSpeechPlayback, useVoiceInput } from "@/lib/speech";
import { cn } from "@/lib/utils";

type ReportState = "idle" | "loading" | "ready" | "error";

let messageCounter = 0;

function makeId(): string {
  messageCounter += 1;
  return `${Date.now()}-${messageCounter}`;
}

function openingMessage(): ChatMessage {
  return {
    id: makeId(),
    role: "assistant",
    content: OPENING_MESSAGE,
    createdAt: Date.now(),
  };
}

function toTranscript(messages: ChatMessage[]): TranscriptMessage[] {
  return messages
    .filter((message) => message.content.trim())
    .map((message) => ({ role: message.role, content: message.content }));
}

function MessageBubble({
  message,
  streaming,
  showCaret,
}: {
  message: ChatMessage;
  streaming: boolean;
  showCaret: boolean;
}) {
  const isAssistant = message.role === "assistant";

  if (isAssistant && !message.content && !streaming) return null;

  if (!isAssistant) {
    return (
      <div className="flex animate-fade-up justify-end">
        <div className="max-w-[86%]">
          <div className="rounded-2xl rounded-tr-md bg-umu-red px-4 py-3 text-sm leading-relaxed text-white shadow-soft">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <p className="mt-1 pr-1 text-right text-[9px] font-medium text-faint">You</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex animate-fade-up items-start gap-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white">
        <Sparkles size={14} aria-hidden="true" />
      </span>
      <div className="max-w-[86%]">
        <div className="rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3 text-sm leading-relaxed text-ink shadow-soft">
          {message.content ? (
            <p className="whitespace-pre-wrap">
              {message.content}
              {showCaret ? (
                <span
                  className="ml-0.5 inline-block h-4 w-1.5 animate-caret rounded-sm bg-umu-red align-middle"
                  aria-hidden="true"
                />
              ) : null}
            </p>
          ) : (
            <span className="inline-flex items-center gap-1 py-1" aria-label="Assistant is typing">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="h-1.5 w-1.5 animate-dot-bounce rounded-full bg-muted"
                  style={{ animationDelay: `${dot * 0.15}s` }}
                />
              ))}
            </span>
          )}
        </div>
        <p className="mt-1 pl-1 text-[9px] font-medium text-faint">
          QA assistant · confidential
        </p>
      </div>
    </div>
  );
}

function UnitsCard({ mentioned }: { mentioned: Set<string> }) {
  return (
    <div className="card-surface p-4 sm:p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="label-kicker">Coverage</p>
          <h2 className="mt-1 text-sm font-bold tracking-tight text-ink">Your units</h2>
        </div>
        <span className="text-[11px] font-semibold text-muted">{mentioned.size}/{COURSES.length}</span>
      </div>
      <div className="mt-3 space-y-1">
        {COURSES.map((course) => {
          const discussed = mentioned.has(course.id);
          return (
            <div
              key={course.id}
              className={cn(
                "flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors",
                discussed ? "bg-success-soft/50" : "",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  discussed ? "bg-success" : "bg-line",
                )}
              />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[11px]",
                  discussed ? "font-semibold text-ink" : "text-muted",
                )}
              >
                {course.shortTitle}
              </span>
              {discussed ? (
                <Check size={11} className="shrink-0 text-success" aria-hidden="true" />
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-faint">
        Units highlight as they come up in the conversation.
      </p>
    </div>
  );
}

function ProgressCard({ coveredCount, completed }: { coveredCount: number; completed: boolean }) {
  const remaining = COURSES.length - coveredCount;
  const value = Math.min((coveredCount / COURSES.length) * 100, 100);
  return (
    <div className="card-surface p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="label-kicker">Progress</p>
          <h2 className="mt-1 text-sm font-bold tracking-tight text-ink">
            {completed ? "Conversation complete" : "The conversation"}
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-muted">
          {coveredCount}/{COURSES.length} units
        </span>
      </div>
      <div className="mt-3">
        <ProgressBar value={value} tone={completed ? "success" : "yellow"} size="sm" />
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-muted">
        {completed
          ? "Thank you. The QA office now has a structured summary."
          : remaining > 0
            ? `${remaining} ${remaining === 1 ? "unit" : "units"} still to talk about. The assistant will get to each one.`
            : "Every unit has been covered. You can wrap up whenever you are ready."}
      </p>
    </div>
  );
}

function ReportCard({
  state,
  report,
  completed,
  onOpen,
  onRetry,
}: {
  state: ReportState;
  report: QaReport | null;
  completed: boolean;
  onOpen: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-umu-red-soft text-umu-red">
          <ShieldCheck size={15} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-bold tracking-tight text-ink">QA summary</h2>
          <p className="text-[10px] text-muted">Internal view</p>
        </div>
      </div>

      {state === "loading" ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-surface-1 p-3">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-umu-red border-t-transparent" />
          <p className="text-[10px] text-muted">Preparing the summary…</p>
        </div>
      ) : state === "error" ? (
        <div className="mt-4">
          <p className="text-[10px] leading-relaxed text-muted">
            The summary could not be generated right now.
          </p>
          <button type="button" onClick={onRetry} className="btn-secondary mt-3 min-h-[40px] w-full text-[11px]">
            Try again
          </button>
        </div>
      ) : report && state === "ready" ? (
        <div className="mt-4">
          <p className="text-[10px] leading-relaxed text-muted">
            Ready for the Quality Assurance Directorate. The student never sees this view.
          </p>
          <button type="button" onClick={onOpen} className="btn-primary mt-3 min-h-[40px] w-full gap-2 text-[11px]">
            Open QA summary
            <ArrowRight size={13} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <p className="mt-4 text-[10px] leading-relaxed text-muted">
          {completed
            ? "The summary will appear here shortly."
            : "Available once the conversation is complete."}
        </p>
      )}
    </div>
  );
}

function HowCard() {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-umu-yellow-soft text-[#7A5A00]">
          <Lock size={15} aria-hidden="true" />
        </span>
        <h2 className="text-sm font-bold tracking-tight text-ink">How this works</h2>
      </div>
      <div className="mt-3 space-y-2.5">
        {[
          ["One question at a time", "The assistant listens before moving on."],
          ["Every unit covered", "It comes back to any unit that has not come up yet."],
          ["Skip anything", "You are never forced to answer a question."],
          ["Nothing affects clearance", "This is separate from grades and exam eligibility."],
        ].map(([title, body]) => (
          <div key={title} className="flex items-start gap-2">
            <Check size={12} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
            <div>
              <p className="text-[11px] font-semibold text-ink">{title}</p>
              <p className="text-[10px] leading-relaxed text-muted">{body}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 pt-3 text-[10px] leading-relaxed text-faint">
        Confidential. Your name is not attached to the feedback in reports.
      </p>
    </div>
  );
}

export function ChatExperience() {
  const [ready, setReady] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [completed, setCompleted] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [report, setReport] = useState<QaReport | null>(null);
  const [reportState, setReportState] = useState<ReportState>("idle");
  const [reportOpen, setReportOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [readAloud, setReadAloud] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const reportInFlight = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nearBottomRef = useRef(true);
  const appliedVoiceRef = useRef("");
  const lastSpokenRef = useRef<string | null>(null);
  const playback = useSpeechPlayback();
  const voice = useVoiceInput();

  const userTurns = messages.filter((message) => message.role === "user").length;

  const mentioned = useMemo(() => new Set(coveredCourseIds(messages)), [messages]);

  useEffect(() => {
    const stored = readConversation();
    if (stored && Array.isArray(stored.messages) && stored.messages.length > 0) {
      setMessages(stored.messages);
      setCompleted(Boolean(stored.completed));
      if (stored.report) {
        try {
          setReport(normalizeReport(stored.report));
          setReportState("ready");
        } catch {
          setReportState("idle");
        }
      }
    } else {
      setMessages([openingMessage()]);
    }
    setReadAloud(window.localStorage.getItem("umu.qa.readAloud") === "true");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      writeConversation({ messages, completed, report });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [ready, messages, completed, report]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      playback.stop();
    };
  }, [playback.stop]);

  useEffect(() => {
    if (!readAloud || !playback.supported || streaming) return;
    const latest = [...messages].reverse().find(
      (message) => message.role === "assistant" && message.content.trim(),
    );
    if (!latest || lastSpokenRef.current === latest.id) return;
    lastSpokenRef.current = latest.id;
    playback.speak(latest.content);
  }, [messages, streaming, readAloud, playback.supported, playback.speak]);

  useEffect(() => {
    if (!voice.finalText) return;
    if (!voice.finalText.startsWith(appliedVoiceRef.current)) return;
    const addition = voice.finalText.slice(appliedVoiceRef.current.length).trim();
    appliedVoiceRef.current = voice.finalText;
    if (addition) {
      setInput((previous) => `${previous}${previous ? " " : ""}${addition}`.slice(0, 1500));
    }
  }, [voice.finalText]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    if (!nearBottomRef.current) return;
    element.scrollTo({
      top: element.scrollHeight,
      behavior: streaming ? "auto" : "smooth",
    });
  }, [messages, streaming]);

  async function generateReport(history: ChatMessage[]) {
    if (reportInFlight.current) return;
    const transcript = toTranscript(history);
    if (transcript.filter((message) => message.role === "user").length < 3) {
      setReportState("error");
      return;
    }
    reportInFlight.current = true;
    setReportState("loading");
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: transcript }),
      });
      const data = (await response.json().catch(() => null)) as
        | { report?: unknown; error?: string }
        | null;
      if (!response.ok) {
        throw new Error(data?.error || "The summary is unavailable right now.");
      }
      const normalized = normalizeReport(data?.report);
      setReport(normalized);
      setReportState("ready");
    } catch {
      setReportState("error");
    } finally {
      reportInFlight.current = false;
    }
  }

  useEffect(() => {
    if (!ready || !completed || report || reportState !== "idle") return;
    void generateReport(messages);
  }, [ready, completed, report, reportState, messages]);

  async function runAssistant(history: ChatMessage[]) {
    if (streaming) return;
    setStreaming(true);
    setError(null);

    const assistantId = makeId();
    setMessages([
      ...history,
      { id: assistantId, role: "assistant", content: "", createdAt: Date.now() },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;
    let assistantText = "";
    let didComplete = false;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toTranscript(history) }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "The assistant is unavailable right now.");
      }
      if (!response.body) throw new Error("The assistant is unavailable right now.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let doneReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const event = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          boundary = buffer.indexOf("\n\n");

          const data = event
            .split("\n")
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart())
            .join("\n");
          if (!data) continue;

          let payload: {
            text?: unknown;
            done?: unknown;
            completed?: unknown;
            error?: unknown;
          };
          try {
            payload = JSON.parse(data) as typeof payload;
          } catch {
            continue;
          }

          if (typeof payload.error === "string" && payload.error) {
            throw new Error(payload.error);
          }

          if (typeof payload.text === "string" && payload.text) {
            assistantText += sanitizeStudentStream(payload.text);
            setMessages((previous) =>
              previous.map((message) =>
                message.id === assistantId
                  ? { ...message, content: assistantText }
                  : message,
              ),
            );
          }

          if (payload.done === true) {
            doneReceived = true;
            didComplete = payload.completed === true;
          }
        }
      }

      if (!doneReceived) {
        throw new Error("The connection ended early. Please try again.");
      }

      if (!assistantText.trim()) {
        assistantText = "I'm sorry — I did not catch that. Could you say a little more?";
        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantId ? { ...message, content: assistantText } : message,
          ),
        );
      }

      if (didComplete) {
        setCompleted(true);
        void generateReport([
          ...history,
          {
            id: assistantId,
            role: "assistant",
            content: assistantText,
            createdAt: Date.now(),
          },
        ]);
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(
        caught instanceof Error
          ? caught.message
          : "The assistant is unavailable right now. Please try again.",
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function resetComposerHeight() {
    if (inputRef.current) inputRef.current.style.height = "auto";
  }

  function sendMessage(raw: string) {
    const text = raw.trim();
    if (!text || streaming || completed) return;

    if (voice.listening) voice.stop();
    voice.reset();
    appliedVoiceRef.current = "";

    const base = [...messages];
    while (
      base.length > 0 &&
      base[base.length - 1].role === "assistant" &&
      !base[base.length - 1].content.trim()
    ) {
      base.pop();
    }

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: text.slice(0, 1500),
      createdAt: Date.now(),
    };
    const history = [...base, userMessage];
    setMessages(history);
    setInput("");
    setError(null);
    resetComposerHeight();
    void runAssistant(history);
  }

  function retry() {
    if (streaming || completed) return;
    const base = [...messages];
    while (base.length > 0 && base[base.length - 1].role === "assistant") {
      base.pop();
    }
    if (base.length === 0 || base[base.length - 1].role !== "user") return;
    setError(null);
    setMessages(base);
    void runAssistant(base);
  }

  function resetConversation() {
    abortRef.current?.abort();
    playback.stop();
    voice.reset();
    appliedVoiceRef.current = "";
    lastSpokenRef.current = null;
    clearConversation();
    setMessages([openingMessage()]);
    setCompleted(false);
    setStreaming(false);
    setError(null);
    setInput("");
    setReport(null);
    setReportState("idle");
    setReportOpen(false);
    setResetOpen(false);
    resetComposerHeight();
  }

  const firstTurn = userTurns === 0 && !streaming && !completed;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader
        backHref="/"
        backLabel="All solutions"
        confidential
        right={
          <div className="flex items-center gap-1.5">
            {playback.supported ? (
              <button
                type="button"
                aria-pressed={readAloud}
                aria-label={readAloud ? "Turn off read aloud" : "Read questions aloud"}
                title={readAloud ? "Turn off read aloud" : "Read questions aloud"}
                onClick={() => {
                  const next = !readAloud;
                  setReadAloud(next);
                  window.localStorage.setItem("umu.qa.readAloud", String(next));
                  if (!next) playback.stop();
                  if (next) lastSpokenRef.current = null;
                }}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                  readAloud
                    ? "bg-umu-red-soft text-umu-red"
                    : "text-muted hover:bg-surface-1 hover:text-ink",
                )}
              >
                {readAloud ? (
                  <Volume2 size={16} aria-hidden="true" />
                ) : (
                  <VolumeX size={16} aria-hidden="true" />
                )}
              </button>
            ) : null}
            {report ? (
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="relative inline-flex min-h-[38px] items-center gap-2 rounded-xl border border-umu-red/20 bg-umu-red-soft px-3 text-[11px] font-semibold text-umu-red transition-colors hover:bg-umu-red/10"
              >
                <ShieldCheck size={14} aria-hidden="true" />
                <span className="hidden sm:inline">QA summary</span>
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-success ring-2 ring-white" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-1 hover:text-ink"
              aria-label="Start a new conversation"
              title="Start a new conversation"
            >
              <RotateCcw size={16} aria-hidden="true" />
            </button>
          </div>
        }
      />

      <div className="bg-surface-1/60">
        <div className="container-page py-7 sm:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <Reveal>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone="yellow" icon={<MessageCircle size={11} aria-hidden="true" />}>
                    Conversation mode
                  </StatusPill>
                  <StatusPill tone={completed ? "success" : streaming ? "red" : "neutral"}>
                    {completed ? "Complete" : streaming ? "Listening…" : "Ready"}
                  </StatusPill>
                </div>
                <h1 className="mt-3 text-balance text-3xl font-black leading-tight tracking-[-0.03em] text-ink sm:text-4xl">
                  A conversation, not a form.
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                  One question at a time, in your own words. Say the thing you would normally skip.
                </p>
              </div>
            </Reveal>
            <Reveal delay={90} className="hidden sm:block">
              <div className="hidden items-center gap-4 rounded-2xl border border-line bg-white px-4 py-3 sm:flex">
                <div className="flex items-center gap-2">
                  <Timer size={15} className="text-umu-red" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-semibold text-ink">About 2 minutes</p>
                    <p className="text-[9px] text-muted">One question at a time</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-success" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-semibold text-ink">Confidential</p>
                    <p className="text-[9px] text-muted">Nothing affects clearance</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Reveal delay={120} className="min-h-[620px]">
              <section className="card-surface flex h-full min-h-[620px] flex-col overflow-hidden">
              <div className="flex items-center justify-between gap-3 bg-surface-1/50 px-4 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                    <Sparkles size={15} aria-hidden="true" />
                    {streaming ? (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse-soft rounded-full bg-success ring-2 ring-white" />
                    ) : null}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-ink">
                      Quality Assurance assistant
                    </p>
                    <p className="truncate text-[10px] text-muted">
                      {streaming
                        ? "Typing…"
                        : completed
                          ? "Conversation complete"
                          : "Online · confidential"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-[10px] text-muted">
                  <Lock size={11} aria-hidden="true" />
                  <span className="hidden sm:inline">This session</span>
                </div>
              </div>

              {!ready ? (
                <div className="flex flex-1 items-center justify-center">
                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-umu-red border-t-transparent" />
                </div>
              ) : (
                <div
                  ref={scrollRef}
                  onScroll={(event) => {
                    const element = event.currentTarget;
                    nearBottomRef.current =
                      element.scrollHeight - element.scrollTop - element.clientHeight < 140;
                  }}
                  className="chat-scroll flex-1 overflow-y-auto px-4 py-5 sm:px-6"
                >
                  <div className="space-y-4" role="log" aria-label="Conversation">
                    {messages.map((message, index) => {
                      const isLast = index === messages.length - 1;
                      return (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          streaming={streaming && isLast && message.role === "assistant"}
                          showCaret={
                            streaming &&
                            isLast &&
                            message.role === "assistant" &&
                            Boolean(message.content)
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {error ? (
                <div className="mx-4 mb-3 flex flex-col gap-2 rounded-xl border border-danger-line bg-danger-soft px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] leading-relaxed text-danger">{error}</p>
                  <button
                    type="button"
                    onClick={retry}
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-danger underline decoration-danger/30 underline-offset-2"
                  >
                    Try again
                    <ArrowRight size={12} aria-hidden="true" />
                  </button>
                </div>
              ) : null}

              {completed ? (
                <div className="bg-success-soft/40 px-4 py-3 sm:px-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success text-white">
                        <Check size={15} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-success">Conversation complete</p>
                        <p className="text-[10px] text-muted">
                          Thank you. Your feedback is recorded confidentially.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {report ? (
                        <button
                          type="button"
                          onClick={() => setReportOpen(true)}
                          className="btn-secondary min-h-[38px] gap-1.5 px-3 text-[11px]"
                        >
                          <ShieldCheck size={13} aria-hidden="true" />
                          QA summary
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setResetOpen(true)}
                        className="btn-ghost min-h-[38px] gap-1.5 px-3 text-[11px]"
                      >
                        <RotateCcw size={13} aria-hidden="true" />
                        New conversation
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-1/40 p-3 sm:p-4">
                  {firstTurn ? (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {["They were mostly okay", "It varied by unit", "There were serious issues"].map(
                        (reply) => (
                          <button
                            key={reply}
                            type="button"
                            onClick={() => sendMessage(reply)}
                            className="rounded-full border border-line bg-white px-3 py-1.5 text-[10px] font-medium text-muted transition-colors hover:border-umu-red/30 hover:bg-umu-red-soft hover:text-umu-red"
                          >
                            {reply}
                          </button>
                        ),
                      )}
                    </div>
                  ) : null}
                  <div className="flex items-end gap-2 rounded-2xl border border-line bg-white p-2 transition-colors focus-within:border-umu-red focus-within:ring-4 focus-within:ring-umu-red/10">
                    <label htmlFor="chat-input" className="sr-only">
                      Your message
                    </label>
                    <textarea
                      ref={inputRef}
                      id="chat-input"
                      value={input}
                      onChange={(event) => {
                        const element = event.currentTarget;
                        element.style.height = "auto";
                        element.style.height = `${Math.min(element.scrollHeight, 140)}px`;
                        setInput(element.value.slice(0, 1500));
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          sendMessage(input);
                        }
                      }}
                      rows={1}
                      placeholder={voice.listening ? "Listening… speak naturally" : "Type or tap the mic to answer…"}
                      className="max-h-[140px] min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-sm leading-relaxed text-ink placeholder:text-faint focus:outline-none"
                    />
                    {voice.supported ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (voice.listening) {
                            voice.stop();
                          } else {
                            appliedVoiceRef.current = "";
                            voice.start();
                          }
                        }}
                        disabled={streaming}
                        aria-pressed={voice.listening}
                        aria-label={voice.listening ? "Stop voice answer" : "Answer with your voice"}
                        title={voice.listening ? "Stop voice answer" : "Answer with your voice"}
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-30",
                          voice.listening
                            ? "animate-pulse-soft border-success-line bg-success-soft text-success"
                            : "border-line bg-surface-1 text-muted hover:border-umu-red/30 hover:text-umu-red",
                        )}
                      >
                        {voice.listening ? (
                          <MicOff size={17} aria-hidden="true" />
                        ) : (
                          <Mic size={17} aria-hidden="true" />
                        )}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || streaming}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-umu-red text-white transition-colors hover:bg-umu-red-dark disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Send message"
                    >
                      {streaming ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Send size={17} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {voice.interimText ? (
                    <p className="mt-2 px-1 text-[11px] italic text-muted" aria-live="polite">
                      Listening… {voice.interimText}
                    </p>
                  ) : null}
                  {voice.error ? (
                    <p className="mt-2 px-1 text-[11px] text-danger">{voice.error}</p>
                  ) : null}
                  <div className="mt-2 flex items-center justify-between px-1 text-[9px] text-faint">
                    <span>Enter to send · tap the mic to speak</span>
                    <span className="inline-flex items-center gap-1">
                      <Lock size={9} aria-hidden="true" />
                      Confidential
                    </span>
                  </div>
                </div>
              )}
              </section>
            </Reveal>

            <aside className="space-y-3">
              <Reveal delay={160}>
                <UnitsCard mentioned={mentioned} />
              </Reveal>
              <Reveal delay={220}>
                <ProgressCard coveredCount={mentioned.size} completed={completed} />
              </Reveal>
              <Reveal delay={280}>
                <ReportCard
                  state={reportState}
                  report={report}
                  completed={completed}
                  onOpen={() => setReportOpen(true)}
                  onRetry={() => {
                    setReportState("idle");
                    void generateReport(messages);
                  }}
                />
              </Reveal>
              <Reveal delay={340}>
                <HowCard />
              </Reveal>
            </aside>
          </div>
        </div>
      </div>

      <footer className="bg-white">
        <div className="container-page flex flex-col gap-2 py-6 text-[10px] text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>Uganda Martyrs University · Office of Quality Assurance</p>
          <p className="inline-flex items-center gap-1.5">
            <Lock size={11} aria-hidden="true" />
            Confidential. Reported in aggregate.
          </p>
        </div>
      </footer>

      <QaReportDrawer
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        report={report}
      />

      <ConfirmDialog
        open={resetOpen}
        title="Start a new conversation?"
        description="This clears the current conversation and its QA summary from this browser."
        confirmLabel="Start fresh"
        onConfirm={resetConversation}
        onCancel={() => setResetOpen(false)}
        destructive
      />
    </div>
  );
}
