# 09 — external dependencies

Every external dependency FixAIR relies on: CDN scripts, third-party APIs, DNS / domains, environment variables. Per dependency: what it provides, where it's called, the replaceability flag, and the cost structure.

**Replaceability legend:**
- **Replaceable** — swappable in days; multiple market alternatives with similar ergonomics.
- **Locked-in** — hard swap; domain data lives in the provider, APIs are not portable, or the product has no comparable alternative.
- **Partial** — swappable with effort (e.g. a week of engineering plus a data migration).

**Scope.** `/home/user/FE` at branch `audit-v2/deep-dive-for-qbe`.

---

## CDN scripts

FixAIR ships no bundler and no package manager — every runtime dependency is loaded from a public CDN at page load. Catalog below built from direct inspection of the entry HTML files.

| Library | Version | CDN URL | Loaded by | Integrity? |
|---|---|---|---|---|
| Supabase JS | `@2` (major-latest) | `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2` | 11 files: `master:10`, `admin:10`, `manager:10`, `operations:10`, `auth:9`, `technician:5525`, `invite:9`, `r:18`, `debug:7`, `index:4731`, `docs:4925` | **No SRI** |
| Mapbox GL JS | 2.15.0 (pinned) | `https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js` | `operations:8` | **No SRI** |
| Mapbox GL CSS | 2.15.0 (pinned) | `https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css` | `operations:9` | **No SRI** |
| Tesseract.js | `@5` (major-latest) | `https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js` | `technician:5526`, `index:4732`, `docs:4926` | **No SRI** |
| `jsPDF` | 2.5.1 (pinned) | `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js` | `technician:5528`, `index:4734`, `docs:4928` | **No SRI** |
| `docx` | 8.5.0 (pinned) | `https://unpkg.com/docx@8.5.0/build/index.umd.js` | `technician:5530`; sample generator at `samples/generate-sample.html:6` uses `index.umd.min.js` (same version) | **No SRI** |
| `FileSaver.js` | 2.0.5 (pinned) | `https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js` | `technician:5532`, `samples/generate-sample.html:7` | **No SRI** |
| Mermaid | `@10` (major-latest) | `https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js` | `master:12`, `technician:5534`, `docs:4930` | **No SRI** |
| Google Fonts (CSS) | — | `https://fonts.googleapis.com/css2?family=Inter:wght@…` | 11 files; weights differ — technician/operations/auth/docs/r/invite/index/404 load 300–800, master/admin/manager load 400–700 only | **No SRI (CSS can't easily be SRI-pinned against CDN-rewritten font URLs)** |

**Observations.**
1. **Zero SRI coverage.** No `<script>` in any entry HTML carries `integrity="sha384-…"`. A CDN compromise (jsDelivr, cdnjs, and unpkg have all been supply-chain targets) silently ships modified JS. See §08 §N3.
2. **Four JS CDN providers.** jsDelivr (Supabase, Tesseract, Mermaid), cdnjs (jsPDF, FileSaver), unpkg (docx), `api.mapbox.com` (Mapbox). Plus Google Fonts. Five third parties must each stay up for the app to fully work.
3. **Mixed pinning discipline.** Four libraries are pinned to exact patches (Mapbox 2.15.0, jsPDF 2.5.1, docx 8.5.0, FileSaver 2.0.5) — good. Three libraries track the major (`@2`, `@5`, `@10`) — new minors land in production without a code change.
4. **Lazy-loaded libraries** (`docx`, `jsPDF`, `FileSaver`, Tesseract, Mermaid) only cost bandwidth when their feature triggers. Good for cold-load performance; the only runtime dependency on every page is Supabase.
5. **Replacement cost.** All CDN libraries are replaceable — vendoring them in a `/vendor/` directory and adding SRI is a one-afternoon task for a Qbe rebuild.

---

## npm / package manager

**No `package.json` at the repo root.** Verified. No `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, or `node_modules/` at the root.

**One exception — `samples/package.json`.** A small tooling directory under `samples/` contains its own `package.json` with two dependencies (`docx ^9.5.1`, `file-saver ^2.0.5`) plus its own `package-lock.json` and `node_modules/`. It is used by `samples/generate-sample.html` to produce example reports. This is **not** part of the production app build — the production technician app pulls its `docx` from CDN at v8.5.0 (different major version from the samples tool). Worth noting because any Qbe rebuild should normalize on one `docx` major to avoid subtle API drift.

**No build config for the main app** — no `vite.config.*`, `webpack.config.*`, `tsconfig.json`, `rollup.config.*`, `esbuild.config.*`.

This is a **monolithic HTML codebase**. Each entry HTML is self-contained, with inline CSS and inline JS plus CDN imports. The only "build step" is pushing to Git — Cloudflare Pages serves the files as-is.

**Consequences.**
- No dependency auditing (no `npm audit`, no Dependabot).
- No tree-shaking, no minification of our own code.
- No TypeScript — every type error surfaces at runtime, in production.
- No lint / format gates in CI (there is no CI for JS in this repo).

**Verdict.** A Qbe rebuild should introduce a proper toolchain: Vite + TypeScript + ESLint, plus Dependabot for CDN replacements once vendored. One afternoon of setup buys years of audit trail.

---

## Third-party APIs

Each section below covers one upstream service FixAIR integrates with. Sections cover: surface, where it's called, auth mechanism, replaceability, cost structure.

### Supabase
- **What it provides.** Authentication (email+password, magic link), Postgres database + REST + realtime channels (realtime enabled server-side but **not used** client-side — see §05), Storage (company logos, project photos).
- **Project URL.** `https://fwuhzraxqrvmpqxnzpqm.supabase.co` — hardcoded in every entry HTML (e.g. `operations/index.html:1279`).
- **Client usage.** Loaded from CDN at `@supabase/supabase-js@2`. Initialized in each entry file with URL + anon key constants. All DB reads/writes go through `.from(…)`; auth via `.auth.*`; storage via `.storage.*`.
- **Auth.** Anon key in client (expected, public by design). Real auth enforced by RLS policies — see `audit-v2/01b_supabase_rls.sql`.
- **Replaceability.** **Locked-in.** Supabase combines auth, Postgres, realtime, and storage — replacing it means replacing four distinct services (e.g. Auth0 + plain Postgres + Pusher/Ably + S3). Row-Level Security policies also don't port trivially to non-Supabase Postgres. A Qbe rebuild should treat Supabase as the single vendor most committed to.
- **Cost structure.** Per-project pricing: Free → Pro ($25/mo) → Team ($599/mo) → Enterprise (negotiated). Row count and storage are the main dials. FixAIR's row sizes (inline base64 signatures + logos + photos — see §02) push the storage dimension harder than most SaaS apps.

### Anthropic (Claude)
- **What it provides.** The LLM behind the assistant / extraction / OCR n8n flows.
- **Client usage.** **None directly from browsers.** No `https://api.anthropic.com` references in any entry HTML. The browser only talks to n8n; n8n holds the Anthropic credential server-side.
- **Where it's used.** Per `audit-v2/03_n8n_flows.md`: the `fixair-assistant-dev` flow (conversational), the `fixair-extraction-dev` flow (structured data extraction), the `fixair-ocr` flow (vision fallback before Tesseract kicks in).
- **Model.** Inferred from flow prompts — Claude Sonnet / Opus class (n8n-server-side; exact model is a property of the flow, not this repo).
- **Replaceability.** **Replaceable** at the flow level, **locked-in** at the product level. Swapping Claude for GPT or Gemini is editing the model parameter in three n8n flows — a day's work plus re-evaluation of prompt quality.
- **Cost structure.** Per-token usage. Assistant calls are the volume driver; extraction calls fire once per user message (see §03 / §04 §10 — no dedup, no caching).

### OpenAI
- **What it provides.** Not currently used. Grepping entry HTMLs for `api.openai.com` returns zero hits.
- **Potential use.** The n8n extraction or assistant flow *could* use OpenAI as a model source — the flow JSON is not in this repo (§03 appendix). If any flow does, the credential lives in n8n only; browser never sees it.
- **Replaceability.** N/A until usage confirmed.
- **Cost structure.** Per-token if enabled.

### ElevenLabs
- **What it provides.** Speech-to-text for the voice-capture feature.
- **Endpoint.** `https://api.elevenlabs.io/v1/speech-to-text`, POSTed from browser.
- **Client usage.** Called directly from the browser (not proxied).
  - `technician/index.html:16869` (fetch key via `getApiKey`) / `:16879` (send `xi-api-key` header).
  - `admin/index.html:3569` / `manager/index.html:3697`.
- **Auth.** The API key is a long-lived secret. **Shipped to the browser** — hardcoded at `admin/:2604` and `manager/:2675` (byte-identical), and fetched from Supabase `app_settings` in the technician app. See §08 H1 / H2.
- **Replaceability.** **Replaceable.** OpenAI Whisper (via their API, or self-hosted), Deepgram, AssemblyAI, and Google Speech-to-Text are all drop-ins; the API surface differs but the pattern is identical.
- **Cost structure.** Per-second of audio billed at a premium vs competitors. ElevenLabs is on the expensive end of STT; if Qbe is cost-sensitive, Whisper-via-OpenAI is roughly 10× cheaper for comparable accuracy on French.

### Mapbox
- **What it provides.** Vector map tiles, the GL JS rendering library, and the custom FixAIR style (`mapbox://styles/fixair/cmkrnkhsl001b01r65zopewtt`).
- **Client usage.** `operations/index.html` only. Token at `:4635`, map init at `:4630`.
- **Auth.** Public "access token" (`pk.ey…`). Mapbox tokens are meant to be public but should be URL-restricted in the Mapbox dashboard — verification status for this token is unknown (§08 M4).
- **Replaceability.** **Partial.** MapLibre GL is a near-drop-in fork (same API, different tile source). OpenStreetMap tiles via MapTiler or Stadia Maps are the free-ish alternative; the custom style would need to be re-authored. Fully swapping Mapbox out is 1–2 weeks of work.
- **Cost structure.** First 50k map loads / month free, then per-1k tier. Operations dashboard is low-traffic (manager count × daily sessions), so cost is modest.

### n8n
- **What it provides.** The workflow runtime that bridges the browser to LLMs, email, and admin operations. Six webhooks documented in `audit-v2/03_n8n_flows.md`.
- **Host.** `https://cherhabil.app.n8n.cloud` — n8n Cloud SaaS.
- **Client usage.** Every entry HTML POSTs to `/webhook/fixair-*` paths. Auth is per-webhook: the three technician-side flows have no auth (anyone with the URL can POST); the three master-side flows authenticate on the master-key shared secret (§08 C1).
- **Replaceability.** **Replaceable at high cost.** Any workflow engine (Temporal, Inngest, Trigger.dev, even plain Supabase edge functions) could replace n8n, but the flow graphs themselves — including the system prompts and the Pinecone lookups — have to be reimplemented. A Qbe rebuild might skip n8n entirely and run the same logic as TypeScript server functions; the n8n visual-editor convenience is not a hard lock-in.
- **Cost structure.** n8n Cloud: pay-per-execution on their hosted plan ($20+/mo tiers). Self-hosting n8n is free software (fair-code license) — probably where Qbe ends up.

---

## Other third-party APIs and services

### Stripe (payment link only)
- **What it provides.** Subscription billing. The upgrade button opens a hosted Stripe Checkout page.
- **Client usage.** No Stripe SDK is loaded. The only integration is a hardcoded payment link at `technician/index.html:18515` (inside `FREEMIUM_CONFIG`): `https://pay.fixair.ai/b/dRm7sKa3MbPAgxdfgR2VG00`.
- **Auth.** None client-side. The checkout page is public and Stripe handles auth at the session level.
- **Replaceability.** **Replaceable.** The link is one string. Swapping to Paddle, Lemon Squeezy, or a self-hosted Stripe Checkout is a one-line change in the client and a flip of the server-side billing webhook (which, per §04 §13 and §08 M9, **does not exist** — "the Stripe webhook is planned but not built"). That gap is a production bug, not just an integration risk.
- **Cost structure.** Standard Stripe: 2.9% + €0.25 per transaction (EU rates). Revenue lives in Stripe; churn events (cancellation) must be webhook-driven to flip `users.subscription_tier` back to `free`, which today is not wired.

### Google Fonts
- **What it provides.** The Inter typeface.
- **Client usage.** Loaded as CSS from `https://fonts.googleapis.com/css2?family=Inter:wght@…` on most entry pages. Weights differ: technician/operations/auth/docs/404 load 300–800; master/admin/manager load 400–700 only.
- **Replaceability.** **Replaceable.** Self-host the Inter font files (available under SIL OFL); a cold-load performance win. Google Fonts is gratis but adds a third-party hop and a GDPR consideration (Google receives the user's IP on every page load — a German court ruled against this pattern in 2022).
- **Cost structure.** Free.

### ElevenLabs Conversational AI
- **What it provides.** In addition to speech-to-text (already covered above), ElevenLabs' Conversational AI agents appear to be wired in the public landing page.
- **Client usage.** Agent IDs referenced at `index.html:13232–13277`. Not yet deeply documented in this audit — flagged as a **follow-up item**: verify whether this is a live feature in production, a marketing demo, or an abandoned experiment. If live, the same API-key-leak risk as STT applies.
- **Replaceability / cost.** Same as STT ElevenLabs: replaceable with any conversational-agent provider; premium pricing.

### No analytics, no error tracking, no marketing SDKs
- **Google Analytics / Plausible / Mixpanel / Segment** — zero hits in grep.
- **Sentry / LogRocket / Datadog RUM** — zero hits. Production errors are swallowed (see §08 M7) and never reach an observability tool. For a field app, this is a notable gap: a technician who hits a bug has no way to generate a bug report short of a screen recording.
- **Intercom / Crisp / HubSpot** — zero hits. Support contact is via the master-dashboard impersonation flow (see §07 §3 and §08 C1).
- **Implication for Qbe.** Wire an error tracker on day one (Sentry is the obvious pick). Wire a minimal analytics backbone (PostHog or Plausible — both GDPR-friendlier than Google). The lack of telemetry is masking unknown-unknowns in the current app.

---

## DNS and domains

**Primary domain.** `go.fixair.ai` — set in `CNAME` at line 1. Resolves to Cloudflare Pages.

**Hosting.** Cloudflare Pages. Evidence:
- `_redirects` file (Cloudflare Pages + Netlify syntax compatible) — see below.
- `_routes.json` with `version: 1, include: ["/*"], exclude: [static assets]` — the Cloudflare Pages Functions routing manifest.

**Route map** (from `_redirects`):
- `/` → `/technician` (301) — root redirects to the technician app.
- `/technician/*` → `/technician/index.html` (200) — SPA fallback.
- `/admin/*`, `/manager/*`, `/master/*` — SPA fallbacks for each admin surface.
- `/r/:code` → `/r/index.html` (200) — clean URLs for referral links (e.g. `/r/julien4829`).

**Fixair-owned subdomains referenced in source.**
- `go.fixair.ai` — the primary app host (technician, admin, manager, master, ops, auth, r, docs, invite).
- `pay.fixair.ai` — Stripe payment host (`technician/index.html:18515`). Likely a Stripe-hosted vanity domain pointing at a Payment Link.

**Supabase project.** `https://fwuhzraxqrvmpqxnzpqm.supabase.co` — hardcoded in every entry HTML. Project-ref `fwuhzraxqrvmpqxnzpqm`.

**n8n host.** `https://cherhabil.app.n8n.cloud` — n8n Cloud tenant. The subdomain `cherhabil` is likely a username / org name; all webhooks hang off `/webhook/…` paths.

**Third-party hosts referenced.**
- `api.elevenlabs.io` (STT + conversational AI).
- `api.mapbox.com` (tiles + JS library).
- `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`, `unpkg.com` (three JS CDNs — see §CDN scripts).
- `fonts.googleapis.com`, `fonts.gstatic.com` (Google Fonts CSS + font files).
- `api.stripe.com` — **not called directly**; only the Payment Link host `pay.fixair.ai`.

**Operational implications.**
1. **No www / apex split** visible here — `fixair.ai` apex is not in this repo, may or may not redirect. Verify DNS out-of-band.
2. **DNS management happens at Cloudflare** (implied by Pages hosting). CNAME alone doesn't prove it — could be any registrar pointed at Cloudflare name servers.
3. **Single-point-of-failure: `go.fixair.ai`.** Every surface lives under one hostname; a Pages outage darkens the entire product. Acceptable for the scale, worth flagging for any Qbe rollout that adds contractual uptime commitments.

---

## Environment variables and where they live

**There are no environment variables.** Grep confirms:
- No `process.env.*` references.
- No `import.meta.env.*` references.
- No `window.ENV` / `window.__ENV__` references.
- No `.env`, `.env.local`, `.env.production` files.

This is a consequence of the no-build-step architecture: there is no moment between "edit source" and "serve HTML" where a `.env` could be substituted in. Every configuration value is a `const` literal in the source.

### Effective "env vars" — what's actually hardcoded

| Value | Type | Declared at | Used across |
|---|---|---|---|
| `SUPABASE_URL` | string | `master/index.html:1279`, `operations/index.html:2410`, `technician/index.html:6746`, and 8 more — same string in every entry HTML | all files |
| `SUPABASE_ANON_KEY` | string (JWT) | one-below `SUPABASE_URL` in each file (e.g. `master/index.html:1280`) | all files |
| `MAPBOX_TOKEN` | string (`pk.eyJ1…`) | `operations/index.html:4635` (as `mapboxgl.accessToken`) | operations only |
| `ELEVENLABS_API_KEY` | string (`sk_22d550…`) | **hardcoded** at `admin/index.html:2604`, `manager/index.html:2675`; **fetched at runtime from `app_settings`** in `technician/index.html:7481` | technician, admin, manager, docs, public index |
| `N8N_WEBHOOK_URL` (approval) | string | `master/index.html:1281` | master only |
| `SUPPORT_CONFIG.masterKey` | string (`'FixAIR_Houssam_2026!'`) | `master/index.html:2513` | master only |
| `SUPPORT_CONFIG.webhookUrl` | string | `master/index.html:2512` | master only |
| `API_BASE` (n8n webhook root) | string | `technician/index.html:7465`, `index.html:5973` | technician, public index |
| `ASSISTANT_WEBHOOK` | string | `technician/index.html:9492` | technician |
| `EXTRACTION_WEBHOOK` | string | `technician/index.html:9494` | technician |
| `OCR_WEBHOOK_URL` | string | `technician/index.html:17265` | technician |
| `EMAIL_SEND_WEBHOOK` | string | `master/index.html:3508` | master |
| Upgrade Stripe URL | string | inside `FREEMIUM_CONFIG` at `technician/index.html:18515` | technician |
| Owner-bypass UUID | string | `technician/index.html:18584` (inside `FREEMIUM_CONFIG`) | technician |
| **Static fallback mock data** | objects | `operations/index.html:4614–4622` (team), `admin/index.html:2600`, `manager/index.html:2671` (projects) | ops, admin, manager |

### Implications
1. **Rotating any secret requires a deploy.** Cloudflare Pages commit → build → invalidate. Not a one-minute action; on the order of 5–10 minutes per rotation.
2. **Per-file drift.** The anon key is the same in eleven files but there is no enforcement. A file that falls out of sync with the current key silently 401s.
3. **No dev / staging / prod separation.** One project URL, one anon key, one n8n tenant. A developer running locally writes against the production Supabase. This is by far the biggest quality-of-life issue for any future contributor.

### Recommendation for Qbe
Adopt Vite with `.env.*` files and typed env access (`import.meta.env.VITE_*`). Split dev / staging / prod Supabase projects. Keep public values (anon key, Mapbox token) in `.env.production` committed to the repo; move secrets (ElevenLabs key, master key) to server-side n8n credentials where they belong.

