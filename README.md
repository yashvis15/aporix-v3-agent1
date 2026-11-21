# Aporix (MVP)

Converts long PDFs into **optimized, task-specific context** for feeding into
another LLM, not a human-readable summary. Upload a PDF, state a goal
("summarize", "extract risks", "study for interview", "find key arguments"),
and get back a compressed, goal-relevant text extract plus a before/after
token count.

## Core flow

1. User uploads a PDF
2. User enters a goal
3. Server extracts text from the PDF (`pdf-parse`)
4. A single LLM call (Claude) analyzes relevance to the goal and compresses
   the text, removing irrelevant content
5. Response includes: optimized text, a short "what was removed" note, and
   original vs. optimized token estimates + % saved

## Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Next.js Route Handler (`app/api/optimize/route.ts`), Node.js runtime
- **PDF parsing:** `pdf-parse`
- **LLM:** Google Gemini API, single prompt/single call
- **Token counting:** lightweight heuristic estimator (no external tokenizer dependency)

No database, no auth, no multi-agent orchestration, no RAG - by design, for
the MVP. Hooks for those are left as typed stubs (see below).

## Project structure

```text
aporix/
├── app/
│   ├── api/
│   │   └── optimize/
│   │       └── route.ts        # POST endpoint: upload -> extract -> optimize -> respond
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # UI: upload, goal input, optimize button, results
├── lib/
│   ├── llm.ts                  # Single Anthropic API call + prompt
│   ├── pdfExtract.ts           # PDF -> raw text
│   ├── tokenCount.ts           # Token estimate + before/after stats
│   └── types.ts                # Shared types + future-extension stubs
├── .env.example
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Setup instructions

### 1. Prerequisites

- Node.js 18.18+ (or 20+ recommended)
- A Gemini API key: https://aistudio.google.com/app/apikey

### 2. Install dependencies

```bash
cd aporix
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```text
GEMINI_API_KEY=your-gemini-api-key   # required
GEMINI_MODEL=gemini-1.5-flash        # optional override (model name only, no "models/" prefix)
MAX_INPUT_CHARS=60000                # optional override
```

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000

### 5. Try it

1. Click the upload box and pick any text-based PDF (not a scanned image).
2. Enter a goal, e.g. `extract risks`.
3. Click **Optimize**.
4. Review the optimized context, the removal summary, and the token stats.

## Notes & limitations

- **Scanned/image-only PDFs are not supported** - this MVP extracts real
  text layers only (no OCR). Extend `lib/pdfExtract.ts` with an OCR step
  (e.g. Tesseract) later if needed.
- **Token counts are estimates**, not exact tokenizer output. `lib/tokenCount.ts`
  uses a char/word blended heuristic (~4 chars/token) to avoid pulling in a
  heavier tokenizer dependency. Swap in `tiktoken` or Anthropic's token-count
  endpoint later without changing the function signature.
- **Large PDFs are truncated** to `MAX_INPUT_CHARS` before the LLM call to
  control cost/latency. Extend with chunking + multiple calls for very long
  documents.
- **Single LLM call, single document, no persistence, no auth** - all
  intentional for MVP simplicity.

## Future extension hooks

These are referenced in code comments and `lib/types.ts` so they're easy to
wire in without a rewrite:

- **x402 pay-per-use API integration** - meter/charge per `/api/optimize`
  call. See `X402UsageRecord` in `lib/types.ts` and the comment block at the
  bottom of `app/api/optimize/route.ts`.
- **Multi-document support** - batch multiple PDFs into one goal-optimized
  context. See `MultiDocumentOptimizeRequest` in `lib/types.ts`.
- **Database storage** - persist uploads + optimization results. See
  `StoredDocument` in `lib/types.ts`.
- **User accounts** - scope storage/usage per user, gate the API route
  behind auth middleware.
- **Advanced agent workflows** - e.g. a relevance-scoring pass separate
  from a compression pass, or per-section chunked optimization for very
  long documents.

## Deploying

Works out of the box on Vercel (it's a standard Next.js App Router project).
Set `GEMINI_API_KEY` (and optional overrides) as environment variables in
your Vercel project settings before deploying.

## Testing

This project uses [Playwright](https://playwright.dev/) for end-to-end (E2E) tests written in TypeScript. E2E tests exercise Aporix like a real user—uploading a document, entering an optimization goal, submitting the form, and verifying rendered results—so they validate the frontend, API route, and application workflow together.

### What is tested

The regular (mocked) suite covers core user workflows without making real Gemini API calls:

- **Main optimization workflow** — upload a valid sample PDF in the optimization tool, enter a goal, submit, verify optimization completes, optimized context is displayed, token savings/quality metrics are shown, and the optimized output can be copied.
- **PDF upload validation** — uploading an unsupported file type shows an appropriate error, and submission is prevented when no file is provided.
- **User input validation** — submission is prevented when the optimization goal is missing or whitespace-only.
- **Error handling** — simulated API failures show an understandable error message and the UI does not get stuck in a loading state.
- **Results validation** — displayed results contain the expected fields (optimized text, removal summary, token/cost/latency/trust metrics) and values are consistent with the (mocked) API response.

Mocked tests run the real app against a local mock Gemini server (`tests/mock-gemini-server.mjs`) configured in `playwright.config.ts`, so **no production API keys are required** and no paid API calls are made.

An **optional, separate integration test** (`tests/e2e/real-ai.integration.spec.ts`) can exercise the real Gemini-backed pipeline. It is excluded from the regular suite and only runs when explicitly enabled with a real API key.

### Install dependencies

```bash
npm install
npx playwright install chromium
```

(On CI/Linux you may need system dependencies as well: `npx playwright install --with-deps chromium`.)

### Run tests locally

```bash
# Run the regular mocked E2E suite (starts mock Gemini server and dev server automatically)
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui

# Headed (visible browser) mode
npm run test:e2e:headed
```

To run the optional real-AI integration test (makes a real Gemini API call; may incur cost):

```bash
RUN_REAL_AI_TESTS=1 GEMINI_API_KEY=your-real-key npm run test:e2e:real
```

### View the Playwright HTML report

After a test run:

```bash
npm run test:e2e:report
```

This serves the report from `playwright-report/`. On failures, Playwright captures screenshots and traces in `test-results/`.

### GitHub Actions

`.github/workflows/playwright.yml` runs the mocked Playwright suite on pushes and pull requests. It installs dependencies and Chromium, runs tests without production API keys, and uploads the HTML report and failure artifacts (`playwright-report/`, `test-results/`) for each run from the workflow summary on GitHub.
