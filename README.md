# UMU Course Evaluation

Student-centred course evaluation experiences for Uganda Martyrs University.

The app ships two experiences:

- **Focus mode** (`/solution1`) — one question at a time, with progress, timing, and resume support.
- **Conversation mode** (`/solution2`) — an AI-guided interview that produces a QA summary.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS
- Google Gemini API for the conversational experience

## Getting started

```bash
npm install
cp .env.example .env.local
# add your Gemini API key to .env.local
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Google Gemini API key. `GEMINI_KEY` and `gemini-key` are also accepted. |
| `GEMINI_MODEL` | No | Model name. Defaults to `gemini-3.5-flash`. |

Never commit `.env.local` or API keys. `.env*.local` is already gitignored.

## Scripts

```bash
npm run dev        # local development
npm run typecheck  # TypeScript check
npm run build      # production build
npm run start      # run the production build
```

## API routes

- `POST /api/chat` — streams the conversation response (rate limited to 30 requests/minute per IP).
- `POST /api/report` — generates the structured QA summary (rate limited to 12 requests/minute per IP).
- `GET /api/health` — readiness probe. Returns `200` when the Gemini key is configured, `503` otherwise.

## Deployment

The project deploys to any Node.js host. On Vercel:

1. Import the repository.
2. Add `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) under Project Settings → Environment Variables.
3. Deploy. Use `/api/health` as the health check.

The production build sets security headers (CSP, HSTS, frame protection, MIME sniffing protection) in `next.config.ts`.

## Rate limiting

Rate limiting uses an in-memory bucket store. It is enough for a single instance, but it is **not shared across serverless instances**. For multi-region or high-traffic production use, replace `lib/api.ts` rate limiting with a shared store such as Upstash Redis or Vercel KV.

## Data handling

- Focus mode and conversation state are stored in the browser's `localStorage`; nothing is persisted server-side.
- Conversation content is sent to the Gemini API only to generate responses and the summary.
- Responses are reported in aggregate; student names are not attached.
