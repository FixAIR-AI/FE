# 10 — Qbe transformation plan

The actionable output of the audit. Each earlier doc identified what FixAIR is; this one says what Qbe does with it. Seven sections:

- **A. Keep verbatim** — the parts of FixAIR that survive a Qbe rebuild intact.
- **B. Modernize** — concepts that survive; implementations that are replaced.
- **C. Discard** — patterns Qbe deliberately does not port.
- **D. Add new** — capabilities Qbe ships that FixAIR does not have.
- **E. Vertical-abstraction contract** — the exact interface each new vertical (Qbe electricians, future verticals) must implement.
- **F. Migration sequence** — week-by-week plan plus cut-over strategy.
- **G. Open questions** — business decisions this plan guessed and wants confirmed.

**Assumptions (flag if wrong).**
- Target stack: Next.js 15 App Router, TypeScript strict, pnpm + Turborepo monorepo, Tiptap + Yjs for the drawer, Supabase (Postgres + Auth + Storage + realtime), Supabase Edge Functions for LLM calls, Playwright for PDF rendering, Stripe for billing, Resend for email, Sentry for errors, PostHog for product analytics.
- First vertical: electricians (Qbe). Second vertical (HVAC / "FixAIR classic") ported from the FixAIR shape in §02.
- Primary language: French. English slot present from day one but not translated.
- Single Postgres schema, multi-tenant via `organizations` + RLS.

---

## A. Keep verbatim (or near-verbatim)

The parts of FixAIR that are right in design and can be ported with only a framework translation. These are the decisions worth preserving — do not second-guess them during the rebuild.

### A1. Data contract for `projects.extracted_data` (HVAC shape)
- **Source.** §02 `projects.extracted_data` table (the full anonymized example and field reference).
- **Why keep.** The shape is battle-tested against real technician output and a real n8n extraction loop. It encodes three years of domain learnings: the `equipements ↔ systeme` bidirectional sync, the `fluide / fluide_global / root-level charge_*` triple, the `reserves` coerced-to-object handling.
- **How to port.** Lift the field list verbatim into `packages/verticals/hvac/slot-schema.ts` as a Zod-typed JSON shape. Drop the legacy duplicates (`conclusion`/`status_intervention` at root, `photos[]` duplication against `projects.photos`) per §02 known-issues — those are the *only* fields we don't carry forward.

### A2. Report-progress calculation (`calculateReportCompletion`)
- **Source.** `technician/index.html:7135`.
- **Why keep.** The weights — which fields count more — reflect what a well-formed report looks like. Replicating the math verbatim gives Qbe users a completion bar that behaves the same way on day one, which matters if any FixAIR users migrate in.

### A3. The chat → extraction → merge loop (conceptually)
- **Source.** §03 (the flow contract) and §04 §5 + §9 + §10 (the client path).
- **Why keep.** Two independent passes — a conversational LLM reply *and* a structured extraction — is the right decomposition. Conversational agents that also emit structured output blur two concerns; keeping them separate is Qbe's best inheritance from FixAIR.
- **How to port.** Two Supabase Edge Functions: `/api/chat` (streaming text) and `/api/extract` (structured JSON). Same separation, no n8n in the middle.

### A4. The 12-document report template set (structure, not impl)
- **Source.** Used across the export path in `technician/index.html:10943–11983`.
- **Why keep.** "12 templates × 12 brand styles" is a real product surface — technicians pick the right template for their intervention type. The template *structure* (sections, required fields, order) is domain knowledge; the 144-combination matrix is a feature, not a bug.
- **How to port.** Express each template as a Tiptap JSON block tree under `packages/verticals/hvac/templates/*.json`. Brand styles become Tailwind theme tokens under `packages/design/brands/*.ts`.

### A5. French-locale defaults with i18n slot present
- **Source.** `toLocaleDateString('fr-FR')`, FR status enums (`resolu` / `non_resolu` / …), prefix-strip regexes in `normalizeReportData`.
- **Why keep.** 100% of FixAIR users are French; the FR coupling exists because it's the correct default. Qbe ships with `fr` default but wraps every user-facing string in `next-intl` so English lands as a config flip, not a refactor.

### A6. Gamification hook (home tile + confetti)
- **Source.** §04 §2 — ring gauge, count-up, confetti on euro milestones.
- **Why keep.** Real product hook with demonstrable engagement effect. Same math, same component.
- **How to port.** `stats` view in Postgres (replacing the session-derived calc), `<StatsRing />` React component, `react-confetti` or a CSS-only implementation.

### A7. Two-step email → password login UX
- **Source.** `technician/index.html:7747` (`nextLoginStep`) and the slider `#loginSlider`.
- **Why keep.** Better than a combined form for the "is this account approved?" gate — the approval state is checked before the user wastes time typing a password. UX win, no rebuild needed.

### A8. Referral mechanic (share → week-free → ambassador)
- **Source.** §04 §14.
- **Why keep.** Viral loop is sound; only the implementation (localStorage tracking, `console.log` analytics stub) is broken.
- **How to port.** Typed `referrals` table, server-side attribution at the link-click redirect, conversion list in the UI. Same business rules, typed implementation.

### A9. Drawer-as-right-side-sheet interaction
- **Source.** `#reportSheet` / `#reportBackdrop` + `openReport()` / `closeReport()`.
- **Why keep.** Right-side editable drawer next to an active chat is the right layout for this workflow. Users have muscle memory.
- **How to port.** Radix Dialog or Vaul (shadcn/ui pattern) with `modal=false` for non-blocking edit. Drawer *content* is rebuilt (see §B); drawer *shell* is identical behavior.

### A10. Operations map (Mapbox) as the default command surface
- **Source.** §06 §3.
- **Why keep.** A map is the right affordance for a field-tech ops view. Mapbox is the right vendor.
- **How to port.** `react-map-gl`, same style id, same marker pattern. Server-side geocoding on project insert (fixing a §06 named gap).

### A11. Signature capture as two base64 PNGs (client + technician)
- **Source.** §04 §8.
- **Why keep.** Two distinct captures with nom-fields beside them matches the paper-world artifact. The *storage* changes (PNG file in Supabase Storage, URL in the row) but the *data model* — one signature per party, captured on-device — is correct.

### A12. Calendar-event → project binding
- **Source.** §04 §12 — `calendar_events.project_id` FK.
- **Why keep.** Scheduling an intervention and opening its report should be one click. The binding is right.
- **How to port.** Drop the "assistant event creates a project" side effect (§04 §4 Rewrite verdict); keep the FK. Project creation becomes explicit; calendar events reference whichever projects exist.

---

## B. Modernize

Concepts that survive; implementations replaced. Each item below has: FixAIR source, Qbe target, design sketch.

### B1. The drawer — FixAIR `innerHTML` + contenteditable → Qbe Tiptap + Yjs + React

- **FixAIR source.** `technician/index.html:9324` (`openReport()`), `:12504` (`updateDrawerPreview`), `:14344` (`renderReportPreviewV12` — the massive template-literal renderer), `:15088` (`drawerExtractDataFromDOM`), `:14962` (`drawerAutoSave` with the 800 ms debounce). The whole §04 §9 + §10 surface.
- **Qbe target.** `apps/technician/app/(drawer)/report/[id]/page.tsx` mounting a Tiptap editor whose document is a Yjs `Y.Doc` synchronized via a Supabase realtime channel per-project.
- **Design sketch.** A Tiptap editor with custom **block nodes** — one node per semantic section of the report (`<ClientBlock/>`, `<SystemBlock/>`, `<MeasurementsTable/>`, `<WorkDoneList/>`, `<SignatureBlock/>`, `<PhotoGallery/>`). Each block's attributes map to a slice of the typed `report_content` JSON. The document serializes to `Y.Doc` state and mirrors to `projects.report_content` (jsonb) via a 300-ms debounced write. Yjs gives us CRDT merge for free — the §02 §04 "technician edit overwritten by extraction" class of bugs (R1, R2, R9 from §05) simply cannot happen: extraction output is merged as a remote CRDT update and presents as a collaborative cursor, not a clobber. Undo survives drawer close (part of Yjs). The drawer shell (open/close, sticky header, progress bar) is straight Radix/Vaul composition.
- **Migration of existing rows.** A one-shot script (`scripts/migrate-extracted-data.ts`) reads every existing `projects.extracted_data`, runs it through a deterministic `extractedData → tiptapJson` adapter, and writes `projects.report_content`. Adapter is tested against a golden set of 20 anonymized rows.
- **What this fixes.** §05 R1, R2, R6, R9 (concurrent-writer races); §04 §10 "half-bidirectional binding"; §08 N1 (stored XSS — Tiptap escapes by default); undo-on-close loss.

### B2. Extraction pipeline — FixAIR n8n webhook → Qbe Supabase Edge Function

- **FixAIR source.** §03 §2 (`EXTRACTION_WEBHOOK` at `technician/index.html:9494`, called at `:16211`). The flow itself lives in n8n (not in this repo).
- **Qbe target.** `supabase/functions/extract/index.ts` — a Deno edge function that accepts the same payload shape, calls Anthropic's API server-side, validates the response with Zod, and upserts the diff into `projects.report_content`.
- **Design sketch.** The function receives `{ project_id, user_id, vertical_id, message, full_conversation, current_report_content }`. It loads the active vertical's `extraction-prompt.ts` (see §E), sends `messages` to Claude Sonnet with `response_format: json_schema` tied to the vertical's `slot-schema.ts`, runs the result through `validation.ts`, then writes the validated diff via a Postgres RPC `apply_extraction_diff(project_id, diff jsonb)` that performs the merge server-side inside a transaction. The function is called by the chat flow *and* by an explicit "Re-extract" button; no n8n hop, no dev webhook URL in production source.
- **Why server-side.** Three wins at once: (1) the Anthropic key never touches a browser; (2) the Zod validation is a hard gate between LLM output and the DB (so §04 §5 `[REPORT_DATA]` fragility goes away); (3) the merge is a single DB transaction, eliminating §05 R1/R9 even without the Yjs change.
- **Rate-limiting and cost.** Edge function enforces per-user rate limit (`users.subscription_tier` → ceiling). Usage logged to `extraction_calls` table for billing reconciliation.

### B3. Word export — FixAIR `docx.js` client-side → Qbe server-side `docx` serializer reading Tiptap JSON

- **FixAIR source.** `technician/index.html:10987` (`generateWord`). Client-side `docx` v8.5.0 via CDN. Reads the ad-hoc `lastReportData` shape.
- **Qbe target.** `supabase/functions/export-word/index.ts`. Server-side `docx` (npm, pinned major). Reads the validated Tiptap JSON from `projects.report_content`.
- **Design sketch.** Function accepts `{ project_id, template_id }`. It resolves the vertical, loads `packages/verticals/[id]/templates/[template_id].json`, walks the template tree substituting `{{slot}}` placeholders with values from `report_content`, and hands the result to a **block → docx-element** mapper. Output streamed as a `.docx` binary. Filename built from the project row. The endpoint returns a signed URL to a file uploaded to Supabase Storage under `exports/{project_id}/{timestamp}.docx` — users can re-download, ops can audit, and the client avoids the "wait for `Packer.toBlob` to spin up your laptop fan" UX.
- **Why server-side.** Removes the ~200 KB of `docx` + `FileSaver` CDN from the technician app (faster cold load). One template engine used by Word + PDF (next) instead of two parallel renderers. File audit trail for legal / compliance.

### B4. PDF export — currently absent → Qbe Playwright rendering `/print/[reportId]`

- **FixAIR source.** `technician/index.html:11983` (`generatePDF` with jsPDF — §04 §10). Note: `operations/index.html` has no PDF path at all (§06 §6).
- **Qbe target.** A public-by-signed-URL HTML route `/print/[reportId]?token=…` rendered in `apps/technician` (same Tiptap template set as B3 reused read-only) + a Supabase Edge Function `supabase/functions/export-pdf/index.ts` that spawns Playwright, hits the URL, calls `page.pdf()`, and stores the output.
- **Design sketch.** `/print/[reportId]` is a SSR route that renders the same blocks the drawer renders but in a paginated print stylesheet (CSS `@page`, `page-break-before`). The edge function opens a headless Chromium via `@sparticuz/chromium` + `puppeteer-core` (Playwright variant works too; pick one), loads the URL with a short-lived signed token, and emits the PDF to Storage with the same filename/audit convention as B3. One template source of truth for Word + PDF means the two formats cannot diverge — a known §04 §10 bug in the current app.
- **Why Playwright vs jsPDF.** jsPDF draws primitives; any template change requires re-authoring low-level draw calls. HTML-to-PDF uses the template we already rendered for the web preview, so "what you see in the drawer" = "what comes out as PDF" by construction.

### B5. Chat — FixAIR monolithic JS → Qbe React + streaming SSE

- **FixAIR source.** `technician/index.html:16314` (`sendMsg`), `:9492` (`ASSISTANT_WEBHOOK`), rendering via inline `addMsg` and `[REPORT_DATA]` island parsing at `:16549`.
- **Qbe target.** `apps/technician/app/(chat)/[projectId]/page.tsx` using the Vercel AI SDK (`useChat` hook) talking to `app/api/chat/route.ts`, which in turn streams from Anthropic server-side.
- **Design sketch.** React component with a message list (virtualized via `@tanstack/react-virtual`), a composer (auto-grow textarea + voice button + photo button), and a "thinking" indicator that renders the streamed `thought_process` tokens as they arrive. The server route streams via Server-Sent Events; `[REPORT_DATA]` islands are replaced by a typed tool-call (Anthropic tool use → server-side function → returns validated diff to the chat UI for preview, and to `projects.report_content` for persistence). Retry-with-backoff on 5xx. Conversation history context is summarized by a server-side job every 20 turns — replacing the hard cap at `:16389` that silently drops older context.
- **Why streaming.** Today's "thinking…" spinner is 4–15 s of dead time per turn (§03 observed latencies). Streaming turns that into progressive feedback — same total latency, much better perceived.

### B6. Freemium / quota — FixAIR localStorage → Qbe server-side + Stripe

- **FixAIR source.** §04 §13 (`technician/index.html:18496` `FREEMIUM_CONFIG`, counters in localStorage, owner-bypass UUID hardcoded).
- **Qbe target.** `usage_counters` table keyed `(user_id, week_start)` with server-enforced writes via a Postgres function `track_usage(action_type)`. Paywall UI reads a single `getUsage()` query. Stripe webhook at `app/api/stripe/webhook/route.ts` flips `users.subscription_tier` atomically on `invoice.paid` / `customer.subscription.deleted`.
- **Design sketch.** Every gated action (chat send, report generate, extraction) calls `track_usage` as part of the same transaction that performs the action — atomic consume-or-reject. The client only displays usage; it never enforces it. Subscription state is event-driven from Stripe (no poll). Owner / admin roles bypass via `users.role`, not via a hardcoded UUID. Multi-device problem solved because counters live in Postgres.
- **What this fixes.** §08 M9 (no Stripe webhook), §08 L3 (localStorage quota), §08 M3 (owner-bypass UUID in client), and the M5 demo-mode cleanup happens alongside.

### B7. Auth — FixAIR magic link kept, session handling modernized

- **FixAIR source.** §04 §1 + §07 §4. `signInWithPassword` + magic-link callback; manual `localStorage['supabase.auth.token']`; `detectSessionInUrl: false` with hand-rolled URL parsing; logout that skips `supabase.auth.signOut()`.
- **Qbe target.** Next.js 15 middleware (`middleware.ts`) handles session attachment via `@supabase/ssr`. Client uses the default Supabase client with `persistSession: true, detectSessionInUrl: true, autoRefreshToken: true`.
- **Design sketch.** `/auth` becomes a standard `app/auth/page.tsx` with two-step email-then-password (keeping A7). Magic-link callback lands at `/auth/callback` — the Supabase SSR helper handles the token swap and redirects by role. Middleware re-verifies the user row on every request; revoked sessions hit the first `ssr-cookie` check and bounce to login. Logout awaits `supabase.auth.signOut()` then clears a React state atom — no manual `localStorage` muck. MFA enabled for `admin` / `owner` / `master` via Supabase's built-in TOTP.
- **What this fixes.** §08 H3 (stale localStorage token), H4 (logout skips signOut), M6 (manual URL parse), and L1 (no MFA).

### B8. Admin surface — FixAIR 3 forks (admin/manager/master) → Qbe one role-gated app

- **FixAIR source.** `admin/index.html` (3618 lines), `manager/index.html` (3808 lines), `master/index.html` (4123 lines) — §07 §5 merge recommendation.
- **Qbe target.** One app `apps/admin/` with routes under `/admin`, `/admin/team`, `/admin/master` gated by role middleware. Shared components in `packages/ui/`.
- **Design sketch.** Route segment config declares required roles: `export const requiredRoles = ['admin','owner'] as const` for `/admin`, `['master']` for `/admin/master`. The same layout, the same team-card component, the same invitation flow — composed once, rendered by role. ~10k lines of duplicated HTML collapses to ~3k lines of framework code.

### B9. Operations realtime — FixAIR zero subs → Qbe Supabase channels

- **FixAIR source.** §06 §10 — `realtimeSubscriptions = []` declared and never populated.
- **Qbe target.** `apps/ops/app/layout.tsx` subscribes on mount to channels on `users` (presence), `projects` (status/progress), `team_messages` (new-message toast), scoped by `auth.uid()`.
- **Design sketch.** Use `@supabase/supabase-js` channel API. Each channel updates a React state atom (Jotai / Zustand). Marker layer on the map reads from the atom. The "En ligne / Hors ligne" badge that currently lies becomes truthful within seconds.

### B10. Technician list / team query — FixAIR N+1 → Qbe single RPC

- **FixAIR source.** §06 §4 — `loadTeam()` fires one `projects` query + one `team_messages` query per tech.
- **Qbe target.** Postgres RPC `get_manager_team_view(manager_id uuid)` returning one JSON blob: tech metadata + joined projects + recent messages. Called once per page load.
- **Design sketch.** RPC body is a single SQL with CTEs; joins `users`, `projects`, `team_messages`, `availability_shares`. Called via `supabase.rpc('get_manager_team_view', { manager_id })`. 201 round-trips become 1.

---

## C. Discard entirely

Patterns Qbe deliberately does **not** port. One line per item + rationale.

- **n8n as the extraction / assistant / OCR runtime.** — Replaced by Supabase Edge Functions (B2). n8n is a visual-editor convenience, not a requirement; TypeScript server functions are easier to test, type-check, and deploy from Git.
- **`admin/index.html`, `manager/index.html`, `master/index.html` as three separate ~4000-line forks.** — Collapsed to one `apps/admin` app with role-gated routes (B8).
- **`innerHTML`-via-template-literals rendering** anywhere. — Replaced by React + Tiptap. Every occurrence was an XSS (§08 N1) or a conflict-handling bug (§04 §10) waiting to happen.
- **Client-side freemium quota in `localStorage`.** — Replaced by `usage_counters` with server-enforced writes (B6). Single-device cap was a free-revenue leak.
- **Hardcoded master key `'FixAIR_Houssam_2026!'` at `master/index.html:2513`.** — The entire "shared-secret to an n8n webhook" pattern is deleted. Impersonation moves to a server-gated RPC that checks `auth.jwt() → role='master'` (§08 C1).
- **Hardcoded ElevenLabs API keys at `admin:2604`, `manager:2675`.** — All third-party provider keys live as Supabase edge-function secrets; browser sends audio to an edge function proxy (`/api/transcribe`) which forwards to the provider.
- **`app_settings.elevenlabs_api_key` row fetched client-side** at `technician/index.html:7481`. — Same replacement. The `app_settings` table survives but its RLS is tightened to `service_role` only.
- **`-dev` webhook URLs in production paths.** — `ASSISTANT_WEBHOOK = …/fixair-assistant-dev`, `EXTRACTION_WEBHOOK = …/fixair-extraction-dev`. Edge functions are versioned by Supabase deploy, not by URL suffix.
- **Inline `<script>` blocks > 500 lines.** — Every entry HTML has one. They defeat browser caching, defeat type checking, defeat code review. Hard bright line for Qbe: no inline scripts in HTML.
- **Three parallel merge functions** — `unifiedMerge`, `mergeReportData`, `smartMergeExtraction`. — Replaced by CRDT (Yjs) for collaborative edits and pure reducers for deterministic transforms (B1).
- **"Demo mode" as a `demo-*` user-id prefix.** — Replaced by a real Supabase account in a sandboxed schema (if demo mode is kept at all — see §G).
- **The static fallback mock data** at `operations/index.html:4614–4622`, `admin:2600`, `manager:2671`. — Loading errors should surface, not substitute mock content.
- **`calendar_events` as `date YYYY-MM-DD text + time HH:MM text`.** — Replaced by `timestamptz` columns (§02 calendar gotcha). Timezone-naive is a ticking bomb.
- **The `photos` column on `projects` alongside `extracted_data.photos[]`.** — One storage location: Supabase Storage, URLs referenced from `report_content`. The jsonb copy is deleted (§02 issue #5).
- **Inline base64 signatures and logos.** — Both move to Supabase Storage with signed URLs (§04 §8, §04 §16, §08 storage split).
- **Manual `localStorage['supabase.auth.token']` shadow-cache.** — Use Supabase SSR cookies instead.
- **`Router.navigate({page:'…'})` hand-rolled router.** — Next.js App Router replaces it everywhere.
- **20-project hardcoded cap** in the project list (§04 §3). — Replaced by real pagination + search + server-side sort.
- **Legacy `chat_type='copilot'` values and the remap-on-read code.** — Migrated at cut-over; the client-side remap is deleted.
- **`fixair-tech-auth` legacy auth blob.** — Already only ever deleted in the current code; never re-introduced.
- **Mock "5 interventions, 92% success" hardcoded stats** in ops tech-detail drawer (`operations/index.html:4834–4837`). — Replaced by real queries.
- **`openHotline() { alert(...) }` and the other six empty-stub hotline functions** at `technician/index.html:18365+`. — Either ship the feature or delete the nav tab (§04 §17 verdict). Qbe deletes.
- **`openTechChat() { alert(...) }` and `callTechnician() { alert(...) }`** at `operations/index.html:4880–4881`. — Same. Implement (with real messaging + `tel:` minimum) or remove (§06 §7 + §8).
- **Hardcoded owner-bypass UUID** at `technician/index.html:18584`. — Replaced by `users.role='owner'`.
- **`companyLogoData` as inline base64 in `users.company_logo`.** — Supabase Storage URL only.

---

## D. Add new

Capabilities Qbe ships that FixAIR does not have today.

### D1. Monorepo (pnpm + Turborepo)
```
qbe/
├── apps/
│   ├── technician/              # Next.js 15 App Router
│   ├── ops/                     # map + realtime dashboard
│   ├── admin/                   # merged admin/manager/master
│   ├── auth/                    # login / signup / reset / confirm
│   └── marketing/               # landing + /r/[code] referral routes
├── packages/
│   ├── ui/                      # shadcn-style React components
│   ├── design/                  # Tailwind tokens + the 12 brand styles
│   ├── editor/                  # Tiptap extensions + custom blocks
│   ├── db/                      # Supabase types (from `supabase gen types`)
│   ├── llm/                     # Anthropic client + prompt helpers
│   ├── verticals/               # ← one folder per vertical; see §E
│   │   ├── hvac/
│   │   └── electricien/
│   └── utils/
├── supabase/
│   ├── migrations/              # SQL migrations (versioned)
│   ├── functions/               # edge functions
│   └── seed.sql
├── playwright/                  # e2e tests
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

### D2. TypeScript strict mode + `db` package from generated types
- `tsconfig.json` with `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`.
- `packages/db/types.ts` generated by `supabase gen types typescript --linked` — every `.from('projects')` call is autocompleted and type-checked. Kill the entire class of "someone renamed a column and six places broke silently" bugs.

### D3. Next.js 15 App Router with server components
- Reads default to server components (first paint is server-rendered HTML, not hydrated React). Mutations use Server Actions talking to Supabase via `@supabase/ssr`. Client components only where needed (Tiptap editor, real-time map, chat stream).
- `middleware.ts` for auth + role gates. One place to edit when a new role lands.

### D4. Tiptap + Yjs for the drawer
- Covered in B1. New capability vs FixAIR: **collaborative editing** — a second technician or a manager can edit the same report live, with cursor presence. Removes the entire "extraction overwrites user edit" bug class by construction.

### D5. Supabase Edge Functions as the LLM gateway
- `supabase/functions/chat`, `supabase/functions/extract`, `supabase/functions/transcribe`, `supabase/functions/export-word`, `supabase/functions/export-pdf`. Each is a small Deno function with its provider credentials as a Supabase secret.
- Rate limiting via Postgres (not via Cloudflare or n8n). Observability via Supabase logs + Sentry spans.

### D6. Playwright `/print/[id]` PDF route
- Covered in B4. New capability vs FixAIR ops, which has **no** PDF/Word export at all (§06 §6).

### D7. Multi-tenant RLS — `organizations` + `memberships`
- New tables. `organizations(id, name, vertical_id, created_at, stripe_customer_id)` and `memberships(organization_id, user_id, role)` with `role IN ('owner','admin','manager','technician')`.
- Every tenant-scoped table grows an `organization_id` column. RLS policies key on `auth.uid() IN (SELECT user_id FROM memberships WHERE organization_id = row.organization_id)`.
- Replaces the current "team = `users.manager_id`" model (§06 §9). A real multi-tenant design for the day Qbe sells to a second, third, fourth electrician business.

### D8. Vertical abstraction at `packages/verticals/[id]/`
- Full contract in §E. Each vertical folder exports: the extraction system prompt, the slot schema, the template JSONs, the style token reference, the Zod validation schemas, and a metadata manifest. The apps consume whichever vertical a given organization is configured for.

### D9. Observability: Sentry + PostHog
- `@sentry/nextjs` in every app. Error boundaries report to Sentry instead of being swallowed (§08 M7).
- `posthog-js` in client components for product analytics. Events: `chat_sent`, `extraction_completed`, `report_exported`, `signature_captured`, `invitation_accepted`.
- Both SDKs load behind a cookie-consent check for GDPR.

### D10. Stripe — event-driven, not poll-driven
- Subscription state lives in Stripe (authoritative); mirrored to Supabase via `app/api/stripe/webhook/route.ts` with signature verification. One function, one source of truth, zero poll loops.

### D11. Resend for transactional email
- Invitation emails, password reset emails, report-generated-notification emails. Replaces the `/webhook/email-send` n8n flow. One SDK, one deliverability dashboard.

### D12. CI/CD
- GitHub Actions: `typecheck`, `lint`, `test`, `build` on every PR. `preview` deploys on Vercel (or Cloudflare Pages). E2E tests via Playwright against preview URLs.
- Dependabot for npm + GitHub Actions. Daily Snyk scan on PRs.

### D13. Subresource Integrity as a non-negotiable
- Any remaining CDN scripts (should be zero — see discard list) must carry `integrity=`. ESLint rule enforces it.

### D14. CSP, frame-ancestors, and content-type-options headers
- Set at the hosting layer (Vercel / Cloudflare Pages `_headers`). Baseline from §08 N4's proposal.

### D15. A real error-reporting path for production
- Every `catch` either rethrows or logs to Sentry + shows a typed toast. "Silently continue" is a lint violation.

---

## E. Vertical-abstraction contract

The one piece of architecture Qbe must get right before anything else is written: **what exactly does a "vertical" have to provide?** A vertical is a trade (electricians, HVAC, plumbing, refrigeration…). Each lives at `packages/verticals/[id]/` and exports a fixed interface that the apps consume polymorphically.

**Reference implementation.** `packages/verticals/hvac/` — ported from FixAIR. `packages/verticals/electricien/` — net new for Qbe.

**Required files in every vertical:**
```
packages/verticals/[id]/
├── package.json                 # name: "@qbe/vertical-[id]"
├── metadata.ts                  # vertical name, languages, categories
├── extraction-prompt.ts         # system + user prompt templates
├── slot-schema.ts               # TypeScript type of `report_content`
├── validation.ts                # Zod schemas per document type
├── templates/                   # 12 document templates as JSON
│   ├── maintenance-preventive.json
│   ├── diagnostic-panne.json
│   ├── mise-en-service.json
│   └── …
├── styles.ts                    # default style token + overrides
├── labels.ts                    # FR/EN UI strings specific to the vertical
├── index.ts                     # re-exports — the single import surface
└── __tests__/                   # golden-file tests per template
```

### E1. `metadata.ts`
Identity of the vertical. No behavior.
```ts
// packages/verticals/hvac/metadata.ts
import type { VerticalMetadata } from '@qbe/types';

export const metadata: VerticalMetadata = {
  id: 'hvac',
  name: {
    fr: 'Climatisation & Pompe à chaleur',
    en: 'HVAC & Heat Pump',
  },
  tradeCategory: 'hvac',
  supportedLanguages: ['fr', 'en'],
  defaultLanguage: 'fr',
  unitSystem: 'metric',              // 'metric' | 'imperial'
  currency: 'EUR',
  documentTypes: [
    'maintenance-preventive',
    'maintenance-corrective',
    'diagnostic-panne',
    'mise-en-service',
    'rapport-intervention',
    'controle-etancheite',
    'bilan-annuel',
    'devis-intervention',
    'pv-reception',
    'certificat-conformite',
    'rapport-installation',
    'rapport-recuperation-fluide',
  ] as const,
  version: '1.0.0',
};
```
The app's type system enforces that `documentTypes[i]` matches a `templates/<name>.json` file at compile time (via a mapped type).

### E2. `extraction-prompt.ts`
The system + user prompt templates the extract edge function hands to Claude, plus the assistant-chat system prompt.
```ts
// packages/verticals/hvac/extraction-prompt.ts
import type { ExtractionPrompts } from '@qbe/types';
import { slotSchema } from './slot-schema';

export const prompts: ExtractionPrompts = {
  // The extract edge function uses these
  extraction: {
    system: `Tu es un assistant d'extraction structurée pour des rapports
d'intervention en CVC (Climatisation, Ventilation, Chauffage).
Tu reçois une conversation entre un technicien et un assistant IA, plus
l'état actuel d'un rapport. Produis un DIFF JSON valide contre le schéma
ci-dessous. Ne retourne pas les champs inchangés.

Règles de normalisation:
- Les status d'intervention sont: "resolu" | "en_cours" | "non_resolu" | "en_attente_pieces".
- Les charges de fluide sont stockées en kg (nombre) dans fluide_global,
  et en strings "X kg" dans fluide.*.
- equipements[].role ∈ {"ue","ui","outdoor","indoor"}.
- Dates au format français JJ/MM/AAAA.`,
    userTemplate: ({ message, conversation, currentReport }) => `
# Message du technicien
${message}

# Historique de la conversation (derniers tours)
${conversation.slice(-20).map(m => `[${m.role}] ${m.content}`).join('\n')}

# État actuel du rapport
\`\`\`json
${JSON.stringify(currentReport, null, 2)}
\`\`\`

# Schéma cible
\`\`\`json
${JSON.stringify(slotSchema, null, 2)}
\`\`\`

Retourne uniquement le DIFF JSON, sans commentaire.`,
    model: 'claude-sonnet-4-6',
    maxTokens: 4096,
  },
  // The chat edge function uses these
  assistant: {
    system: `Tu es FixAIR, l'assistant technique des techniciens CVC.
Aide le technicien à remplir son rapport d'intervention en posant des
questions courtes et spécifiques. Ton tutoiement est obligatoire.
N'affiche jamais les champs extraits — un pipeline séparé s'en charge.`,
    model: 'claude-sonnet-4-6',
    maxTokens: 2048,
  },
};
```

### E3. `slot-schema.ts`
The TypeScript type of `projects.report_content` (renamed from `extracted_data` in §B1).
```ts
// packages/verticals/hvac/slot-schema.ts
import { z } from 'zod';

// Values normalized by the extraction pipeline
const StatusSlug = z.enum(['resolu', 'en_cours', 'non_resolu', 'en_attente_pieces']);
const EquipementRole = z.enum(['ue', 'ui', 'outdoor', 'indoor']);

export const ClientBlock = z.object({
  nom: z.string().optional(),
  societe: z.string().optional(),
  contact: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email().optional(),
  reference: z.string().optional(),
  adresse: z.string().optional(),
});

export const Equipement = z.object({
  id: z.string(),                     // stable id for Yjs block identity
  marque: z.string().optional(),
  modele: z.string().optional(),
  role: EquipementRole,
  type_ui: z.string().optional(),
  numero_serie: z.string().optional(),
  puissance: z.string().optional(),
});

export const FluideGlobal = z.object({
  type: z.string().optional(),
  charge_totale_site_kg: z.number().nonnegative().optional(),
  charge_usine_kg: z.number().nonnegative().optional(),
  charge_appoint_kg: z.number().nonnegative().optional(),
});

export const HvacReportContent = z.object({
  brand: z.string(),
  brand_key: z.string(),
  date: z.string(),                   // JJ/MM/AAAA
  reference: z.string().optional(),
  resume: z.string().optional(),
  type_intervention: z.string().optional(),
  client: ClientBlock.optional(),
  site: z.object({ /* … per §02 */ }).optional(),
  equipements: z.array(Equipement).default([]),
  fluide_global: FluideGlobal.optional(),
  adressage: z.array(z.object({ /* … */ })).default([]),
  mesures: z.array(z.object({ /* … */ })).default([]),
  travaux_effectues: z.array(z.object({ /* … */ })).default([]),
  travaux_prevoir: z.array(z.object({ /* … */ })).default([]),
  reserves: z.array(z.object({ /* … */ })).default([]),
  recommandations: z.array(z.object({ /* … */ })).default([]),
  resultat: z.object({
    status: StatusSlug,
    description: z.string().optional(),
    conclusion: z.string().optional(),
  }).optional(),
  technicien: z.object({ /* … */ }).optional(),
  signatures: z.object({
    client_url: z.string().url().optional(),       // Supabase Storage URL, not base64
    technicien_url: z.string().url().optional(),
    nom_client: z.string().optional(),
    nom_technicien: z.string().optional(),
  }).optional(),
  photos: z.array(z.object({
    id: z.string(),
    url: z.string().url(),
    caption: z.string().optional(),
  })).default([]),
});

export type HvacReportContent = z.infer<typeof HvacReportContent>;
export const slotSchema = HvacReportContent;     // re-export for prompts
```

### E4. `templates/*.json`
One file per document type, each a Tiptap JSON block tree with `{{slot}}` placeholders that resolve against `HvacReportContent`.
```jsonc
// packages/verticals/hvac/templates/maintenance-preventive.json
{
  "type": "doc",
  "content": [
    { "type": "heading", "attrs": { "level": 1 }, "content": [{ "type": "text", "text": "Rapport de maintenance préventive" }] },
    { "type": "reportHeaderBlock", "attrs": { "slot": "brand,reference,date" } },
    { "type": "clientBlock", "attrs": { "slot": "client" } },
    { "type": "siteBlock", "attrs": { "slot": "site" } },
    { "type": "equipementsTable", "attrs": { "slot": "equipements" } },
    { "type": "fluideSummary", "attrs": { "slot": "fluide_global" } },
    { "type": "mesuresTable", "attrs": { "slot": "mesures" } },
    { "type": "travauxList", "attrs": { "slot": "travaux_effectues", "style": "done" } },
    { "type": "reservesList", "attrs": { "slot": "reserves" } },
    { "type": "recommandationsList", "attrs": { "slot": "recommandations" } },
    { "type": "resultatBlock", "attrs": { "slot": "resultat" } },
    { "type": "signatureBlock", "attrs": { "slot": "signatures" } }
  ]
}
```
Each `*Block` / `*Table` / `*List` is a custom Tiptap node implemented once in `packages/editor/` and rendered identically in:
- the drawer editor,
- the SSR `/print/[id]` HTML,
- the `docx` generator (block → docx element mapping).

**Template validation.** A CI job mounts each template against a synthetic `HvacReportContent` and asserts every `slot=…` reference resolves. No "template renders `{{client.foo}}` that the schema doesn't have" drift.

### E5. `styles.ts`
Reference to the brand-style matrix (12 styles × 12 templates = 144 visual outputs).
```ts
// packages/verticals/hvac/styles.ts
import type { VerticalStyles } from '@qbe/types';

export const styles: VerticalStyles = {
  defaultStyle: 'fixair-classic',
  availableStyles: [
    'fixair-classic', 'daikin', 'mitsubishi', 'carrier', 'atlantic', 'toshiba',
    'lg', 'samsung', 'panasonic', 'hitachi', 'airwell', 'clivet',
  ] as const,
  // Rules for auto-selecting a brand style from the report content
  autoSelectFromReport: (report) => {
    const key = report.brand_key?.toLowerCase();
    return availableStyles.find(s => s === key) ?? 'fixair-classic';
  },
};
```
Actual style tokens live in `packages/design/brands/[style].ts` — colors, fonts, header banner height, logo placement. The vertical picks *which* styles apply to it (an electrician vertical would reference `schneider`, `legrand`, etc.).

### E6. `validation.ts`
Zod schemas per document type. Extraction output is validated against `slotSchema` (E3); *before export*, the relevant template's schema (stricter — "this template requires these fields") runs.
```ts
// packages/verticals/hvac/validation.ts
import { z } from 'zod';
import { HvacReportContent } from './slot-schema';

export const perTemplateSchema = {
  'maintenance-preventive': HvacReportContent.extend({
    client: HvacReportContent.shape.client.unwrap().required({
      societe: true, adresse: true,
    }),
    equipements: HvacReportContent.shape.equipements.nonempty(),
    mesures: HvacReportContent.shape.mesures.nonempty(),
    signatures: HvacReportContent.shape.signatures.unwrap().required({
      technicien_url: true,
    }),
  }),
  'diagnostic-panne': HvacReportContent.extend({ /* … */ }),
  // …
} as const;

export type TemplateKey = keyof typeof perTemplateSchema;
export const validateForExport = <K extends TemplateKey>(
  template: K,
  content: unknown,
): z.infer<(typeof perTemplateSchema)[K]> =>
  perTemplateSchema[template].parse(content);
```
Callers (the Word and PDF export functions) call `validateForExport` before rendering. A report that fails validation returns a typed "missing fields" error to the user with field paths — replaces the silent-export-of-half-filled-reports pattern in FixAIR.

### E7. `labels.ts`
Vertical-specific UI strings that don't belong in the generic app. Example: the ops map legend says "Nord / Sud / Direct" today, but an electrician vertical might use "Région / Équipe / Urgence". Per-vertical `labels` export is consumed via `useVerticalLabels()` in React components.
```ts
// packages/verticals/hvac/labels.ts
export const labels = {
  fr: {
    drawer: {
      section: {
        client: 'Client',
        site: 'Site',
        equipements: 'Équipements',
        fluide: 'Fluide frigorigène',
        mesures: 'Mesures',
        travaux_effectues: 'Travaux effectués',
        reserves: 'Réserves',
        recommandations: 'Recommandations',
      },
    },
    report: {
      statusOptions: {
        resolu: 'Résolu',
        en_cours: 'En cours',
        non_resolu: 'Non résolu',
        en_attente_pieces: 'En attente de pièces',
      },
    },
  },
  en: { /* … */ },
} as const;
```

### E8. `index.ts` — the single import surface
```ts
// packages/verticals/hvac/index.ts
export { metadata } from './metadata';
export { prompts } from './extraction-prompt';
export { HvacReportContent, slotSchema } from './slot-schema';
export { validateForExport, perTemplateSchema } from './validation';
export { styles } from './styles';
export { labels } from './labels';
export type { TemplateKey } from './validation';
import templates from './templates';
export { templates };

// Consumed by the app through a single helper:
//   const v = await loadVertical(organization.vertical_id);
//   v.prompts.extraction.system, v.templates['maintenance-preventive'], …
```

### E9. How the apps consume a vertical
```ts
// packages/verticals/index.ts — the registry
import * as hvac from './hvac';
import * as electricien from './electricien';

export const verticals = { hvac, electricien } as const;
export type VerticalId = keyof typeof verticals;

export const loadVertical = (id: VerticalId) => verticals[id];
```
Every route that touches report data starts with `const v = loadVertical(org.vertical_id)` and uses `v.prompts`, `v.templates`, `v.validateForExport`. There is no `if (vertical === 'hvac')` branch anywhere in `apps/`.

### E10. Contract tests
Each vertical ships golden-file tests:
- `__tests__/extraction-prompt.test.ts` — feed a synthetic conversation, assert the extraction output matches a recorded diff (using `@anthropic-ai/sdk` in test mode / recorded fixtures).
- `__tests__/templates.test.ts` — each template renders against a golden `HvacReportContent` and produces the expected HTML / docx / PDF snapshot.
- `__tests__/validation.test.ts` — each `perTemplateSchema` accepts its golden pass-case and rejects each golden fail-case with a stable error path.

These tests are the *spec* of what it means for a vertical to be "correct". Adding a third vertical is a test-driven exercise: copy `packages/verticals/hvac/`, edit the JSON/TS, run the tests, ship.

---

## F. Migration sequence

Week-by-week plan. Assumes two engineers working concurrently; if team size differs, scale proportionally.

### Week 1 — Platform skeleton
**Goal.** A deployable monorepo with auth + empty shell apps, no feature code.

- Day 1–2: initialize monorepo, Turborepo, pnpm workspace, shared `tsconfig.json`, ESLint + Prettier configs. `.env.example`. CI (lint + typecheck).
- Day 2–3: Supabase project stood up (dev + staging). Run migrations for `organizations`, `memberships`, `users` (extended), `projects` (new `report_content jsonb` + `vertical_id`), `chats`, `messages`, `calendar_events`, `team_messages`, `availability_shares`, `invitations`, `usage_counters`, `referrals`, `extraction_calls`, `support_sessions`.
- Day 3–4: `apps/auth` — login / signup / reset / confirm. Middleware-based session attachment. MFA enabled for admin+ roles. Two-step email-then-password UX per A7.
- Day 4–5: `packages/ui` baseline (shadcn/ui installed, 10 primitives imported), `packages/design` brand tokens (port 3 brands as a smoke test), `packages/db` types generated. `apps/technician` empty shell with auth gate. Deploy to Vercel previews.
- Day 5: Sentry + PostHog wired (production keys). Stripe test-mode account connected but no webhook yet.

**Ship criterion.** A user can sign up, confirm email, log in, and land on `apps/technician` showing "Hello, {firstName}".

### Week 2 — Technician app parity
**Goal.** A technician user can do their full loop: create project → chat → see extraction → edit drawer → export Word.

- Day 1–2: `packages/verticals/hvac` — port all files per §E from FixAIR source. Golden tests pass.
- Day 2–3: Chat UI (B5). `/api/chat` edge function streaming Anthropic. Messages persisted, thought-process streamed.
- Day 3–4: Extract edge function (B2) + `apply_extraction_diff` RPC. Drawer (B1) — Tiptap with every block implemented. Yjs realtime channel. Auto-save via 300 ms debounce on the Yjs `update` event.
- Day 4–5: Word export edge function (B3). Template renderer reads from `packages/verticals/hvac/templates/*.json`. PDF via Playwright (B4).
- Day 5: Voice (B5.1) — transcription proxy edge function (wraps ElevenLabs or Whisper — see §G). Photo + OCR (B5.2) — photo upload to Storage + OCR edge function.

**Ship criterion.** A technician can take a project from empty to a validated, exported Word file. Collaborative edit (two tabs) works.

### Week 3 — Operations app
**Goal.** Map + realtime team view + click-into-report (preview + download) + merged admin surface.

- Day 1–2: `apps/ops` — Mapbox map with `react-map-gl`. Server-side geocoding on project insert (Mapbox Geocoding API via edge function). Marker clustering.
- Day 2–3: Realtime subscriptions on `users`, `projects`, `team_messages` (D5 / B9). Presence dots telling the truth.
- Day 3–4: Click-into-technician drawer, click-into-report drawer (B/6 with real queries and real preview — photos + signatures rendered). Download button calls the Word/PDF export functions.
- Day 4: `apps/admin` merged surface (B8). Role-gated routes for admin/manager/master. Team management + project oversight + availability shares + team messaging (real, not §07's `alert()`).
- Day 5: Invitations (Resend) + referrals (typed table). Calendar with FullCalendar or Schedule-X — `timestamptz` columns, real recurrence expansion.

**Ship criterion.** An operations user has a dashboard that is demonstrably live — presence updates within 2 s, a project created on another tab appears on the map.

### Week 4 — Polish + billing + cut-over
**Goal.** Production-readiness.

- Day 1: Stripe webhook wired (D10). Quota enforcement via `track_usage` + RPC. Upgrade modal links to Stripe Checkout; subscription state comes back through the webhook.
- Day 2: Signature capture with `signature_pad` library (responsive canvas, empty-signature rejection). Uploads to Storage, URL stored in `report_content`.
- Day 3: Onboarding wizard (real Stepper, persisted state). Gamification home tile (A6). Profile screen (auto-save, logo to Storage).
- Day 4: Data migration from FixAIR. Run the `extractedData → tiptapJson` adapter over every existing `projects.extracted_data` in staging. Validate golden set. Fix edge cases. Run against production into a shadow column `report_content`; compare a sample of exports against current FixAIR Word output.
- Day 5: Security review — CSP, SRI, Sentry 0-error streak. Playwright e2e suite green. Load test (100 concurrent chats → extract → export).

**Ship criterion.** Every §08 CRITICAL/HIGH issue has a closed ticket with verification.

### Cut-over strategy

**Approach: dual-write period, then DNS switch.** No flag-day.

**Phase 1 — Dual write (Week 4, day 4 → Week 5, day 2).**
- Every FixAIR write also writes to the Qbe shadow tables via a Supabase trigger or the FixAIR client (whichever is faster to deploy). `projects.extracted_data` mirrors to `projects.report_content` via the adapter; `messages` mirror as-is; `chats` mirror with `chat_type='copilot'` rewritten.
- Qbe apps are live at `qbe.fixair.ai` but require opt-in per organization.
- A small set of friendly users (5–10) are invited to switch. They exercise the app for a week.

**Phase 2 — One-way migration script.**
- `scripts/migrate-from-fixair.ts` — idempotent. Reads each FixAIR row, transforms to the Qbe shape, upserts. Runs against prod every hour during the dual-write period.
- Diff-check job: compare Word exports from FixAIR and Qbe for the same 50-project sample; flag any substantive drift to engineering.

**Phase 3 — DNS switch.**
- `go.fixair.ai` flips to Qbe. FixAIR read-only at `legacy.fixair.ai` for two weeks. Users land in Qbe by default; legacy URL available for anyone who needs to look up historical data.
- Stripe subscriptions migrate via a single Supabase-triggered mapping (`stripe_customer_id` already present on the `users` row; no customer-visible change).
- FixAIR codebase archived. `legacy.fixair.ai` turned off after the two-week window.

**Rollback plan.** If Qbe has a P0 in the first 48 h post-cut-over, DNS flips back and dual-write is disabled. Because migration was one-way (Qbe never wrote to FixAIR's `extracted_data`), FixAIR remains intact. Once the P0 is fixed, re-attempt.

---

## G. Open questions for Houssam

Every place this plan guessed a business decision. Each needs an explicit answer before Week-1 scaffolding is final. If the answer changes a foundational assumption (e.g. "multi-vertical organizations"), the ordering of Week 1 shifts.

### G1. Vertical scope per organization
- **Assumption in this plan.** Each organization is *single-vertical* — one electrician company uses the electrician vertical, one HVAC company uses HVAC. `organizations.vertical_id` is non-null.
- **Alternative.** An organization spans multiple trades (a facility-management firm doing HVAC *and* electrical). Then `memberships.vertical_id` or `projects.vertical_id` carries the scope.
- **Why it matters.** Affects every RLS policy that keys off vertical, and affects whether the app's top-level layout shows a vertical switcher.

### G2. Manager / operations merge
- **Assumption in this plan.** `apps/admin` merges the old admin + manager + master. `apps/ops` stays separate (map-centric). But §06 ops and §07 admin overlap — should ops fold into admin too?
- **Alternative.** Three apps: `auth`, `admin`, `field` (technician). Ops becomes a route inside `admin`.
- **Why it matters.** Week 3 timing halves if ops is a route, not an app.

### G3. Primary domain
- **Assumption in this plan.** Qbe ships at `qbe.fixair.ai` for dual-write, then takes `go.fixair.ai` at cut-over. `fixair.ai` the brand stays.
- **Alternatives.** New brand new domain (`qbe.app`, `qbe.ai`); or keep FixAIR brand, Qbe is internal codename; or sell Qbe as a sub-product at `electriciens.fixair.ai`.
- **Why it matters.** Marketing, Stripe account setup, Mapbox token restrictions, Resend sender domain, Google Fonts referrer check.

### G4. Pricing model
- **Assumption in this plan.** Per-seat subscription, same shape as FixAIR today (€49/mo/Pro per user). `usage_counters` enforces tier ceilings.
- **Alternatives.** Per-organization tiers (one price, N users); per-report pricing (usage-based); free-for-technicians-paid-for-managers.
- **Why it matters.** Stripe schema (Product × Price), the `usage_counters` table's granularity (per-user or per-org), the webhook mapping.

### G5. Languages v1
- **Assumption in this plan.** FR default, EN slot present but not fully translated. `next-intl` wired from day one so adding EN is a content job, not a refactor.
- **Alternatives.** FR + EN both shipped translated at v1; FR only, no EN slot; FR + EN + a third (DE, ES) for a specific customer.
- **Why it matters.** Budget for translation. Affects `packages/verticals/[id]/labels.ts` completeness requirements in every vertical.

### G6. Existing FixAIR users' data
- **Assumption in this plan.** One-way migration of `projects` + `chats` + `messages` + `calendar_events` + `users` + `availability_shares`. Report data transformed via the adapter. History preserved.
- **Alternatives.** Migrate only active users (≥1 login in 90 days); or fresh-start with read-only legacy archive; or no migration at all (new accounts).
- **Why it matters.** Migration complexity. Decision on whether the `extractedData → tiptapJson` adapter has to be perfect or just "good enough for 80%".

### G7. ElevenLabs vs Whisper for STT
- **Assumption in this plan.** Transcription goes through an edge function proxy; provider TBD. ElevenLabs is 10× more expensive than Whisper for French (§09 §ElevenLabs).
- **Alternatives.** Keep ElevenLabs (familiar quality, same API); switch to Whisper (via OpenAI API, ~10× cheaper); self-host Whisper on a GPU VM.
- **Why it matters.** Recurring cost. Provider key placement.

### G8. The n8n workflow archive
- **Assumption in this plan.** n8n is discarded (C). Its flows (extraction, assistant, OCR, email-send, support-login, approval) are reimplemented as Supabase edge functions. Flow JSON is *not* imported — we re-author from the audit docs.
- **Alternatives.** Export the existing flows into `audit-v3/n8n-flows-export/` so they can be re-read as a spec; or run n8n in parallel behind the edge functions for a safety net.
- **Why it matters.** How much prompt engineering / pinecone-index configuration needs to be redone from memory vs ported from the flow exports.

### G9. Conversational AI (ElevenLabs agents)
- **Assumption in this plan.** The `index.html:13232–13277` ElevenLabs Conversational AI integration is dormant / marketing-only. Qbe does not port it.
- **Alternative.** It's a live feature in production. Then it needs its own architecture decision: keep via ElevenLabs, or switch to OpenAI Realtime API, or build on top of the existing chat infra.
- **Why it matters.** A live feature not flagged in this plan could surface mid-Week 2 as an unscoped dependency.

### G10. The 12 brand styles — scope
- **Assumption in this plan.** 12 brand styles × 12 document types = 144 combinations ported to `packages/design/brands/`. Each brand is a Tailwind theme + a logo asset + header tokens.
- **Alternative.** Ship with 3 styles at v1 (`fixair-classic`, `daikin`, `mitsubishi`) and add the rest post-cut-over.
- **Why it matters.** Design time. A full 12-brand port is 2–3 days of design work; 3 brands is half a day.

### G11. Retention of "FixAIR classic" vertical
- **Assumption in this plan.** HVAC vertical (derived from FixAIR) coexists with Qbe (electriciens) from day one. Both verticals fully supported.
- **Alternative.** Qbe *is* the rebuild — HVAC users land on Qbe in electrician mode, accept the mapping. Or HVAC is kept on FixAIR until a separate rebuild.
- **Why it matters.** Whether Week 2 has to deliver feature parity for HVAC users (the FixAIR customer base) or only for Qbe users (net new).

### G12. Demo mode
- **Assumption in this plan.** Demo mode is deleted (C). New-user onboarding uses a sandboxed real account.
- **Alternative.** Keep a demo path for sales — an anonymous route that doesn't write to the real DB, for showing the app to prospects without creating a user.
- **Why it matters.** If kept, it needs its own RLS / schema / data-isolation story — pushed to Week 4+.

### G13. `master/` role in Qbe
- **Assumption in this plan.** `master` is preserved as a role (support-impersonation surface) but implemented server-side via a `support_sessions` table + audit log. No shared secrets.
- **Alternative.** Fold `master` into `owner`; FixAIR's master was a workaround for lack of proper support tooling. Support handles via real auth (logged impersonation via Stripe-style "act as").
- **Why it matters.** Whether any route under `/admin/master/` exists at all.

**Next step.** This document is a plan, not a decision. Please mark each G-item with an answer (or "TBD, default is fine") before Week 1 scaffolding is frozen.

