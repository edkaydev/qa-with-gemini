import type { TranscriptMessage } from "./prompts";

const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export class GeminiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "GeminiError";
    this.status = status;
  }
}

export function getApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ??
    process.env.GEMINI_KEY ??
    process.env["gemini-key"] ??
    ""
  );
}

export function getModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function thinkingConfig(): { thinkingConfig?: { thinkingBudget: number } } {
  return /-lite(?:\b|$)/.test(getModel()) ? {} : { thinkingConfig: { thinkingBudget: 0 } };
}

function contentsFor(messages: TranscriptMessage[]) {
  return messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
}

async function request(
  endpoint: "generateContent" | "streamGenerateContent",
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<Response> {
  const key = getApiKey();
  if (!key) {
    throw new GeminiError("The Gemini API key is not configured.", 500);
  }

  const model = getModel();
  const suffix = endpoint === "streamGenerateContent" ? "?alt=sse&key=" : "?key=";
  const url = `${API_BASE}/models/${encodeURIComponent(model)}:${endpoint}${suffix}${encodeURIComponent(key)}`;
  const attempts = 3;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (signal?.aborted) {
      throw new DOMException("The request was cancelled.", "AbortError");
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
        cache: "no-store",
      });

      if (response.ok) return response;

      const text = await response.text().catch(() => "");
      let message = `Gemini returned ${response.status}.`;
      try {
        const parsed = JSON.parse(text) as {
          error?: { message?: string };
        };
        if (parsed.error?.message) message = parsed.error.message;
      } catch {
        if (text) message = text.slice(0, 300);
      }

      const retryable = response.status === 429 || response.status >= 500;
      if (retryable && attempt < attempts - 1) {
        await delay(1200 * (attempt + 1) + Math.random() * 500);
        continue;
      }

      throw new GeminiError(message, response.status);
    } catch (error) {
      if (error instanceof GeminiError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      if (attempt < attempts - 1) {
        await delay(1200 * (attempt + 1) + Math.random() * 500);
        continue;
      }
      throw new GeminiError(
        error instanceof Error ? error.message : "Gemini request failed.",
      );
    }
  }

  throw new GeminiError("Gemini request failed.");
}

export async function streamGemini(options: {
  systemInstruction: string;
  messages: TranscriptMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}): Promise<Response> {
  return request(
    "streamGenerateContent",
    {
      systemInstruction: { parts: [{ text: options.systemInstruction }] },
      contents: contentsFor(options.messages),
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxOutputTokens ?? 700,
        ...thinkingConfig(),
      },
    },
    options.signal,
  );
}

export async function generateGeminiJson<T>(options: {
  systemInstruction: string;
  prompt: string;
  schema: Record<string, unknown>;
  temperature?: number;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}): Promise<T> {
  const response = await request(
    "generateContent",
    {
      systemInstruction: { parts: [{ text: options.systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: options.prompt }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxOutputTokens ?? 2048,
        responseMimeType: "application/json",
        responseSchema: options.schema,
        ...thinkingConfig(),
      },
    },
    options.signal,
  );

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text = (payload.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new GeminiError("Gemini returned an empty response.");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new GeminiError("Gemini returned an invalid JSON response.");
  }
}
