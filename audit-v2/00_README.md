# audit-v2: Deep dive for Qbe

Audit of the FixAIR FE repository on branch `claude/dev-lab-7iGKi`, written to support cloning the product into a new vertical called **Qbe** (electricians) on a **Next.js monorepo**. Every claim cites `file:line` or a function name. Counts and sizes are real.

- Branch under audit: `claude/dev-lab-7iGKi` (HEAD `fbbf8dd`)
- Audit branch (this work): `audit-v2/deep-dive-for-qbe`
- Previous audit branch (for diff): `claude/fixair-codebase-audit-xeIFv`
- Primary artifact under inspection: `technician/index.html` — **20,994 lines / 1,035,147 bytes**

---

## Table of contents

| #  | File                                          | What it covers |
|----|-----------------------------------------------|----------------|
| 00 | `00_README.md`                                | This file. Index, reading orders, deltas vs. previous audit. |
| 01 | `01_repository_inventory.md`                  | Every top-level directory and file: purpose, size, build status, deploy target. Catalogs the static-HTML-per-role layout (`technician/`, `manager/`, `admin/`, `master/`, `operations/`, `auth/`, `invite/`, `r/`, `debug/`, `docs/`, `assets/`, `samples/`, root `index.html`), routing files (`_redirects`, `_routes.json`, `404.html`, `CNAME`), and the absence of any package manager / bundler / framework. |
| 02 | `02_apps_and_roles.md`                        | The seven role-apps as products: who uses each, what they do, which entry HTML, shared CSS/JS, and where role boundaries leak. Includes role matrix vs. Supabase tables. |
| 03 | `03_technician_deep_dive.md`                  | Anatomy of `technician/index.html` post-Copilot, post-diagnostic-removal: views (Home, Projects, Chat, Drawer), state machine, IndexedDB+Supabase dual-write, Word export, Hotline-as-Pro stub, the new floating-`+` curved nav. The single document a Qbe builder reads first. |
| 04 | `04_data_model.md`                            | Supabase schema: tables, columns, FKs, JSON blobs, storage buckets. Maps every column to the JS code that reads/writes it. Calls out HVAC-specific shapes that need to be re-modeled for electricians. |
| 05 | `05_backend_functions_and_rls.md`             | Edge Functions, Postgres RPCs, triggers, RLS policies. What runs server-side, what runs in the browser with the anon key, and the gaps between them. |
| 06 | `06_external_integrations.md`                 | Anthropic (Claude API key handling), Stripe (paywall, audit protection), Supabase Storage, any analytics or email. Includes endpoints, where keys live, and dual-use risk. |
| 07 | `07_auth_and_multitenancy.md`                 | Sign-in flows (`auth/`, `invite/`, `r/` referral landing), magic links, role assignment, organization/tenant model, invite & referral code paths. |
| 08 | `08_vertical_specific_vs_agnostic.md`         | The fork line: which strings, fields, prompts, prompt fragments, sample data, photo categories, report sections, PDF/Word templates, and translations are HVAC-specific and must change for electricians; which are vertical-agnostic and survive the clone unchanged. |
| 09 | `09_tech_debt_and_dead_code.md`               | Half-built features, WIP commits, orphaned DOM, legacy `chat_type='copilot'` rows, dead translations, unused CSS, files that ship to prod but aren't reachable. Plain-English "this is broken" list. |
| 10 | `10_target_architecture_nextjs_monorepo.md`   | Proposed Next.js (App Router) + Turborepo layout for hosting both FixAIR and Qbe from one codebase: shared `packages/ui`, `packages/db`, `packages/ai`, per-vertical `apps/fixair-technician` and `apps/qbe-technician`. Migration sequencing and "what to port last" notes. |

---

## Reading orders

### (a) Architect designing a Next.js monorepo replacement

Goal: understand the surface area before drawing boxes.

1. **01** — what files exist, how they deploy today (Cloudflare Pages, `_redirects`, `_routes.json`).
2. **02** — the role-app split; this is what becomes `apps/*` in the monorepo.
3. **04** — the data model is the spine; the monorepo design must preserve it or migrate it explicitly.
4. **05** — what Postgres / Edge Functions are doing today; decides what becomes Next.js Route Handlers vs. Server Actions vs. left in Supabase.
5. **07** — auth model dictates middleware design.
6. **06** — third-party surface area dictates which env vars and server boundaries you need.
7. **09** — debt that should not be ported.
8. **08** — the abstraction seam for verticals; informs `packages/*` vs `apps/*` boundaries.
9. **03** — only after the above; technician is the most complex app and easiest to mis-port without context.
10. **10** — proposal; sanity-check against everything above.

Skip-OK: none. **Must-read first**: 01, 02, 04.

### (b) Developer joining to build the electrician (Qbe) vertical

Goal: ship a working technician app for electricians without breaking FixAIR.

1. **00** (this file) — orientation.
2. **03** — read end-to-end; this is the app you are cloning.
3. **08** — the diff list of what to change for electricians (prompts, sections, samples, photo categories, translations, brand).
4. **04** — the columns and JSON blobs you will be reading/writing; note HVAC shapes called out in 08.
5. **02** — only the technician section + the manager section (managers see technician output).
6. **06** — Anthropic prompt assembly is in here; you will be editing prompts.
7. **09** — known landmines (legacy `chat_type='copilot'` projects, etc.) so you don't repeat fixes.
8. **10** — target architecture, only if the monorepo migration is already underway.

Skip-OK for v1: **05** server-side detail, **07** beyond "how does my user log in".
**Must-read first**: 03, 08.

---

## Changes since previous audit (`claude/fixair-codebase-audit-xeIFv` → `claude/dev-lab-7iGKi`)

`git diff --stat` between the two branches: **25 files changed, 1,915 insertions(+), 11,631 deletions(-)**. The previous `audit/` directory (18 files, ~9,750 lines including `FIXAIR_COMPLETE_AUDIT.md` at 5,020 lines) was deleted; five focused docs landed under `technician/` instead. The bulk of remaining churn is `technician/index.html` itself (3,001 lines diffed).

### 1. Copilot removed — Assistant-only product

- `1254900 feat(technician): Remove Copilot - simplify to Assistant-only`
- `e972cb7 WIP: Rename --copilot CSS variables to --accent`
- `technician/index.html` no longer contains any `copilot`/`Copilot` identifiers (Grep: 0 matches). The CSS custom property `--copilot-*` was renamed to `--accent-*`.
- Side effect: legacy projects with `chat_type='copilot'` in Supabase still exist and tried to render into the deleted `copilotBody` DOM node — see fix below.

### 2. Loading bug fix for legacy Copilot projects

- `e3f115d fix(technician): Fix project loading bug for legacy copilot chats`
- Root cause (per commit message): `loadProject()` threw a silent `TypeError` when `chat_type='copilot'` rows tried to render into the now-deleted `copilotBody` element, halting the whole load path. Fix routes legacy rows to the assistant view.

### 3. Diagnostic logic removed — pivot to reporting-only

- `3ab0135 refactor(technician): Begin diagnostic logic removal (WIP)`
- `fbbf8dd refactor(technician): Remove all diagnostic logic - pivot to reporting-only` (HEAD)
- Only 3 occurrences of `diagnostic|Diagnostic` remain in `technician/index.html` (Grep). The technician app is now scoped to **reporting**, not on-device fault diagnosis. This is a major product-shape change since the previous audit.

### 4. Brand color: `#FF6B35` → `#FC4401` (technician only)

- `86b5b7c style(technician): Replace brand orange #FF6B35 with #FC4401`
- `technician/index.html`: 0 matches for `FF6B35`, 14 matches for `FC4401`.
- **Other apps not yet migrated** — `FF6B35` still appears 61 times across 12 files (`admin/`, `manager/`, `master/`, `operations/`, `auth/`, `invite/`, `r/`, `debug/`, `docs/`, `assets/logo-generator.html`, `404.html`, root `index.html`). Color migration is half-done; flagged in 09.

### 5. Nav redesign (a sequence of fixes, not a single change)

The bottom navigation was rebuilt across **9 commits** between `bd4ccf8` and `f62be86`:
- `ff4d75e` — homepage profile-icon button replaces brand dropdown; new curved bottom nav with floating green `+` (Accueil | `+` | Projets); removed Hotline & Profile from bottom nav; chat header simplified to 2 buttons.
- `bd4ccf8` — nav bar proportions + chat header layout fix.
- `07228df`, `0b52744`, `521baed`, `79e5732`, `5321c30` — iterative `+` button styling: border/shadow removal, z-index fix, `bottom: 80px` spacing, curved notch.
- `64250bf` — center Accueil/Projets icons vertically.
- `f62be86` — active state (green when selected).

### 6. Hotline-as-Pro (feature gated to a future paid tier)

- `6c7c0ad feat(technician): Simplify UI - remove Connect, hotline view, dead code`: full Hotline view panel and ~350 lines of Connect job data deleted. `openHotline()` is now a stub.
- `technician/index.html:18365`: `toast('Hotline FixAIR - Bientôt disponible en version Pro');` — Hotline is shown to users as a future Pro feature rather than a real workflow. The Hotline icon stayed in some intermediate nav iterations and was removed in `ff4d75e`.
- "Connect" workflow + calendar event type fully deleted in the same commit (default calendar event type changed to `assistant`).

### 7. Audit folder restructure

- Old: 18 files under `audit/` (`AUDIT_00_INDEX.md` through `AUDIT_17_ARCHITECTURE_PROPOSAL.md` + `FIXAIR_COMPLETE_AUDIT.md`). All deleted.
- New: 5 focused docs under `technician/` (`AUDIT_DATA_FLOW.md`, `AUDIT_DATA_SCHEMA.md`, `AUDIT_FUNCTIONS.md`, `AUDIT_ISSUES.md`, `AUDIT_WORD_TEMPLATE.md`).
- This `audit-v2/` series replaces both. The new docs under `technician/` are still useful primary sources and are cited where relevant.

### 8. Other notable churn (carried in via merges from `claude/fixair-logo-feature-TS6CS`)

- `a4b904c feat: add company logo upload feature and deep audit documentation`
- `5835c83 feat(report): update Word export to v2 template + sync drawer sections`
- `6356c7c fix(word-export): multiple fixes to match v2 template exactly`
- `da9b067 fix(word-export,drawer): smaller logo + photos now persist after refresh`
- `b23aa10` / `3cd8cc7` `fix(drawer): text auto-save now works reliably` / `db check was silently skipping all saves` — auto-save was broken in the previous audit's HEAD; now fixed.

### What did NOT change

- No package manager added; no build step introduced. Still raw HTML/CSS/JS per role-app, deployed as static files. Per-app HTML files remain monolithic (`technician/index.html` is ~1 MB in one file).
- No new Supabase migration files committed in the diff.
- No tests added.
