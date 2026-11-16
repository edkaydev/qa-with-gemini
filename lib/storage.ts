export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

export type EvaluationRecord = {
  answers: Record<string, string>;
  updatedAt: string;
  completedAt?: string;
};

export type EvaluationStore = Record<string, EvaluationRecord>;

const EVALUATION_KEY = "umu.qa.evaluations.v1";
const CONVERSATION_KEY = "umu.qa.conversation.v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

function remove(key: string): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    return;
  }
}

export function readEvaluations(): EvaluationStore {
  return read<EvaluationStore>(EVALUATION_KEY, {});
}

export function writeEvaluations(store: EvaluationStore): void {
  write(EVALUATION_KEY, store);
}

export function clearEvaluations(): void {
  remove(EVALUATION_KEY);
}

export function readConversation(): {
  messages: ChatMessage[];
  completed: boolean;
  report: unknown;
} | null {
  return read<{
    messages: ChatMessage[];
    completed: boolean;
    report: unknown;
  } | null>(CONVERSATION_KEY, null);
}

export function writeConversation(value: {
  messages: ChatMessage[];
  completed: boolean;
  report: unknown;
}): void {
  write(CONVERSATION_KEY, value);
}

export function clearConversation(): void {
  remove(CONVERSATION_KEY);
}

