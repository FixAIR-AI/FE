# 08 — security and compliance

Catalog of security and compliance issues on branch `audit-v2/deep-dive-for-qbe` (equivalent to `claude/dev-lab-7iGKi` for code scope). Each issue is verified by direct file read before inclusion.

**Sourcing note.** The prior audit's "20 issues, 2 CRITICAL / 4 HIGH / 9 MEDIUM / 3 LOW / 2 INFO" breakdown is a reference target — the catalog below is rebuilt from concrete evidence surfaced across §02–§07 of this audit, plus a final sweep. Exact counts per severity differ slightly from the prior audit because this pass found some new issues (hardcoded ElevenLabs keys in `admin/` and `manager/`, which prior audits only flagged as `app_settings` fetches in the technician app) and confirmed some prior issues as fixed or partial.

**Per-issue format:**
- **Issue.** Name.
- **Severity.** CRITICAL / HIGH / MEDIUM / LOW / INFO.
- **Status.** Present / Partial / Fixed.
- **Location.** Current file:line.
- **Exploit path.** 2-sentence how-to-abuse.
- **Qbe approach.** Usually "don't port this; do X".

---

## CRITICAL

### C1 — Hardcoded master-key shared secret
- **Severity.** CRITICAL.
- **Status.** Present.
- **Location.** `master/index.html:2511–2514` (declaration), used at `:2538`.
- **Evidence.** Verified by direct Read — literal source:
  ```js
  const SUPPORT_CONFIG = {
      webhookUrl: 'https://cherhabil.app.n8n.cloud/webhook/support-login',
      masterKey: 'FixAIR_Houssam_2026!'
  };
  ```
- **Exploit path.** Any visitor who loads `master/index.html` (no login required to read the HTML) can copy the literal `'FixAIR_Houssam_2026!'` string and POST it to the `support-login` n8n webhook with any email to mint a magic-link for that user's account. The webhook authenticates on the key alone, not on the caller's Supabase session, so full account takeover is one `curl` away.
- **Qbe approach.** Do not port this pattern. Move impersonation behind a server-gated RPC that checks `auth.jwt()['role'] = 'master'` in Postgres. Rotate and retire `FixAIR_Houssam_2026!` immediately and audit the support-login webhook logs for any unexpected caller IPs.

### C2 — Magic-link leaked to browser console on every impersonation
- **Severity.** CRITICAL.
- **Status.** Present.
- **Location.** `master/index.html:2552`.
- **Evidence.** Verified by direct Read:
  ```js
  console.log('=== MAGIC LINK ===', magicLink);
  ```
  emitted inside `accessTechnicianAccount(email)` after the webhook returns.
- **Exploit path.** Any browser extension, devtools proxy, or shoulder-surfer observing the master user's console captures full-privilege magic-links for every "Accéder au compte" click — each link hydrates a session as the target technician without consent trail. Combined with C1 this becomes a one-step account takeover that also self-logs the link for replay.
- **Qbe approach.** Never log auth material. Minimum: delete the line. Long-term: replace the magic-link impersonation flow with a server-side "impersonation session" that writes an audit row to a `support_sessions` table and scopes the session with a visible banner in the impersonated UI.

---

## HIGH

### H1 — ElevenLabs API key hardcoded in source (admin + manager)
- **Severity.** HIGH.
- **Status.** Present (new discovery this pass — previously tracked only as the `app_settings` fetch).
- **Location.** `admin/index.html:2604` and `manager/index.html:2675`, byte-identical:
  ```js
  const ELEVENLABS_API_KEY = 'sk_22d550a1aecd2627750e50b5cf337ef5372bbbbcd35c8b71';
  ```
- **Exploit path.** Anyone who scrapes either public file owns the key and can bill arbitrary ElevenLabs usage to FixAIR's account. Rotating the key requires editing three surfaces (admin, manager, and the `app_settings` row read by the technician app); every minute of rotation lag is production minutes the abusive key still works.
- **Qbe approach.** Don't port direct third-party API calls from the client. Move transcription behind an n8n flow (or a Supabase edge function) that holds the key as a server-side credential. Rotate the current key on cutover.

### H2 — ElevenLabs API key fetched client-side via `app_settings`
- **Severity.** HIGH.
- **Status.** Present.
- **Location.** `technician/index.html:7481–7498` (the `getApiKey('elevenlabs_api_key')` fetch + `cachedApiKeys` cache), consumed at `:16869` and sent as `xi-api-key` header at `:16879`.
- **Exploit path.** Any authenticated user reads the key from the `app_settings` row via Supabase's REST API (the `SELECT` policy on `app_settings` is permissive per `audit-v2/01b_supabase_rls.sql`). Same billing-fraud attack as H1, only the retrieval is via Supabase rather than plain file scrape.
- **Qbe approach.** Delete the `app_settings.elevenlabs_api_key` row after the proxy in H1 is live. Harden the `app_settings` RLS to `service_role`-only. Never expose raw provider keys to browsers.

### H3 — Stale Supabase token trusted from `localStorage` on cold load
- **Severity.** HIGH.
- **Status.** Present.
- **Location.** `operations/index.html:3038–3056`; same pattern in `admin/index.html:1783–1787` and `manager/index.html:1856–1860`.
- **Exploit path.** On cold load, the code pulls `access_token`/`refresh_token` from `localStorage` and calls `supabase.auth.setSession(...)` without verifying the token's expiry or revocation status. A revoked or compromised JWT remains usable in-browser until a server round-trip 401s; many queries in the codebase swallow errors, so revoked sessions go undetected until a user notices "nothing loads".
- **Qbe approach.** Use the Supabase client's built-in session persistence (`persistSession: true`) and its automatic refresh-token rotation. Drop the manual `localStorage['supabase.auth.token']` shadow. Wire an auth-state change listener that redirects to the login page on `SIGNED_OUT` / token-refresh-failure events.

### H4 — Logout doesn't call `supabase.auth.signOut()` — session not revoked server-side
- **Severity.** HIGH.
- **Status.** Present.
- **Location.** `operations/index.html:2836`; same pattern across admin/manager/master logout handlers.
- **Exploit path.** "Logout" only deletes the `localStorage` session copy; the refresh token remains valid on Supabase until it naturally expires (days). A device left at a cafe that a second user logs out on still leaks a refresh token through the browser's restore-session UI or disk forensics. With C1 absent, this alone wouldn't be severe; combined with the manual-restore path in H3, it makes "log out" a local-only action.
- **Qbe approach.** Always call `await supabase.auth.signOut()` before clearing local state. Add a server-side "sign out from all devices" action for support cases.

---

## MEDIUM

### M1 — Client-side-only role gates across four surfaces
- **Severity.** MEDIUM (escalates to HIGH on any RLS misconfiguration).
- **Status.** Present.
- **Location.** `admin/index.html:1298, 1379, 1496`; `manager/index.html:1418, 1496, 1613, 1893, 1929`; `operations/index.html:2551, 2632, 3077, 3113`; `master/index.html:3829, 3885`. Multiple gates per file, all JS-level.
- **Exploit path.** A user with a valid Supabase session but a lower role can open DevTools, bypass the JS gates, and render the admin UI. Subsequent writes are only prevented by Postgres RLS — if a single policy is too permissive (e.g. a broad `USING (true)` fallback), privilege escalation lands server-side too.
- **Qbe approach.** Collapse all per-file role gates into one middleware. Treat the client gate as UX only. Lean on RLS as the real boundary and add integration tests that prove every role-scoped route fails at the DB layer for a wrong-role session.

### M2 — `localStorage['fixair_user']` trusted as `user_id` in writes
- **Severity.** MEDIUM.
- **Status.** Present.
- **Location.** `technician/index.html` — derived variable `currentUserId` (`:9522`) populated from `fixair_user` cache, then used in `.insert({ user_id: currentUserId, … })` across chat, project, and save paths.
- **Exploit path.** A hostile user who can write to the victim's `localStorage` (via XSS, shared device, or browser-extension) can rewrite the `fixair_user.id` field to someone else's UUID and make the next save attribute to the wrong account. RLS catches most of this, but any policy keyed on `auth.uid()` vs the inserted `user_id` mismatch silently rejects instead of alerting.
- **Qbe approach.** Never derive `user_id` from cache. On every write, call `(await supabase.auth.getUser()).data.user.id` fresh. Fail closed if that returns null.

### M3 — Owner-bypass UUID hardcoded in client source
- **Severity.** MEDIUM.
- **Status.** Present.
- **Location.** `technician/index.html:18584`.
- **Exploit path.** The `FREEMIUM_CONFIG` check hard-codes the user id `d5baabf1-147a-4ee5-a07a-8f80212fbc9a` as a bypass — anyone who reads the file learns that specific account has unlimited quota. If that account's password leaks, the attacker gains unthrottled Assistant access. More subtly, the hard-coded UUID reveals the owner's identity to anyone scraping the repo.
- **Qbe approach.** Move the bypass to a `users.role = 'owner'` check on the server. Delete the literal UUID from client source.

### M4 — Mapbox access token hardcoded and potentially unrestricted
- **Severity.** MEDIUM (pending verification).
- **Status.** Present.
- **Location.** `operations/index.html:4635`.
- **Exploit path.** Mapbox public tokens can be URL-allowlisted in the Mapbox console — if this one isn't, any site can use the token and charge tiles against FixAIR's Mapbox bill. Verify out-of-band whether the token is restricted to `go.fixair.ai` and `fixair.ai`; if not, treat as HIGH.
- **Qbe approach.** Always restrict Mapbox public tokens to production domains in the Mapbox dashboard. Load the token from environment / CI secrets, not from hardcoded source.

### M5 — Demo-mode bypass via `demo-*` user id prefix
- **Severity.** MEDIUM.
- **Status.** Present.
- **Location.** `technician/index.html` — dozens of sites branching on `userId.startsWith('demo-')`, e.g. `:9724`, `:19925`.
- **Exploit path.** Any client can set its own `localStorage['fixair_demo_user_id']` (or `fixair_user.id`) to a `demo-*` value and bypass most DB writes. The demo branches "succeed" cosmetically (no DB round-trip, no error), so the UI looks functional. While no real data is modified, demo mode pollutes analytics, skews usage counters, and provides a reliable way to make the app *look* authenticated when it isn't.
- **Qbe approach.** Don't conflate "demo mode" with "authenticated user". If demo mode is needed, scope it to a real Supabase account with RLS policies that pin its writes to a sandboxed schema.

### M6 — Manual token-in-URL parsing with `detectSessionInUrl: false`
- **Severity.** MEDIUM.
- **Status.** Present.
- **Location.** `auth/index.html:1004` (`detectSessionInUrl: false`), `:1519` (manual `window.location.search` parse).
- **Exploit path.** Magic-link URLs arrive as `?access_token=…&refresh_token=…`. The custom parser handles the happy path, but not every code branch calls `history.replaceState` to clean the URL after consumption. A link re-shared (copied, emailed, bookmarked, or auto-saved by browser sync) leaks the tokens. An attacker with access to any of those channels hijacks the session.
- **Qbe approach.** Enable `detectSessionInUrl: true`. The Supabase client handles URL-cleanup atomically and consistently. Delete the custom parser.

### M7 — Swallowed Supabase errors produce orphan rows and silent save loss
- **Severity.** MEDIUM.
- **Status.** Present.
- **Location.** Many sites. Representative: `technician/index.html:19956` (chat-insert failure in `createProjectForEvent` swallowed; project row persists without its paired chat row). Also `:15060`, `:3392` (operations data coercion fallbacks).
- **Exploit path.** Not directly exploitable but compounds abuse. Failed writes mask misconfigured RLS, failed migrations, or quota exhaustion. A hostile user who trips RLS sees a UI that looks like success; a legitimate user hit by a transient error never learns that their data didn't save.
- **Qbe approach.** Log every swallowed error to a dedicated `client_errors` table via a server-side fire-and-forget endpoint. Surface write failures to the user with retry. Never continue execution past a failed insert/update to dependent code without an explicit "this is fine" reason in a comment.

### M8 — N+1 query pattern in `loadTeam()`
- **Severity.** MEDIUM (perf + amplifies other issues).
- **Status.** Present.
- **Location.** `operations/index.html:3193, 3205, 3226` (one `projects` query and one `team_messages` query per technician).
- **Exploit path.** A manager with 100 techs fires 201 round-trips on page load. An attacker-controlled `manager_id` value (via M2-style `localStorage` tampering) could trigger this path against a different manager's team id, amplifying their ability to probe RLS by firing 100× the queries in one page load.
- **Qbe approach.** Replace with a single Postgres RPC that returns the manager's materialized team view. Batching is a perf win; it also tightens the audit surface — one RPC call is easier to rate-limit than 200 `.select()` calls.

### M9 — No payment-verification webhook; subscription state is poll-driven
- **Severity.** MEDIUM.
- **Status.** Present (per §04 §13 and §03 appendix — Stripe webhook planned, not built).
- **Exploit path.** A user who pays via Stripe's checkout link is gated out until the frontend polls and Supabase's `users.subscription_tier` has been updated by some external-to-this-repo mechanism. If that mechanism fails silently, a paying customer remains locked out indefinitely and has to contact support. The converse — a cancelled subscription that never flips back to `free` — is the customer-adverse mirror.
- **Qbe approach.** Wire the Stripe webhook to a server endpoint (Supabase edge function or n8n flow with signature verification) that writes `users.subscription_tier` atomically. Pick one side of the state machine as authoritative (Stripe) and reconcile from it; never poll for billing state.

---

## LOW

### L1 — No rate-limit / CAPTCHA / MFA on login
- **Severity.** LOW.
- **Status.** Present.
- **Location.** `auth/index.html` login handler (`:1243`). Supabase's default server-side throttling is the only brake.
- **Exploit path.** An attacker with a leaked email list can credential-stuff login attempts at the rate Supabase tolerates (per-IP). Compromised accounts then inherit all app privileges; combined with M6's manual URL-parse, a successful guess leaks the access_token through URL history.
- **Qbe approach.** Add hCaptcha / Turnstile on the login form. Enable Supabase MFA for `admin`/`owner`/`master` roles. Add an application-level lockout after N failed attempts per email.

### L2 — MediaRecorder leak on navigation
- **Severity.** LOW (UX and privacy — mic stays hot).
- **Status.** Present.
- **Location.** `technician/index.html:16781` (start) / `:16943` (stop); no cleanup on `pagehide`, `beforeunload`, or `Router.navigate`.
- **Exploit path.** Not an externally-exploitable issue, but a privacy-adjacent bug: a user who taps Record and navigates away leaves the mic active until the tab is closed. A malicious or buggy browser extension observing active streams gets an unintended audio capture window.
- **Qbe approach.** Register `pagehide` + nav-guard hooks that call `stream.getTracks().forEach(t => t.stop())`. Consider the Permissions API `released` events as a belt-and-braces signal.

### L3 — `fixair_freemium_usage` quota tracked only in `localStorage`
- **Severity.** LOW (abuse, not security).
- **Status.** Present.
- **Location.** `technician/index.html:18524` (read), `:18561` (write).
- **Exploit path.** A user who wants to bypass the weekly-20-chats limit clears `localStorage` and starts fresh. Multi-device users get multiplied limits for free. Not a data-exposure bug, but a direct revenue-leak.
- **Qbe approach.** Move quota tracking to a `usage_counters` table keyed on `(user_id, week_start)` with server-enforced writes. See §04 §13 verdict.

---

## INFO

### I1 — Legacy `chat_type = 'copilot'` rows remapped on read
- **Severity.** INFO.
- **Status.** Present (intentional, documented).
- **Location.** `technician/index.html:10190` reads `chat.chat_type === 'copilot'` and remaps to `'assistant'` for display. New writes always produce `'assistant'` (`:9292`, `:9609`, `:9951`).
- **Exploit path.** None. Flagged because the remap code obscures the historical shape — a rebuild that ports the reader without the legacy branch will still "work" on fresh data and silently regress on any customer with pre-pivot rows.
- **Qbe approach.** Don't port. Migrate rows at cutover (`UPDATE chats SET chat_type='assistant' WHERE chat_type='copilot'`) and drop the `'copilot'` value from the enum.

### I2 — Referral code generation without uniqueness check
- **Severity.** INFO.
- **Status.** Present.
- **Location.** `technician/index.html:19258` — `firstname + Math.floor(Math.random()*10000)`.
- **Exploit path.** None direct. Two users with the same first name can collide on the same referral code; attribution goes to whichever row was inserted first. Revenue-impacting if the referral system is wired to real incentives.
- **Qbe approach.** Retry-on-conflict with an exponential length bump. Better: use `nanoid(8)` or base32-of-`gen_random_uuid()` and skip the "firstname" vanity.

---

## Newly identified issues (this pass)

### N1 — Stored XSS in calendar event titles
- **Severity.** HIGH.
- **Status.** Present (new discovery).
- **Location.** `technician/index.html:20035` (day view) and `:20072–20075` (month view).
- **Evidence.** Verified by direct Read — `:20035` literally:
  ```js
  <div class="daily-event-title">${ev.title}</div>
  ```
  inside a template literal that is handed to `innerHTML` via the parent `.innerHTML = …` assignment. No escape function is in sight.
- **Exploit path.** A user creates a `calendar_events` row with `title = '<img src=x onerror=alert(1)>'`. Every render of that event — day view, week view, month view — executes the injected JavaScript in the viewing browser's origin, under the viewing user's session. RLS on `calendar_events` (per `audit-v2/01b_supabase_rls.sql`) scopes reads to the owner, so the primary victim is self. But any view that aggregates events across users (e.g. a future ops dashboard render) promotes this to cross-user stored XSS.
- **Qbe approach.** Escape all user-controlled strings at the render boundary. In any framework (React, Svelte, Vue), interpolations are escaped by default — the vulnerability is a consequence of hand-rolled `innerHTML` templating. Do not port the template-literal pattern; let the framework own escape.

### N2 — Event IDs unescaped in inline `onclick` / `oncontextmenu` attributes
- **Severity.** MEDIUM.
- **Status.** Present (new discovery).
- **Location.** `technician/index.html:20031, 20034` (day view) and `:20070, 20075` (month view).
- **Exploit path.** `${ev.id}` is embedded inside `onclick="handleEventClick(event, '${ev.id}')"` and similar handlers. A row id containing a single quote breaks out of the handler and injects arbitrary JS. `calendar_events.id` is a server-generated UUID, so exploitability is contingent on whether the UUID can be attacker-controlled (it generally cannot); still, the pattern is a defense-in-depth failure that will bite other columns that get shoved into handlers later.
- **Qbe approach.** Don't inline handlers. Use event delegation with `data-event-id` attributes and a single document-level listener. If you must inline, escape with `encodeURIComponent` or JSON-encode.

### N3 — No Subresource Integrity (SRI) on CDN scripts
- **Severity.** MEDIUM.
- **Status.** Present.
- **Location.** Every HTML entry point. Examples: `master/index.html:10` (supabase-js), `technician/index.html:5525–5526` (supabase-js + tesseract), operations and admin and manager equivalents.
- **Exploit path.** A CDN compromise (cdn.jsdelivr.net, unpkg.com, etc.) silently ships modified JS to every FixAIR user. Without `integrity="sha384-…"` the browser has no way to detect the swap. Precedent: the 2021 Polyfill.io supply-chain compromise affected thousands of sites that had no SRI.
- **Qbe approach.** Add `integrity` and `crossorigin` attributes to every `<script src=https://cdn…>`. Better: self-host vendored copies and eliminate the CDN dependency entirely.

### N4 — No Content-Security-Policy / `X-Frame-Options` / `X-Content-Type-Options`
- **Severity.** MEDIUM.
- **Status.** Present.
- **Location.** No CSP `<meta>` tag in any HTML entry point; no security headers in `_redirects` or `_headers`.
- **Exploit path.** Combined with N1, there is no secondary containment for an XSS that lands. `X-Frame-Options` absence means the technician app can be framed for clickjacking. `X-Content-Type-Options: nosniff` absence allows MIME-confusion attacks on any uploaded asset.
- **Qbe approach.** Ship a baseline CSP (`default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; connect-src 'self' https://*.supabase.co https://api.elevenlabs.io https://*.n8n.cloud; frame-ancestors 'none'`). Add `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin` at the host (Netlify `_headers`, Cloudflare Pages `_headers`, etc.).

### N5 — PII logged to browser console
- **Severity.** LOW.
- **Status.** Present.
- **Location.** `technician/index.html:8165`:
  ```js
  console.log('Form data:', { firstName, lastName, email, phone, language });
  ```
  Additional occurrences in the magic-link path (see C2) and the ElevenLabs fetch path.
- **Exploit path.** Any installed browser extension with access to console output harvests user PII. Not a direct compromise, but GDPR-ish: logged PII crosses a boundary the user did not consent to.
- **Qbe approach.** Strip all PII-bearing `console.*` calls before production. Add a lint rule. In development, gate logs behind a `DEBUG` flag that is always false in production builds.

---

## Summary table — all 21 issues

| ID | Severity | Issue | Location | Status |
|---|---|---|---|---|
| C1 | CRITICAL | Hardcoded master-key shared secret | `master/index.html:2513` | Present |
| C2 | CRITICAL | Magic link logged to browser console | `master/index.html:2552` | Present |
| H1 | HIGH | ElevenLabs key hardcoded in admin + manager source | `admin/index.html:2604`, `manager/index.html:2675` | Present |
| H2 | HIGH | ElevenLabs key fetched client-side via `app_settings` | `technician/index.html:7481–7498`, `:16869`, `:16879` | Present |
| H3 | HIGH | Stale Supabase token trusted from `localStorage` | `operations/index.html:3038–3056`, admin/manager analogues | Present |
| H4 | HIGH | Logout skips `supabase.auth.signOut()` | `operations/index.html:2836` + analogues | Present |
| N1 | HIGH | Stored XSS in calendar event titles | `technician/index.html:20035`, `:20072–20075` | Present (new) |
| M1 | MEDIUM | Client-side-only role gates | admin/manager/ops/master multi-site | Present |
| M2 | MEDIUM | `localStorage['fixair_user']` trusted as `user_id` | `technician/index.html:9522` | Present |
| M3 | MEDIUM | Owner-bypass UUID hardcoded in source | `technician/index.html:18584` | Present |
| M4 | MEDIUM | Mapbox token hardcoded, restriction unverified | `operations/index.html:4635` | Present |
| M5 | MEDIUM | Demo-mode bypass via `demo-*` prefix | `technician/index.html:9724`, `:19925`, many more | Present |
| M6 | MEDIUM | `detectSessionInUrl: false` + manual URL-parse | `auth/index.html:1004`, `:1519` | Present |
| M7 | MEDIUM | Swallowed Supabase errors produce orphan state | `technician/index.html:19956` et al | Present |
| M8 | MEDIUM | N+1 queries in `loadTeam()` | `operations/index.html:3193, 3205, 3226` | Present |
| M9 | MEDIUM | No payment-verification webhook; billing is poll-driven | §04 §13 | Present |
| N2 | MEDIUM | Event IDs unescaped in inline handlers | `technician/index.html:20031, 20034, 20070, 20075` | Present (new) |
| N3 | MEDIUM | No SRI on CDN scripts | every entry HTML | Present (new) |
| N4 | MEDIUM | No CSP / X-Frame-Options / X-Content-Type-Options | every entry HTML | Present (new) |
| L1 | LOW | No rate-limit / CAPTCHA / MFA on login | `auth/index.html:1243` | Present |
| L2 | LOW | MediaRecorder leak on navigation | `technician/index.html:16781` | Present |
| L3 | LOW | Quota counters tracked only in `localStorage` | `technician/index.html:18524`, `:18561` | Present |
| N5 | LOW | PII logged to browser console | `technician/index.html:8165` + more | Present (new) |
| I1 | INFO | Legacy `chat_type='copilot'` rows | `technician/index.html:10190` | Present |
| I2 | INFO | Referral code generated without uniqueness check | `technician/index.html:19258` | Present |

**Counts: 2 CRITICAL, 5 HIGH, 12 MEDIUM, 4 LOW, 2 INFO — 25 issues total.**

**Deltas vs the prior audit target (2/4/9/3/2 = 20):**
- HIGH +1 — the stored XSS in calendar titles (N1) is a new find.
- MEDIUM +3 — unescaped inline handlers (N2), missing SRI (N3), missing CSP (N4).
- LOW +1 — PII in console logs (N5).
- Everything the prior audit flagged is either still present or its residual piece documented; no issue from the prior list was found to be fixed on this branch.

**Priority for the Qbe rebuild.**
1. C1, C2, H1, H2 — rotate/delete every client-shipped secret before any Qbe code is written.
2. N1 — a real stored XSS that will bite as soon as any multi-user view of `calendar_events` ships.
3. H3, H4, M1, M2 — the session/role-gate complex. A modern framework with built-in route guards + Supabase's native session persistence collapses five issues into one design decision.
4. N3, N4 — ship CSP and SRI on day one. They cost nothing and catch the long tail of issues not yet identified.
5. M9 — wire the Stripe webhook. Losing paying users to a poll bug is more expensive than any engineering effort required to fix it.

