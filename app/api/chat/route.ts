import { cleanMessages, clientKey, jsonError, rateLimit, readLimitedJson } from "@/lib/api";
import { GeminiError, streamGemini } from "@/lib/gemini";
import {
  SENTINEL,
  chatSystemPrompt,
  sanitizeStudentStream,
} from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

class SafeStreamFilter {
  private buffer = "";
  private readonly holdback = 64;

  push(chunk: string): { text: string; complete: boolean } {
    this.buffer += chunk;
    const sentinelIndex = this.buffer.indexOf(SENTINEL);
    if (sentinelIndex !== -1) {
      const text = this.buffer.slice(0, sentinelIndex);
      this.buffer = "";
      return { text: sanitizeStudentStream(text), complete: true };
    }
    if (this.buffer.length <= this.holdback) {
      return { text: "", complete: false };
    }
    const cut = this.buffer.length - this.holdback;
    const text = this.buffer.slice(0, cut);
    this.buffer = this.buffer.slice(cut);
    return { text: sanitizeStudentStream(text), complete: false };
  }

  flush(): string {
    const text = this.buffer;
    this.buffer = "";
    return sanitizeStudentStream(text);
  }
}

function extractText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }>;
  };
  return (record.candidates?.[0]?.content?.parts ?? [])
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("");
}

export async function POST(request: Request): Promise<Response> {
  const limit = rateLimit(`chat:${clientKey(request)}`, 30, 60_000);
  if (!limit.ok) {
    return jsonError("Too many requests. Please wait a moment and try again.", 429, limit.retryAfter);
  }

  const body = await readLimitedJson(request, 128_000);
  if (body instanceof Response) return body;

  const messages = cleanMessages((body as { messages?: unknown } | null)?.messages, {
    maxMessages: 40,
    maxChars: 24_000,
    requireLastUser: true,
  });
  if (!messages) {
    return jsonError("Please send a complete message before continuing.", 400);
  }

  const userTurns = messages.filter((message) => message.role === "user").length;
  if (userTurns > 12) {
    return jsonError("This conversation has already covered enough ground.", 400);
  }

  let gemini: Response;
  try {
    gemini = await streamGemini({
      systemInstruction: chatSystemPrompt(userTurns),
      messages,
      temperature: 0.7,
      maxOutputTokens: 700,
      signal: request.signal,
    });
  } catch (error) {
    console.error("Gemini chat request failed", error);
    const status = error instanceof GeminiError && error.status === 429 ? 429 : 502;
    return jsonError("The assistant is unavailable right now. Please try again.", status);
  }

  if (!gemini.body) {
    return jsonError("The assistant is unavailable right now. Please try again.", 502);
  }

  const encoder = new TextEncoder();
  const filter = new SafeStreamFilter();
  let closed = false;
  let sentAnyText = false;
  let completed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: Record<string, unknown>) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      const finish = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          return;
        }
      };

      try {
        const reader = gemini.body!.getReader();
        const decoder = new TextDecoder();
        let eventBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          eventBuffer += decoder.decode(value, { stream: true });

          let boundary = eventBuffer.indexOf("\n\n");
          while (boundary !== -1) {
            const event = eventBuffer.slice(0, boundary);
            eventBuffer = eventBuffer.slice(boundary + 2);
            boundary = eventBuffer.indexOf("\n\n");

            const data = event
              .split("\n")
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trimStart())
              .join("\n");
            if (!data) continue;

            let payload: unknown;
            try {
              payload = JSON.parse(data);
            } catch {
              continue;
            }

            const text = extractText(payload);
            if (!text) continue;

            const filtered = filter.push(text);
            if (filtered.text) {
              sentAnyText = true;
              send({ text: filtered.text });
            }
            if (filtered.complete) {
              completed = true;
              await reader.cancel().catch(() => undefined);
              send({ done: true, completed: true });
              finish();
              return;
            }
          }
        }

        const tail = filter.flush();
        if (tail) {
          sentAnyText = true;
          send({ text: tail });
        }

        if (!sentAnyText) {
          send({
            text: completed
              ? "Thank you — that is everything I needed. Your feedback is recorded confidentially."
              : "I'm sorry — I did not catch that. Could you say a little more?",
          });
        }

        send({ done: true, completed });
        finish();
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          finish();
          return;
        }
        console.error("Streaming chat failed", error);
        if (!sentAnyText) {
          send({ error: "The conversation had a hiccup. Please try again." });
        }
        send({ done: true, completed: false });
        finish();
      }
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
