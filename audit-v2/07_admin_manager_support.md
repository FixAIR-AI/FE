# 07 — admin / manager / master / support

The four back-office surfaces outside the core technician + operations apps. Each is a standalone single-file SPA with its own role gate and its own feature scope. Collectively they are the admin surface area of FixAIR, and — as §06 did for ops — this doc is where the placeholders, duplicated code, and hardcoded secrets get named.

**Scope.**
- `admin/index.html` (3618 lines)
- `manager/index.html` (3808 lines)
- `master/index.html` (4123 lines)
- `auth/index.html` (1799 lines) — treated as the "support" / login-landing surface

Each section below is structured: purpose → user → auth model → key features → **security issues (verbatim-cited)** → verdict. A final synthesis section answers the "merge or keep separate" question for a Qbe rebuild.

---

## 1. `admin/index.html`

**Purpose.** An oversight dashboard for the two highest-privilege roles in FixAIR. Aggregates team management, project oversight, availability sharing (accept/reject shares from other managers), team messaging, technician invitations, and a calendar view. Visually a superset of `manager/` with slightly broader data scope.

**User / target role.** `admin` and `owner` only. The client-side gate is at `admin/index.html:1298`:
```js
if (publicUser.role && !['admin', 'owner'].includes(publicUser.role))
```
Wrong-role users land on an "Accès réservé" screen; managers are pushed to `/manager` and technicians to `/` (`:1302–1309`, `:1477–1488`).

**Auth model.**
- Supabase `signInWithPassword` at `:1355`.
- `resetPasswordForEmail` at `:1254`.
- Signup redirect to `https://go.fixair.ai/auth?email=…&from=admin` at `:1328` (hands off to `auth/`).
- Session restored from `localStorage` at `:1783–1787`.
- Role re-verified post-login at `:1379` by re-reading `public.users.role`.
- **No master-key / support-login path** — admin does not ship that pattern.

**Key features.**
1. **Team management** (`:1884+`) — filtered by `manager_id = currentUserId`. Real.
2. **Project oversight** (`:1896+`) — joins `projects` + `reports`. Real.
3. **Availability shares accept/reject** (`:2121–2122`) — writes `availability_shares` and cascades into `calendar_events` inserts. Real.
4. **Team messaging** (`:2293–2299`) — `team_messages` insert + fetch. Real.
5. **Technician invitations** (`:2319`) — generates UUID token, writes `invitations` row, emits signup URL. Real.
6. **Calendar / month + week view** (`:2633`) — day navigation UI. Real.
7. **Voice transcription** (`:3554+`, `:3569`) — direct `fetch` to ElevenLabs. Real, but see security.
8. **Chat interface with waveform** (`:3219–3244`) — partial; capture works, save/broadcast path unclear.

**Security issues (critical, verbatim).**
- **`admin/index.html:2604` — hardcoded ElevenLabs API key in source**, byte-identical to the key in `manager/index.html:2675`:
  ```js
  const ELEVENLABS_API_KEY = 'sk_22d550a1aecd2627750e50b5cf337ef5372bbbbcd35c8b71';
  ```
  This is worse than the `app_settings` pattern used by the technician app — the key isn't even pretending to live behind Supabase RLS here; it's a plain string in public HTML. Anyone who opens DevTools (or scrapes the GitHub repo) owns the key.
- **Hardcoded `SUPABASE_ANON_KEY`** (`:1278`) is expected and fine (anon keys are meant to be public); flagged only for completeness.
- **All role enforcement is client-side.** Lines `:1298`, `:1379`, `:1496` are JS-level gates. The only real gate is Supabase RLS — see `audit-v2/01b_supabase_rls.sql`. If any RLS policy is misconfigured, a hostile user can override the JS gate via DevTools and perform admin operations.
- **Session token trusted from `localStorage`** at `:1783–1787` without expiry validation.

**Verdict for Qbe.** **Rewrite.** Delete the hardcoded ElevenLabs key and any direct third-party API calls from the client; move them behind an n8n flow or edge function. Consolidate role gates to one middleware. Drop manual `localStorage` session handling in favor of the Supabase client's built-in session store. The feature list is sound; the implementation leaks secrets.

---

## 2. `manager/index.html`

**Purpose.** Near-identical to `admin/` — same layout, same nav, same surfaces — but scoped for the `manager` role. A manager sees only their own team. The file is a 95%-fork of the admin file; most line numbers in admin have analogues offset by a few hundred lines here.

**User / target role.** `manager`, `admin`, `owner`. Client-side gate at `manager/index.html:1418`:
```js
if (publicUser.role && !['manager', 'admin', 'owner'].includes(publicUser.role))
```
Wrong-role users (technicians) redirect to `/` (`:1422`, `:1571–1579`). Admins and owners can log in here too — the wider role list means this page is reachable by anyone above `technician`.

**Auth model.**
- Supabase `signInWithPassword` at `:1472`.
- `resetPasswordForEmail` at `:1374`.
- Signup redirect to `https://go.fixair.ai/auth?email=…&from=manager` at `:1445`.
- Session restored from `localStorage` at `:1856–1860`.
- Role re-verified post-login at `:1496`.
- Additional role gates at `:1613`, `:1893`, `:1929` — four client-side reaffirmations in total.
- **No master-key path.**

**Key features** (same as admin, narrower scope).
1. **Team management** (`:1957`) — internal techs via `users.manager_id`. Real.
2. **Project oversight** (`:1969`) — same `projects` + `reports` join. Real.
3. **Availability share accept/reject** (`:2194–2195`). Real.
4. **Team messaging** (`:2366–2372`). Real.
5. **Technician invitations** (`:2393`). Real.
6. **Calendar / week view** (`:2704`). Real.
7. **Voice transcription** (`:3682+`, `:3697`). Real, but see security.

**Security issues (critical, verbatim).**
- **`manager/index.html:2675` — hardcoded ElevenLabs API key, byte-identical copy**:
  ```js
  const ELEVENLABS_API_KEY = 'sk_22d550a1aecd2627750e50b5cf337ef5372bbbbcd35c8b71';
  ```
  Same key, same value as `admin/index.html:2604`. Rotating the key requires editing both files (and the `app_settings` row that `technician/index.html` still reads, §04 §6). Three independent copies of one secret is a leak-by-design.
- **Four client-side role gates** (`:1418`, `:1496`, `:1613`, `:1893`, `:1929`). Any future role addition must touch all of them, or the surface is silently under-/over-gated.
- **Code duplication with admin.** The two files drift independently — a bug fix to `admin/` does not automatically land in `manager/`, and vice versa. The "Voice transcription" feature (`:3682` here, `:3554` in admin) is a concrete case where the two forks have diverged slightly.
- **Session token trusted from `localStorage`** (`:1839`) without expiry validation, same pattern as admin.

**Verdict for Qbe.** **Rewrite — by merging with admin.** These two files should not be two files. A real framework with role-aware route guards would collapse `manager/` and `admin/` into one codebase with a single permission matrix. Keeping them separate ~4000-line forks guarantees drift. See §5 synthesis for the recommendation.

---

## 3. `master/index.html`

**Purpose.** The "god-mode" control panel. Subtitle at `:226` reads *"Administration centrale — Accès restreint"*. Lists all users and all enterprises across the platform, can suspend accounts, can generate magic links to impersonate any technician, and can send platform-wide emails.

**User / target role.** Only users with `public.users.role = 'master'`. Client-side gate at `:3885`. Login rejected with *"Accès réservé aux administrateurs Master"* for non-master accounts.

**Auth model.**
- Supabase `signInWithPassword` at `:3919` for the logged-in master user.
- Role gate at `:3829`, `:3885`.
- **And a second, orthogonal auth channel**: the `SUPPORT_CONFIG` master-key flow (below), which issues magic links for *other* users without requiring those users' passwords.

**Key features.**
1. **User management** (`:2260`, `:2309`, `:2578`) — list, filter, search technicians / managers / admins. Real.
2. **Enterprise management** (`:2503–2606`) — view/suspend enterprises. Real.
3. **"Accéder au compte" — impersonation** (`:2517–2574`, `:2589`, `:2606`) — the feature with the master-key leak. Real.
4. **Platform email send** (`:3508` — `EMAIL_SEND_WEBHOOK`) — admin emails to arbitrary users. Real. Payload shape documented in `audit-v2/03_n8n_flows.md` §5.
5. **Dashboard stats** (`:1169`, `:1223`) — user/project/chat counts. Real.
6. **Approval workflow** (`:1281` — `N8N_WEBHOOK_URL`) — approve/suspend users via n8n. Real.

**Security issues (critical, verbatim).**

**The master-key leak.** Declared at **`master/index.html:2511–2514`**:
```js
// Configuration Support Access
const SUPPORT_CONFIG = {
    webhookUrl: 'https://cherhabil.app.n8n.cloud/webhook/support-login',
    masterKey: 'FixAIR_Houssam_2026!'
};
```

Used to mint magic-links for arbitrary users at **`:2531–2540`** (`accessTechnicianAccount(email)`):
```js
const response = await fetch(SUPPORT_CONFIG.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: email,
        master_key: SUPPORT_CONFIG.masterKey
    })
});
```

**What this means.** The literal string `'FixAIR_Houssam_2026!'` is a plaintext shared secret that the n8n `support-login` workflow treats as proof that the caller is a platform admin. Because the string is shipped to every browser that loads `master/`, **any visitor who knows (or guesses, or finds) the URL of `master/index.html` — or anyone who grep's the GitHub repo — can POST to the support-login webhook with that key and mint a magic-link for any email in the system**. The master dashboard's own role gate (`:3885`) gates the UI; it does not gate the webhook, because the webhook authenticates on the key alone.

The impact is full account takeover for any user on the platform. This is the single most severe issue documented in this audit. (Referenced in §03 §6 and §04 §1 previously; reconfirmed verbatim here.) The user's brief cited `:2550` — the declaration is at `:2513`, and the magic-link extraction from the webhook response happens at `:2550` (the line reads: `const result = Array.isArray(data) ? data[0] : data;`). Both lines belong to the same flow.

**Second critical: magic-link logged to console.** `:2552`:
```js
console.log('=== MAGIC LINK ===', magicLink);
```
Every impersonation action writes the magic link to the browser console, where any installed extension / debug proxy / shoulder-surfer can see it.

**Other concerns.**
- Supabase creds at `:1279–1280` (expected, fine).
- Webhook URLs exposed at `:1281`, `:2512`, `:3508` (expected — clients have to know where to POST).
- No network-level gate on master URL. The hostname is the only obscurity; anyone who learns `go.fixair.ai/master` (or the equivalent Pages URL) can attempt login.

**Verdict for Qbe.** **Rewrite — and specifically, delete this shape before Qbe ships.** Master-level operations must be server-only: a `server_actions` table or an RPC gated by Postgres role, with the master user proving identity via their Supabase session, not a shared secret. The UI can stay; the auth model must change. Rotate the `FixAIR_Houssam_2026!` key and audit access logs *today*; long-term, the key should not exist at all.

---

## 4. `auth/index.html` — the support / login-landing page

**Purpose.** The universal authentication entry point — the page all other surfaces redirect to for login, signup, email confirmation, and password reset. Not a feature-bearing dashboard; a bouncer. The word "support" in the task brief maps to this surface: it is where magic-links from `master/` deposit impersonated sessions, and it's where password-reset flows land.

**User / target role.** Anyone who is signing up, logging in, confirming an email, or resetting a password. No role gate — it is the page that *decides* the role-based redirect. Existing authenticated users who land here get routed out.

**Auth model.**
- Supabase `signInWithPassword` at `:1243`.
- Two-step login slider (email → password, `:1074–1091`).
- Password reset via `resetPasswordForEmail` (`:668–691` markup, handler in the `/recovery` callback path).
- Email-confirmation screen for pending-verification users (`:585–624`).
- **Manual token handling** — the Supabase client is configured with `detectSessionInUrl: false` at `:1004`. The page parses `?access_token=…&refresh_token=…` from `window.location.search` itself (`:1519`) and hands the pair to `supabase.auth.setSession()`.
- Status checks (`:1209–1216`, `:1266–1275`) block `pending` / `rejected` / `suspended` users before redirect.
- Role-based redirect after login (`:1286–1299`): `technician` → `/technician/`, `manager` → `/manager/`, `admin`/`owner` → `/admin/`, `master` → `/master/`.

**Key features.**
1. **Two-step login** (`:1074–1091`).
2. **Technician signup** (`:510–525`) — email, password, phone, name.
3. **Enterprise signup** (`:573–576`) — adds `company_name`.
4. **Email confirmation screen** (`:600–623`) — shows after signup, waits for the confirmation email click.
5. **Password reset** (`:668–691`).
6. **Role-based post-login routing** (`:1286–1299`).

**Security issues.**
- **Token-in-URL handling is manual.** Because `detectSessionInUrl: false` is set (`:1004`), the page manually extracts `access_token` and `refresh_token` from the query string and posts them to `setSession` (`:1519+`). Any code path that forgets to URL-clean after consumption leaks the token through `document.referrer` / browser history / shared URLs. Quick audit: the page does `history.replaceState` — but only on some branches, not all. Worth a dedicated review pass.
- **`SUPABASE_ANON_KEY` hardcoded** (`:1279–1280`). Expected and fine; flagged for completeness.
- **No rate-limiting** on the login form at the client level. Supabase default server-side throttling is the only brake.
- **No CAPTCHA, no MFA, no account-lockout UX.**
- Inherits the master-key magic-link path: after `master/` mints a link via the support-login webhook, the resulting URL drops the user into `auth/` for session hydration. `auth/` has no way to distinguish a legitimate magic-link from a master-key-minted one — the only defense is upstream (rotating / deleting the master key per §3).

**Verdict for Qbe.** **Modernize.** The page itself is small and coherent; the issues are integration-level (depends on the master-key flow being safe upstream). Standardize on Supabase's built-in `detectSessionInUrl: true` so manual URL parsing becomes dead code, add a CAPTCHA, wire MFA, and ensure every token-bearing URL is cleaned on landing. A rewrite is disproportionate.

---

## 5. Merge or keep separate? — recommendation for Qbe

**Recommendation: merge `admin/`, `manager/`, and `master/` into one admin app; keep `auth/` separate.**

### Why merge admin + manager + master

1. **They already are 80–95% the same file.** `admin/index.html` and `manager/index.html` are near-verbatim forks — same layout, same feature matrix, role scope is the only meaningful difference. `master/index.html` adds a handful of platform-wide screens on top of the same base. Three copies of the same code guarantee drift — the ElevenLabs key sitting byte-identical at `admin/:2604` and `manager/:2675`, and the voice-transcription feature diverging between them, are live examples.

2. **One codebase enables one permission matrix.** Four client-side role checks in `manager/` (`:1418`, `:1496`, `:1613`, `:1893`, `:1929`) and three in `admin/` become one route guard with a declarative `requires=['admin','owner']` or `requires=['master']` per route. Adding "regional_manager" in the future becomes a one-line change, not a search-and-replace.

3. **Shared components are the biggest win.** The team card, project drawer, calendar widget, invitation flow, and team-message composer are duplicated in all three files. Each duplication is a place where a bug fix has to land three times or it doesn't fully land.

4. **Secrets get one home.** Rotating the ElevenLabs key, or (better) eliminating it by moving transcription behind an n8n flow, is one edit in a merged app — today it's three edits in three files plus the `app_settings` row read by the technician app.

5. **The merge cost is small compared to the Qbe rebuild you're already doing.** If Qbe is a new framework (React/Svelte + Vite), the admin/manager/master app is ~4k lines of framework-agnostic UI logic — porting three near-identical files is barely more work than porting one.

### Why keep `auth/` separate

1. **Different lifecycle.** `auth/` is the only surface that must function before the user has a session — it can't assume any of the app's global state. Putting it in the same bundle as the main admin app means the admin app's scripts and assets load on every login page hit.

2. **It's the bouncer for everyone.** Technicians, managers, admins, masters all funnel through it. Coupling it to the admin bundle would pull admin-only code (e.g. master-key flows, if those still existed in a sane form) into the technician's login page.

3. **It's the narrowest attack surface.** Keeping `auth/` small, auditable, and isolated from feature code is a security posture. The current file is 1799 lines and mostly markup — that property is worth preserving.

### What the resulting tree looks like

```
/app              ← merged admin dashboard (routes gated by role)
  /admin          ← admin/owner default route
  /manager        ← manager scope
  /master         ← master scope (platform-wide screens)
  /shared         ← team cards, drawers, calendar, invitations
/auth             ← unchanged — login / signup / reset / confirm
/technician       ← unchanged (or: modernized per §04)
/operations       ← unchanged (or: modernized per §06)
```

### Caveats
- **Do not ship a merged app with the master-key leak intact.** The merge must be accompanied by the §3 verdict — delete `SUPPORT_CONFIG.masterKey` and move impersonation behind a server-gated RPC. Otherwise the merge just concentrates risk.
- **Role boundaries become a test surface.** A merged app with three role tiers needs a real test matrix — unit tests on the route guard, integration tests that a `manager` session cannot hit `/master` routes client-side, and RLS tests that prove the server-side gate independently.

