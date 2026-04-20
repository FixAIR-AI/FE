# 05 — state and reactivity

How FixAIR keeps state in memory, on disk, in the browser cache, and on the server — and where those layers disagree.

**Why this doc exists.** A reimplementation of FixAIR (e.g. for the Qbe vertical) needs an explicit map of where state lives because the current app is not reactive in any framework sense: there is no React/Vue/Svelte runtime, no store, no observable. State is a constellation of bare module-level variables, `localStorage` blobs, and Supabase rows that are kept loosely in sync by hand-written debounced writers. This file inventories those layers and names the places where they fight.

**Scope.** Everything below is sourced from `technician/index.html` at branch `audit-v2/deep-dive-for-qbe`, with `master/index.html` and the public `index.html` called out only where they materially differ.

---

## Global / module-level variables

Every `let`/`var`/`const` declared at the top level of a `<script>` tag in `technician/index.html`. Roughly 50 entries; clustered by feature area. Lines are at the declaration site.

| Line | Name | Type | Purpose | Shadows / mirrors |
|---|---|---|---|---|
| 6366 | `brand` | string | Currently-selected HVAC brand. | — |
| 6367 | `mode` | string | Chat mode (`assistant` / `hotline`). | — |
| 6368 | `isSplit` | bool | Split-pane layout active. | — |
| 6369 | `isConnected` | bool | Live API/voice connection up. | — |
| 6370 | `isConnecting` | bool | Connection attempt in flight. | — |
| 6371 | `isDisconnecting` | bool | Disconnection in flight. | — |
| 6372 | `chatOpen` | bool | Chat drawer visible. | — |
| 6373 | `currentPhotoPanel` | string | Which panel owns photo capture (`assistant`/`hotline`). | — |
| 6374 | `currentPage` | string | Active route (`home`/`projects`/`hotline`/`profile`). | — |
| 6377 | `currentTheme` | string | UI theme. | localStorage `fixair_theme` |
| 6378 | `currentLang` | string | UI language. | localStorage `fixair_language` + `fixair_lang` (two keys, see §localStorage) |
| 6381 | `translations` | object | i18n maps. | — |
| 6645 | `onboardingStep` | number | 1–4 wizard cursor. | — |
| 6646 | `onboardingComplete` | bool | Wizard finished. | localStorage `fixair_onboarding_done` + `users.onboarding_done` |
| 6647 | `step3Done` | bool | Onboarding step 3 done. | — |
| 6648 | `step4Done` | bool | Onboarding step 4 done (gates step 3 visual completion). | — |
| 6649 | `onboardingBrand` | string\|null | Brand chosen in step 1. | **memory only** — lost on reload mid-wizard |
| 6746 | `SUPABASE_URL` | string | Project URL. | — |
| 6747 | `SUPABASE_ANON_KEY` | string | Anon key (shipped to browser). | — |
| 6749 | `db` | object\|null | Supabase client. | — |
| 6750 | `supabaseReady` | bool | Client initialised. | — |
| 6768 | `mermaidReady` | bool | Mermaid library loaded. | — |
| 7020 | `toastTimeout` | number\|null | Active toast timer. | — |
| 7036 | `REPORT_STATUS` | object | Enum (`IN_PROGRESS`/`COMPLETED`). | — |
| 7041 | `reportCompletionState` | object | `{ status, isLocked }` for the current report. | derived from `projects.completion_status` |
| 7316 | `pendingNewFields` | array | Fields awaiting merge into `lastReportData`. | — |
| 7465 | `API_BASE` | string | n8n webhook host root. | — |
| 7466 | `currentUser` | object\|null | Logged-in user profile. | localStorage `fixair_user` + Supabase `auth.users` |
| 7467 | `supabaseUser` | object\|null | Raw Supabase auth user. | mirrors `db.auth.getSession()` |
| 7473 | `cachedApiKeys` | object | Per-project ElevenLabs key cache. | Supabase `app_settings` |
| 7699 | `loginStep` | number | 0/1 carousel cursor. | — |
| 7700 | `existingUserData` | object\|null | Email-step lookup result. | shadows `users` row |
| 8044 | `IDLE_TIMEOUT` | number | 5-minute idle threshold (ms). | — |
| 8045 | `idleTimer` | number\|null | Idle-detection setTimeout id. | — |
| 8046 | `currentLiveStatus` | string | Presence (`online`/`idle`/`offline`). | Supabase `users.live_status` |
| 8291 | `companyLogoData` | string\|null | Base64 logo. | Supabase `users.company_logo` (and Supabase Storage in the other code path — see §source-of-truth) |
| 9522 | `currentUserId` | string\|null | Resolved user id used in writes. | `currentUser.id` + localStorage `fixair_demo_user_id` |
| 9523 | `currentProjectId` | string\|null | Open project. | `projects.id` |
| 9524 | `currentChatId` | object | `{ assistant: string\|null }`. | `chats.id` |
| 9527 | `projectMessageCount` | number | Conversation length counter. | derived from `messages` rows |
| 10801 | `lastReportData` | object\|null | The live report mirror. | **`projects.extracted_data`** — the most important mirror in the app |
| 13320 | `REPLACE_ARRAYS` | array | `['travaux_effectues','travaux_prevoir','recommandations']` — wholesale-replace list. | — |
| 13433 | `_saveTimeout` | number\|null | Extracted-data debounce timer. | — |
| 13434 | `_pendingSaveData` | object\|null | Queued payload for the debounced write. | — |
| 14230 | `drawerDraggedElement` | element\|null | Drag-and-drop ref. | — |
| 14231 | `drawerActiveEditable` | element\|null | Currently-focused contenteditable. | — |
| 14232 | `drawerNumCounter` | number | Auto-numbering counter. | — |
| 14233 | `drawerAutoSaveTimeout` | number\|null | Drawer-side debounce timer (parallel to `_saveTimeout`). | — |
| 14234 | `reportIsCompleted` | bool | Locked-for-edit flag. | derives from `projects.completion_status` |
| 14237 | `drawerUndoStack` | array | Undo (cap 50). | **cleared on `closeReport()`** |
| 14238 | `drawerRedoStack` | array | Redo. | cleared on close |
| 18496 | `FREEMIUM_CONFIG` | object | Limits, prices, Stripe URL, owner-bypass UUID. | — |
| 19582 | `lastKnownStats` | object | Prior-session totals. | localStorage `fixair_lastStats` |
| 19583 | `celebrationInProgress` | bool | Confetti re-entry lock. | — |
| 19786 | `techCalDate` | Date | Calendar cursor. | — |
| 19787 | `techCalView` | string | `day`/`week`/`month`. | — |
| 19788 | `calendarEvents` | array | Loaded events. | Supabase `calendar_events` + localStorage `fixair_calendar_events` |
| 19789 | `editingEventId` | string\|null | Edit modal target. | — |
| 20628 | `TP` | object | Technical-prompt analyzer state (`color`/`mode`/`steps`). | — |

**Window-attached** (also globally readable): `window.reportPhotos` (`:9073+`), `window.projectsData` (`:9754`).

**Headline.** Roughly **half** the global variables shadow durable storage. There is no abstraction over the duplication — every reader picks its own truth.

---

## localStorage keys

Every `localStorage.{set,get,remove}Item` call against a stable key. Sourced from `technician/index.html` (production); demo and master use a subset of the same keys.

| Key | Shape | Writers | Readers | Purpose | Cleared by |
|---|---|---|---|---|---|
| `fixair_theme` | string `'dark'\|'light'` | `:6554` | `:6377` | UI theme. | Logout doesn't clear; persists across users on a shared device. |
| `fixair_language` | string `'fr'\|'en'` | `:6572` | `:6378` | Locale (current key). | Same. |
| `fixair_lang` | string `'fr'\|'en'` | `:6573` | `:6378` | **Legacy alias** for `fixair_language` — both are written on every change for backcompat with older builds. | Same. |
| `fixair_user` | JSON `{ id, email, first_name, role, status, … }` | `:8194`, `:8201` | `:8181`, `:6940`, `:6953`, `:14111` | Cached profile for fast cold-load. Authoritative for `user_id` in many writes. | Logout flow at `:8035` removes it. |
| `fixair-tech-auth` | JSON `{ token, expires, … }` | `:6982` | (only deletion: `:8031`) | Pre-Supabase auth blob. **Legacy** — code only deletes it. | Logout. |
| `fixair_onboarding_done` | string `'true'` | `:8805` | `:7988` | First-run wizard completion. | Logout (`:8035`). |
| `fixair_demo_user_id` | string (uuid) | `:9563` | `:9560` | Stable demo-mode identity. | Never (intentional — demo carries across sessions). |
| `fixair_freemium_usage` | JSON `{ assistantChatsTracked, reportsGenerated, bufferQueries, isPro, weekStart }` | `:18561` | `:18524` | Weekly quota counters. | Never — quota survives logout. **Per-device only.** |
| `fixair_lastStats` | JSON `{ totalMinutes, totalEuros, reports }` | `:19588` | `:19582` | Cached home-tile counters for celebration deltas. | Never. |
| `fixair_calendar_events` | JSON array of `calendar_events` rows | `:19847` | `:19833`; deleted `:19821` | Demo/offline calendar fallback. Authenticated users read from Supabase. | Demo path clears on certain transitions (`:19821`). |
| `fixair_company_settings` | JSON `{ company_name, company_logo, … }` | `:8376+` | profile open path | Company metadata cache. **The only persistence for `company_name`** — it is *not* written to Supabase. See §source-of-truth and §04 Profile. |

### Cross-cutting properties
- **Two keys for one value.** `fixair_lang` + `fixair_language` are both written on every change. Either drift produces a stale UI on cold load. The newer build should pick one and migrate.
- **No schema version** on any blob. Adding a new required property to `fixair_user` will silently mis-read older payloads.
- **No `QuotaExceededError` handling** at any write site. `fixair_calendar_events` (demo) and `fixair_freemium_usage` (long retention) can both grow unboundedly.
- **`fixair_company_settings` is the *only* place `company_name` lives.** A fresh device renders the export with a blank company header until the user reopens Profile and re-saves.
- **`fixair_freemium_usage` is the quota.** Clear browser storage and the user's weekly limit resets to 0/20. Quota is enforceable on a single device only.

---

## sessionStorage

**Not used in production code.** Grep for `sessionStorage.{set,get,remove,clear}Item` against `technician/index.html`, `master/index.html`, and the public `index.html` returns zero hits.

`debug/index.html` reads and clears `sessionStorage` (at `:928–934`) but is not part of the shipped surface — it's the local debug tool.

**Implication.** A tab-scoped store (which `sessionStorage` would provide) does not exist anywhere in the app. Every cached value above is either tab-local in memory (the global vars) or device-wide on disk (`localStorage`). There is no per-tab isolation — opening FixAIR in two tabs of the same browser shares the same `localStorage['fixair_user']`, and the *last tab to write wins*. This is a documented gotcha, not a bug, but worth flagging for a Qbe rebuild that expects per-tab project isolation.

---

## IndexedDB

**Not used.** Grep for `indexedDB`, `IDBDatabase`, `IDBObjectStore`, `Dexie`, `openDB`, `idb.` against `technician/index.html` (and the rest of the FE tree) returns zero hits.

**Implication for Qbe.** Reports with embedded base64 photos and signatures routinely push the in-memory `lastReportData` past 200 KB; nothing stores that locally for offline editing. A photographic-evidence-heavy field tool would benefit from an IndexedDB-backed offline queue (Dexie, `idb-keyval`), but that's a new build, not a port of existing behavior.

---

## Supabase realtime subscriptions

**None.** Grep for `.channel(`, `.subscribe(`, `postgres_changes`, `broadcast`, `realtime` against `technician/index.html` returns zero hits.

The app is **fully poll/refresh-on-navigate**. Specifically:
- The home tile (§04 §2) reads stats from a one-shot `db.from('projects').select(…).limit(20)` (`:9729`). A second device that creates a project will not refresh the stats until the user re-navigates to home.
- The project list (§04 §3) is the same one-shot query. Renames/deletes from another device are invisible until the user reloads the list.
- Chat history is loaded once per project open (§04 §5). A second device replying in the same chat is invisible.
- Quota counters (§04 §13) live in `localStorage`, so a second device's chats do not count against the device the user is typing on. Multi-device freemium effectively has multiplied limits.

### Web workers / service workers

**None.** No `new Worker(...)`, no `navigator.serviceWorker`, no Workbox. The app does not register a service worker — there is no offline shell, no push notifications, no background sync. Tesseract.js (§04 §7) creates its own internal Worker for OCR fallback, but no app-owned worker holds state.

### Implication for Qbe
A modern field-app rebuild should:
1. Subscribe to `projects` and `messages` rows for the current user via `supabase.channel(...).on('postgres_changes', …)` so multi-device flows work.
2. Register a service worker for offline shell + background sync of pending edits.
3. Move quota counters server-side (per §04 §13 verdict) so realtime subscription on `users.subscription_tier` becomes the single source of truth across devices.

---

## Race conditions observed in code

Specific, reproducible races. Each is named by the function(s) and lines involved.

### R1 — `drawerAutoSave()` ↔ `debouncedSaveExtractedData()` collision
**Functions.** `drawerAutoSave()` at `:14962` and `debouncedSaveExtractedData()` at `:13436`.
**Race.** Both debounce 800 ms and both write `projects.extracted_data`. They use *different* timeout vars (`drawerAutoSaveTimeout` vs `_saveTimeout`). When a user edit (drawer-side) and an extraction response (chat-side) land within the same 800 ms window, two `UPDATE projects SET extracted_data = …` queries fire concurrently. Whichever Postgres applies last wins; there is no row-level lock or `if-modified-since`.
**Symptom.** "Enregistré ✓" pops twice; the row contains the second writer's payload, silently dropping the other writer's diff.

### R2 — `triggerExtraction()` out-of-order response
**Function.** `triggerExtraction()` at `:16181`, response handled by `handleExtractionResult()` at `:16221`.
**Race.** No `AbortController`. Each chat turn fires one extraction request; the request body snapshots `current_report_data: lastReportData` at call time (`:16205`). If turn N+1 fires before turn N returns, two extractions are in flight against two different snapshots. The late-arriving response calls `unifiedMerge(lastReportData, …)` against the *current* `lastReportData` — overwriting whatever the earlier response added.
**Symptom.** Rapid two-message bursts produce reports that "lose" some of message 1's facts because message 0's extraction returned late and re-merged a stale snapshot.

### R3 — `saveProfile()` + `saveCompanySettings()` dual-await
**Functions.** `saveProfile()` at `:8156`, `saveCompanySettings()` at `:8376`, dispatched at `:8269` without `Promise.all`.
**Race.** Both fire an independent `db.from('users').update(...)`. If the second `.update` resolves before the first, the first's PATCH (issued earlier but slow) lands second and overwrites the second's column writes. The "Profil enregistré ✓" toast at `:8272` fires before either has confirmed.
**Symptom.** Save first name + company name simultaneously; reload; sometimes only one of the two persisted.

### R4 — `createProjectForEvent()` orphans a project on chat-insert failure
**Function.** `createProjectForEvent()` at `:19921`.
**Race / bug.** Project insert at `:19933` returns the row id; chat insert at `:19946` may fail (FK constraint, RLS, network); error captured but never checked at `:19956` (comment: "Chat creation error handled silently"). The function returns `project.id` regardless. Caller at `:20322` saves the orphan project id onto the calendar event.
**Symptom.** Open the project from the calendar — drawer opens, but there is no chat panel. The user cannot send a message because no `chats` row exists.

### R5 — Magic-link callback ↔ dashboard load
**Functions.** `handleMagicLinkCallback()` at `:6949`, `loadUserDashboard()` at `:7942`.
**Race.** On cold load with `#access_token` in the URL hash, the callback runs first, calls `setSession`, then issues a `location.replace(...)` redirect at `:6998`. The redirect is not awaited. In the milliseconds before navigation fires, `loadUserDashboard()` (already queued from the boot path) reads `currentUser` and starts hydrating the UI with potentially stale state.
**Symptom.** Brief flash of post-callback UI before redirect; on the redirect target page, a second hydration overwrites the first.

### R6 — Pending save lost across navigation
**Functions.** Drawer auto-save (`drawerAutoSave` + `flushDrawerAutoSave` at `:15047`) vs `Router.navigate` at `:7511`.
**Race.** `flushDrawerAutoSave()` is only called by `closeReport()` at `:9337`. Navigation that *doesn't* close the drawer (e.g., clicking the Projects nav button while the drawer happens to stay mounted) does not flush. The pending 800 ms timeout fires after `rptDoc` has been removed from the DOM; the extract pass at `:15059` reads `null` and the save no-ops at `:15060`.
**Symptom.** Type into the drawer, immediately navigate, lose the typing.

### R7 — `beforeunload` and `visibilitychange` do not flush
**Functions.** `visibilitychange` at `:8094` (only sets `users.live_status='idle'`), `beforeunload` at `:8104` (only marks `live_status='offline'`).
**Gap.** Neither fires `flushDrawerAutoSave()` or `_saveTimeout`. Closing the tab within the 800 ms debounce window loses the buffered edits.
**Symptom.** Typing → ⌘W → reopen → typing is gone.

### R8 — MediaRecorder leak on navigation
**Functions.** `startRecording()` at `:16781`, `stopRecording()` at `:16943`.
**Race / leak.** Stream tracks are stopped only inside `stopRecording` at `:16966`. No nav guard. User starts recording → navigates away → stream stays open → mic LED stays on.
**Symptom.** Browser reports microphone in use; user has to revoke permissions or close the tab to release it.

### R9 — `_pendingSaveData` lost across re-entry
**Function.** `debouncedSaveExtractedData()` at `:13436` stores the queued payload in `_pendingSaveData`.
**Race.** A new call **replaces** `_pendingSaveData` (no merge). If the previous payload was the result of a long extraction and the new one is from a quick drawer keystroke, the rich extraction payload is overwritten by a single-field edit. Both write paths overlap because R1 means there's no single queue.
**Symptom.** Same as R1 — edits silently lost.

---

## Source-of-truth map

For each piece of state that exists in more than one layer, who is authoritative, where the duplicates live, and the resulting risk.

| State item | Authoritative source | Duplicates | Risk |
|---|---|---|---|
| Logged-in user profile | Supabase `auth.users` + `public.users` | `currentUser` (mem, `:7466`); `supabaseUser` (mem, `:7467`); `localStorage['fixair_user']` | Cold-load reads localStorage first (`:8181`) before Supabase confirms — stale row visible until refresh. Many writes use `currentUser.id` derived from the cache, so a deleted server row produces orphan inserts. |
| `user_id` for writes | Supabase `auth.getUser()` | `currentUser.id`, `currentUserId` (`:9522`), `localStorage['fixair_user'].id`, `localStorage['fixair_demo_user_id']` (demo) | Four candidates, each used by some writer. Mid-session storage clear breaks the next save. |
| Session/JWT | Supabase `auth.getSession()` | `localStorage['fixair-tech-auth']` (legacy, only deleted) | Negligible — code never reads the legacy key. |
| Active project | Supabase `projects.id` | `currentProjectId` (mem, `:9523`); URL hash on the technician page | Dual writes if two tabs open the same project; last save wins. |
| Active chat | Supabase `chats.id` | `currentChatId.assistant` (mem, `:9524`) | Same as above. |
| Report data | **Supabase `projects.extracted_data`** | `lastReportData` (mem, `:10801`); the drawer DOM (contenteditable nodes, see §04 §9); `_pendingSaveData` (mem, `:13434`) | **Highest-impact duplication in the app.** R1, R2, R6, R7, R9 all attack this. |
| Photos | Supabase `projects.photos` (column) **and** `projects.extracted_data.photos[]` (jsonb) | `window.reportPhotos` (`:9073+`) | Three writers, two columns. Word/PDF export reads from `extracted_data.photos[]`; the standalone column rots. |
| Signatures | Supabase `projects.extracted_data.signatures.*` (inline base64) | `lastReportData.signature_client` / `signature_technicien` | Single source on disk — but inline base64 inflates row size; see §02. |
| Company name | **`localStorage['fixair_company_settings'].company_name` (only)** | — | Critical: not persisted to Supabase. New device = blank company in exports. |
| Company logo | Conflict — split between Supabase `users.company_logo` (base64) **and** Supabase Storage `FixAIRbucket/logos/…` (URL) | `companyLogoData` (mem, `:8291`) | Two storage models depending on which code path produced the row. Word export reads whichever is set. |
| Language preference | Supabase `users.language` | `currentLang` (mem, `:6378`); `localStorage['fixair_language']`; `localStorage['fixair_lang']` | Three caches, two localStorage keys, one DB column. Language change without explicit Save persists to localStorage only — DB is stale. |
| Theme preference | localStorage `fixair_theme` (only) | `currentTheme` (mem, `:6377`) | Per-device. No DB column. |
| Onboarding completion | Supabase `users.onboarding_done` | `localStorage['fixair_onboarding_done']`; `onboardingComplete` (mem) | Local cache wins on cold boot (`:7988`), then DB overrides. New device can flash the wizard. |
| Quota counters (chats / reports / buffer) | **`localStorage['fixair_freemium_usage']` (only)** | `FREEMIUM_CONFIG` (constants, `:18496`); `users.subscription_tier` for tier flag | Per-device only. Clear cache → quota resets. Multi-device → multiplied limit. |
| Subscription tier | Supabase `users.subscription_tier` | `localStorage['fixair_freemium_usage'].isPro` | Polled, not subscribed. Stripe webhook is **planned but not built** (§03 appendix), so paying customers can be locked out for hours. |
| Referral code | Supabase `users.referral_code` | `referralState.code` (mem) | Generated client-side without uniqueness check (`:19258`); collision possible on common first names. |
| Stats (totalMinutes / totalEuros / reports) | Computed from `projects` rows on demand | `lastKnownStats` (mem, `:19582`); `localStorage['fixair_lastStats']` | Recomputed every project-list load; cache only drives the milestone-celebration delta. Delete a project → stats silently drop. |
| Calendar events | Supabase `calendar_events` | `calendarEvents` (mem, `:19788`); `localStorage['fixair_calendar_events']` (demo only) | Authenticated path is single-source; demo path can drift indefinitely. |
| Live status | Supabase `users.live_status` | `currentLiveStatus` (mem, `:8046`) | Heartbeat-driven (`:8094`, `:8104`) — usually consistent. |
| Message count | Supabase `messages` rows | `projectMessageCount` (mem, `:9527`); `chats.message_count` (cached column on chats row) | Three sources; the cached column is updated client-side and can drift. |
| API keys (ElevenLabs) | Supabase `app_settings` | `cachedApiKeys` (mem, `:7473`) | RLS lets every logged-in user read; key is shipped to browser anyway (§02 / §04 §6). |
| Brand for current report | `lastReportData.brand` / `.brand_key` | `brand` (global, `:6366`); `projects.brand`; `projects.original_brand`; `onboardingBrand` (mem, `:6649`) | Five places, no canonical writer. `normalizeReportData` reconciles on every render but only inside `lastReportData`. |

### Summary
- **15 of 20 state items are duplicated** across at least two layers.
- **3 critical "single source on the wrong layer" cases:** company name (only in localStorage), quota counters (only in localStorage), company logo (split between two Supabase locations). Each is a customer-visible regression on multi-device use.
- **0 reactive subscriptions.** Every cross-layer read is one-shot — drift between layers is never automatically reconciled.
- **The Qbe rebuild's largest leverage point:** define the truth source for every item up-front (Postgres for everything user-shared, IndexedDB for offline-edit buffers, localStorage for genuinely per-device UI prefs only), and forbid duplication through types.
