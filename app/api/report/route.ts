import { cleanMessages, clientKey, jsonError, rateLimit, readLimitedJson } from "@/lib/api";
import { GeminiError, generateGeminiJson } from "@/lib/gemini";
import {
  REPORT_SCHEMA,
  REPORT_SYSTEM_PROMPT,
  formatTranscript,
} from "@/lib/prompts";
import { normalizeReport } from "@/lib/report";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  const limit = rateLimit(`report:${clientKey(request)}`, 12, 60_000);
  if (!limit.ok) {
    return jsonError("Too many requests. Please wait a moment and try again.", 429, limit.retryAfter);
  }

  const body = await readLimitedJson(request, 128_000);
  if (body instanceof Response) return body;

  const messages = cleanMessages((body as { messages?: unknown } | null)?.messages, {
    maxMessages: 60,
    maxChars: 48_000,
    requireLastUser: false,
  });
  if (!messages) {
    return jsonError("The conversation is too short to summarise.", 400);
  }

  const userTurns = messages.filter((message) => message.role === "user").length;
  if (userTurns < 3) {
    return jsonError("The conversation is too short to summarise.", 400);
  }

  const prompt = `CONVERSATION TRANSCRIPT\n\n${formatTranscript(messages)}\n\nProduce the JSON summary now.`;

  try {
    const raw = await generateGeminiJson<unknown>({
      systemInstruction: REPORT_SYSTEM_PROMPT,
      prompt,
      schema: REPORT_SCHEMA,
      temperature: 0.2,
      maxOutputTokens: 4096,
      signal: request.signal,
    });
    const report = normalizeReport(raw);
    return new Response(JSON.stringify({ report }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Gemini report request failed", error);
    const status = error instanceof GeminiError && error.status === 429 ? 429 : 502;
    return jsonError("The summary is unavailable right now. Please try again.", status);
  }
}
