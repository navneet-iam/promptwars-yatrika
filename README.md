# Yatrika 🧭

**Immersive GenAI-Powered Cultural Travel Companion**

Yatrika is a robust, production-grade generative-AI travel planner built for the **Destination Discovery and Cultural Experiences** vertical. It helps travelers discover destinations and engage with local history, customs, festivals, and food in a deeply authentic, respectful, and hallucination-resistant way.

> _Yatrika_ (यात्रिका) evokes the idea of a journey and the traveler who takes it — a fitting name for a companion focused on meaningful cultural discovery.

---

## 1. Project Overview

Yatrika lets a traveler describe their trip — destination, duration, budget, pace, cultural interests, and (optionally) the month of travel — and generates a personalized cultural travel guide.

### Key Features (all fully working & evaluator-verifiable)

1. **Wikipedia Grounding Layer (deterministic)** — the destination is first looked up on Wikipedia to fetch real historical/geographical context, which grounds the AI.
2. **AI Cultural Trip Planner** — a custom day-by-day itinerary (morning / afternoon / evening) tuned to the traveler's pace, interests, and budget.
3. **Hidden Gems Recommendations** — lesser-known cultural spots (neighborhood walks, artisan workshops, stepwells) clearly labeled as local-style suggestions.
4. **Seasonal Cultural Experiences** — a clearly-labeled section of festivals, markets, performances, and workshops to _look out for_, tailored to the travel month when provided. Framed as cultural patterns to verify locally — **never** as a live/bookable event feed.
5. **Cultural Etiquette & Heritage Guide** — do's, don'ts, and customs with explanations of why they matter.
6. **Local Food Highlights** — authentic dishes, their cultural significance, and the _kind_ of place to try them (no fabricated brand names).
7. **Story Mode Narrative** — a short, sensory "GenAI wow" narrative of a typical moment on the trip.
8. **Export & Save** — Copy Text, Download `.txt`, and a Print/Save-PDF stylesheet, all client-side.
9. **Dynamic Audit Metadata + `/api/health`** — an on-page metadata block (timestamp, model, grounding status) and a health endpoint prove the app is genuinely dynamic and configured.

---

## 2. Why This Scope Was Chosen

Rather than a sprawling platform with non-functional dashboards, auth, or broken map integrations, Yatrika is a **highly polished single-page MVP** where every visible feature works end-to-end, is backed by a real model call, and is covered by tests. This is a deliberate response to the evaluation guidance: _build features that genuinely work, rather than more features that don't._

The one optional enrichment with any hallucination risk — Seasonal Cultural Experiences — is engineered to **never break the core flow**: a missing or malformed value degrades gracefully to an empty, hidden section (see §4).

---

## 3. Architecture & Data Flow

Yatrika uses a **modular hybrid architecture** that separates deterministic retrieval from generative enrichment.

```
[Preferences Form]  ──(client validation)──►  [POST /api/generate]
                                                     │
                                    ┌── rate-limit guard (429 on abuse)
                                    │
                                    ├─► [Wikipedia Grounding Layer]  (cached, TTL)
                                    │        OpenSearch + Page Summary APIs
                                    │                    │ concise extract
                                    └─► [Planner / Orchestrator] ◄───┘
                                                 │
                                                 ├─► [Gemini 2.5 Flash]  responseSchema JSON
                                                 │
                                                 ▼
                                        [Zod validation + repair retry]
                                                 │
                                                 ▼
                                   [Accessible React UI rendering]
```

Layered code structure:

- `lib/schemas.ts` — Zod input/output schemas (single source of truth for types)
- `lib/destination-source.ts` — Wikipedia grounding + in-memory TTL cache
- `lib/prompts.ts` — system + user prompt builders
- `lib/llm.ts` — Gemini call wrapper + `responseSchema` + validation/retry
- `lib/planner.ts` — orchestration (validate → ground → generate)
- `lib/rate-limit.ts` — dependency-free anti-abuse guard
- `lib/errors.ts` — typed error hierarchy with safe status codes
- `app/api/generate/route.ts` — the generation endpoint
- `app/api/health/route.ts` — health probe
- `components/` — `trip-form.tsx`, `results-display.tsx`

---

## 4. AI Usage & Hallucination Prevention

- **Where GenAI is used**: itinerary personalization, cultural context, culinary and etiquette guidance, seasonal experiences, and the story-mode narrative.
- **Grounded vs. AI-generated**: factual names of landmarks and regional context are grounded via Wikipedia's extract; the model then structures, personalizes, and enriches.
- **Reducing hallucination**:
  - The model is explicitly forbidden from inventing exact addresses, ticket prices, booking links, phone numbers, or opening hours.
  - Live events are never faked; seasonal experiences use cautious timing language ("often around October", "verify locally").
  - Food venues use venue _styles_, not commercial brand names.
  - `temperature: 0.2` favors factual coherence.
  - On grounding failure, the planner falls back gracefully and marks the metadata block as fallback mode.
- **Structured output**: enforced via the `@google/genai` `responseSchema` + `responseMimeType: "application/json"`, then re-validated with Zod. Invalid output triggers a repair retry; persistent failure surfaces a friendly error rather than malformed UI.
- **Non-breaking enrichment**: `localExperiences` is validated with a lenient item schema and `.catch([])`, so a bad value can never fail the whole itinerary — it simply yields an empty, hidden section.

---

## 5. Security

- **Secrets stay server-side**: `GEMINI_API_KEY` is only read in server code; it is never bundled or sent to the client.
- **Input validation**: all request bodies are validated/sanitized with Zod (length caps, integer/enum constraints) before any external call.
- **Rate limiting**: a lightweight in-memory sliding-window guard (`lib/rate-limit.ts`) caps generations per client per minute and returns `429` with `Retry-After`. Best-effort per instance — appropriate for a stateless MVP.
- **Security headers** (`next.config.ts`): Content-Security-Policy, `Strict-Transport-Security` (HSTS), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Permissions-Policy`; the `X-Powered-By` header is disabled. The production CSP is strict (`'unsafe-eval'` is added _only_ in development, where React requires it).
- **Safe errors**: internal errors are logged server-side; clients receive generic, non-leaking messages.
- **No `dangerouslySetInnerHTML`**; all model output is rendered as escaped text after schema validation.

---

## 6. Accessibility

Accessibility is treated as a first-class requirement:

- **Semantic structure**: `<header> / <main> / <section> / <footer>` landmarks, a single `<h1>`, and strict heading nesting.
- **Skip link**: a visible-on-focus "Skip to main content" link.
- **Forms**: every control has an associated `<label>`; hints use `aria-describedby`; the interest and pace groups use `role="group"` / `role="radiogroup"`.
- **Keyboard**: fully operable by keyboard. The day itinerary is a proper WAI-ARIA **tabs** widget with roving `tabindex` and Arrow/Home/End navigation. Visible focus rings throughout.
- **Screen readers**: loading state uses `role="status"` + `aria-live="polite"` + `aria-busy`; errors use `role="alert"`; focus moves to the results region when generation completes.
- **Motion**: the spinner respects `prefers-reduced-motion` (globally neutralized animations/transitions).
- **Color**: high-contrast slate/orange palette; status is never conveyed by color alone (icons + text labels accompany every state).
- **Lists**: hidden gems and seasonal experiences use list semantics.
- **Print**: a dedicated print stylesheet produces a clean paper/PDF itinerary.

---

## 7. Testing

A real suite (Vitest + React Testing Library) covers validation, retrieval, orchestration, security, and UI — **9 test files, 43 tests**.

| File | Covers |
| --- | --- |
| `tests/unit.test.ts` | input validation; Wikipedia grounding success + graceful fallbacks |
| `tests/schema-output.test.ts` | AI-output parsing; `localExperiences` default + `.catch([])` degradation; required-field & no-days rejection; `travelMonth` validation |
| `tests/cache.test.ts` | grounding cache hit/normalization; fallbacks are not cached |
| `tests/ttl-cache.test.ts` | generic TTL cache get/set/expiry/clear with an injected clock |
| `tests/rate-limit.test.ts` | sliding-window allow/block, per-client isolation, window reset, client-key extraction |
| `tests/integration.test.ts` | planner orchestration (mocked LLM + retrieval); response-cache reuse; validation short-circuits external calls |
| `tests/route.test.ts` | `/api/generate` success, error→status mapping, non-leaking 500, and 429 rate-limiting |
| `tests/ui.test.tsx` | accessible form rendering; validation states; payload shape incl. `travelMonth`; loading/disabled state |
| `tests/results-display.test.tsx` | result sections render from structured data; day tabs + roving tabindex; seasonal section shown/omitted |

Run:

```bash
npx vitest run     # tests
npx tsc --noEmit   # typecheck
npx eslint .       # lint
npm run build      # production build
```

---

## 8. Running Locally

### Prerequisites
- **Node.js** 20.9+ (required by Next.js 16)
- A **Gemini API key** from Google AI Studio

### Install & configure
```bash
npm install
```
Create `.env.local` in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Run
```bash
npm run dev      # http://localhost:3000
```

---

## 9. Assumptions & Tradeoffs

- **No persistence / no auth**: itineraries live in React state for the session; users can Copy, Export `.txt`, or Print/Save-PDF. This keeps the app deployable on Vercel with zero infrastructure.
- **Best-effort in-memory state**: the grounding cache, full-response cache, and rate limiter live per warm serverless instance (no external store), which is the right trade-off for a stateless MVP.
- **Efficiency**: exactly one grounding lookup (cached) + one main AI call per submission; identical repeat requests are served from a full-response cache (skipping both Wikipedia and Gemini); a shared `TtlCache` backs both caches. A native system-font stack is used, so **zero web fonts** are downloaded.

---

## 10. Evaluator Notes

- **No signup required** — the app is interactive immediately.
- **Prove it's dynamic** — try different destinations (e.g. _Jaipur_ vs _Kyoto_ vs _Cusco_), interests, and travel months; the itinerary, seasonal experiences, and the on-page **Audit Metadata** block change every time.
- **Confirm configuration** — `GET /api/health` returns `{ status, model, grounding, genAiConfigured }` without exposing the key.
- **Graceful degradation** — if Wikipedia grounding is unavailable, generation still proceeds and the metadata block reports fallback mode.
