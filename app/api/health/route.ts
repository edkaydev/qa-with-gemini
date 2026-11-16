import { getApiKey, getModel } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const configured = Boolean(getApiKey());

  return Response.json(
    {
      status: configured ? "ok" : "degraded",
      checks: { gemini: configured },
      model: getModel(),
    },
    {
      status: configured ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
