# 06 — operations/index.html anatomy

A feature-by-feature dissection of the operations dashboard (the admin/manager surface). Same template as §04:

- **What it is** — user-facing description.
- **Entry points** — function names with `file:line`.
- **State** — module-level variables.
- **DOM** — key element IDs.
- **Data flow** — Supabase queries, webhooks.
- **Honest assessment** — named bugs and placeholders.
- **Verdict for Qbe** — Keep / Modernize / Rewrite + one-line rationale.

**File scope.** `operations/index.html`, 5614 lines. Everything below cites that file unless prefixed.

**Executive preview.** The operations dashboard is the **least-complete surface in the app**: two features (Chat, Call) are alert-only placeholders, the "live" language in the UI is a lie (no realtime subscriptions), Word/PDF export is absent, and session trust defaults to localStorage-without-re-verification. Detail below.

---

## 1. File structure and entry point

**What it is.** A single-page admin application, 5614 lines, delivered as one HTML file with inline CSS and one inline `<script>` block. No build step, no bundler, no modules — everything is in the global scope.

**Entry points (boot sequence).**
- `DOMContentLoaded` listener at `:5607` runs: `initLanguage()` → `initSupabase()` → `initAuth()`.
- `initLanguage()` at `:2364` — loads locale from `localStorage` or `navigator.language`.
- `initSupabase()` at `:2457` — bootstraps the `@supabase/supabase-js@2` client (CDN).
- `initAuth()` at `:2992` — parses URL-hash auth tokens (`#access_token=…`), falls back to `localStorage`.
- `handleAuthenticatedUser()` at `:3060` — role gate → `showMainApp()` at `:3119`.
- `showMainApp()` triggers `initMap()` at `:4630`.

**File structure by line range.**
| Range | Contents |
|---|---|
| 1–10 | Head, external CSS (Google Fonts `:7`, Mapbox GL CSS `:9`), Supabase JS CDN `:10` |
| 12–63 | CSS variables (design tokens) |
| 65–1637 | Inline component CSS (buttons, drawers, cards, map overlays) |
| 1692–1705 | SVG sprite (icons: logo, plus, camera, clipboard, check, arrows…) |
| 1708–2180 | HTML markup (login screen `:1712`, pending/denied screens `:1740–1810`, `#mainApp` `:1836`, map `:1837`, side panels/drawers `:1876–2176`) |
| 2364–5614 | **All JavaScript**, one contiguous inline block |

**External scripts loaded.**
- `@supabase/supabase-js@2` (CDN, `:10`).
- `mapbox-gl-js@2.15.0` JS + CSS (`:8`, `:9`).
- **No `docx`**, **no `jsPDF`**, **no `FileSaver`** — report export is not implemented here (contrast with `technician/index.html`).

**Routing.** No router. Screen visibility toggles between `#loginScreen`, `#emailConfirmScreen`, `#pendingScreen`, `#accessDeniedScreen`, `#passwordResetScreen`, `#mainApp`. Within `#mainApp`, sub-surfaces (`#projectsPage` `:2068`, `#teamsPage` `:2128`, `#calendarView` `:2012`) are shown/hidden by class toggle.

**Configuration constants.**
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` — hard-coded at `:2410–2411` (anon key is acceptable client-side; JWT visible in source is expected).
- Mapbox access token — hard-coded at `:4635` (`pk.eyJ1IjoiZml4YWlyIi…`). **This is a secret-ish value** (Mapbox keys can be scope-limited by URL, but a leaked unrestricted public token lets any site mint tiles against FixAIR's Mapbox bill).

**Honest assessment.**
1. **Single-file, no build pipeline.** The same "one massive HTML" pattern as the technician app. At 5614 lines it is already unwieldy; each feature addition compounds review difficulty.
2. **Inline JS block (`:2364–5614`)** defeats browser caching between deploys — any CSS tweak busts the whole script.
3. **Mapbox token unrestricted** by the code (no `.restrict` call, no URL allowlist visible). Should be configured in the Mapbox console to limit domains — verify.

**Verdict for Qbe.** **Rewrite.** The operations dashboard is a natural fit for a real framework (React/Svelte + Vite) with a proper build step. The single-file pattern was tolerable for the technician app because it's a field tool optimized for one-file hosting; the ops dashboard gets no benefit from that constraint and pays the full cost.

---

## 2. Auth and role check

**What it is.** Four-layer gate: (1) Supabase email+password login, (2) email-confirmation gate, (3) approval-status gate, (4) role gate — only `admin` and `owner` are allowed into `#mainApp`. Managers and technicians hitting this URL are redirected to their respective apps.

**Entry points.**
- `initAuth()` at `:2992` — entry. Parses `#access_token` from URL, falls back to localStorage.
- `handleAuthenticatedUser()` at `:3060` — post-login: calls `loadUserProfile()` at `:3064`, validates role.
- `loadUserProfile()` (~`:3090`) — selects the `users` row by id.
- `showAccessDeniedScreen()` at `:2707` — redirect rules for non-admin roles.
- Logout handlers at `:2836`, `:2912`, `:2932`, `:2960`.

**Role check.**
- `:2551` — first-login path: `!['admin', 'owner'].includes(publicUser.role)` → redirect.
- `:2632` — sign-in path: same check before revealing app.
- `:3077` — main gate: `!['admin', 'owner'].includes(profile.role)` → `showAccessDeniedScreen()`.
- `:3113` — legacy compat check.

**Redirect rules** (`:2707–2760`):
- `manager` → `https://go.fixair.ai/manager`
- `technician` → `https://go.fixair.ai/technician`

**Session management.**
- On successful login (`:3021–3027`), the session is manually stored to `localStorage['supabase.auth.token']`.
- On cold load (`:3038–3056`), the localStorage token is **trusted as-is**: `supabase.auth.setSession({ access_token, refresh_token })` is called with whatever is cached, **without verifying expiry or re-fetching the user row**.
- Logout at `:2836` removes the localStorage key — but does **not** call `supabase.auth.signOut()`, so the session is never invalidated server-side.

**Data flow.**
- `db.from('users').select('role, status, email_confirmed').eq('id', authId).single()` (implicit in `loadUserProfile`).
- `db.auth.signInWithPassword({ email, password })` at the login handler.
- No webhooks.

**Honest assessment.**
1. **Stale token accepted.** A revoked or expired Supabase JWT in localStorage bypasses validation at cold load. The user sees the dashboard until the first query 401s — and many queries silently swallow errors, so "nothing loads" is the only symptom.
2. **Logout is client-side only.** No `signOut()` call — the refresh token stays alive on Supabase's side until it expires naturally.
3. **No refresh-token rotation.** Manual `setSession` without a watcher means long-lived tokens persist indefinitely until manual logout.
4. **Role check runs four times** in slightly different places (`:2551`, `:2632`, `:3077`, `:3113`). Any future role ("supervisor", "regional_manager") must be added to all four.
5. **Post-login access-denied screen** is a redirect, not a dead-end — a hostile user who removes the JS-level redirect gets into `#mainApp` and then hits Supabase RLS as the real gate. RLS had better be correct (see `audit-v2/01b_supabase_rls.sql`).

**Verdict for Qbe.** **Rewrite.** Collapse the four role-check sites into one middleware. Call `supabase.auth.signOut()` on logout. Drop manual localStorage session management in favor of the Supabase client's built-in persistence (which handles refresh-token rotation). Re-verify the user row on every app load, not just the JWT.

---

## 3. Mapbox integration

**What it is.** A Mapbox GL map centered on Paris showing project markers colored by team (Nord=blue, Sud=green, Direct=orange). Markers are DOM elements styled with the technician's initials. Clicking a marker opens the project detail drawer; clicking a technician in the sidebar flies the map to their current project and highlights the marker.

**Entry points.**
- `initMap()` at `:4630` — `new mapboxgl.Map({ container: 'map', style: 'mapbox://styles/fixair/cmkrnkhsl001b01r65zopewtt', center: [2.3522, 48.8566], zoom: 11 })`.
- Marker creation at `:4645–4652` — loop `projects[]`, build a DIV per project, attach `click` handler at `:4650`.
- `flyToTechProject(techId)` at `:4751` — `map.flyTo({ center: project.coords, zoom: 14, offset: [-200, 0] })` + highlight marker via `.active` class.
- `setMarkerActive()` (inline at `:5355`) — toggles `.active` CSS class.

**State.**
- `markers = {}` at `:4628` — global dict keyed by project id.
- `liveProjectData = {}` at `:2420` — project records including `coords`.
- `mapboxgl.accessToken` set at `:4635`.

**DOM.**
- `#map` (the container, `:1837`).
- Marker DIVs are created imperatively; no persistent IDs.

**Data flow.**
- Coordinates come from `projects.coords` (per-project field). If absent, the marker isn't placed — **silently, no console log, no error**.
- No geocoding — addresses are not converted to lat/lng in the client. The DB is assumed to hold coords already.
- No clustering — every project is a raw marker, regardless of density.
- No webhooks.

**Honest assessment.**
1. **Mapbox token hard-coded** at `:4635`. If this token is not URL-restricted in the Mapbox console, any site can use it. Verify out-of-band.
2. **Silent `coords` failure.** A project row missing coordinates produces no marker, no warning, no data-quality alert.
3. **No marker clustering.** With >50 projects in the same city, markers overlap into a visual blob.
4. **No realtime re-render** (see §10). A technician moving to a new site does not move on the map until full reload.
5. **Offset hack** at `:4761–4765` — `flyTo({ offset: [-200, 0] })` nudges the map so the project isn't hidden by the side drawer. Works on desktop; on narrow viewports it flies off-screen.
6. **Hard-coded Paris center.** Opening the dashboard from outside Paris shows an empty map until data loads.

**Verdict for Qbe.** **Modernize.** Keep Mapbox (it's the right tool). Add: server-side geocoding on project creation (write coords on insert), marker clustering (`@mapbox/mapbox-gl-supercluster`), responsive centering (fit to bounds of the loaded projects instead of hard-coded Paris), and tighten the access token's URL allowlist.

---

## 4. Technician list

**What it is.** Two rendering surfaces for the same underlying `liveTeamData` dict. The **Teams page** (`#teamsPage`) shows two card grids — managers and technicians — each with avatar+initials, name, team, live-status dot, and project count. The **map sidebar dropdown** (`#techListDropdown`) shows a filterable vertical list with a left-edge team-color bar and a small progress bar for status.

**Entry points.**
- `loadTeam()` at `:3184` — populates `liveTeamData`. Two branches: INTERNE technicians (`manager_id = currentUserId`, `:3194–3259`) and EXTERNE technicians (via `availability_shares`, `:3262–3296`).
- `renderTeamCards()` at `:4697` — draws `#managersCardList` and `#techsCardList`.
- `renderTechListDropdown()` at `:4731` — draws `#techListDropdown`.
- `updateV7TeamUI()` at `:3299` — fan-out after `loadTeam()` completes.
- Hover highlight `:5181–5191` — cards add/remove `.active` on markers; only wired for the Teams page cards, not for the sidebar dropdown rows.

**State.**
- `liveTeamData` at `:2419` — keyed by tech id: `{ id, name, initials, email, phone, status, memberType, team, currentProject, projects[], messages[], … }`.
- `teamMembers` at `:4614–4622` — **static fallback** mock data with sample technicians, kept in source. Used when the live load fails.

**DOM.**
- `#managersCardList` (`:2162`), `#techsCardList` (`:2164`) — teams page.
- `#techListDropdown` (`:1939`) — map sidebar.
- Filter buttons call `setTeamFilter(filter, btn)` at `:5566`.

**Data flow.**
- `db.from('users').select('*').eq('manager_id', currentUserId)` at `:3193` — internal team.
- For each tech: `db.from('projects').select(...).eq('user_id', techId).limit(10)` at `:3205`.
- For each tech: `db.from('team_messages').select('*').or('sender_id.eq.…,recipient_id.eq.…')` at `:3226` — for the chat-card preview.
- `db.from('availability_shares').select('*, technician:technician_id(*)').eq('accepted_by_manager_id', currentUserId).eq('status', 'accepted')` at `:3262` — external/shared.
- No webhooks.

**Honest assessment.**
1. **N+1 queries.** One `projects` query and one `team_messages` query **per technician**. A manager with 20 techs fires 41 round-trips on page load. Obvious candidate for a single RPC.
2. **Static fallback data in source** (`:4614–4622`) means a broken load silently shows mock names — operators think the app is fine when it isn't.
3. **Hover highlight** only works for the Teams-page cards; the sidebar dropdown (the primary list on the map surface) does not highlight markers on hover.
4. **Status** comes from `tech.live_status || tech.status` — a column-fallback chain that depends on the technician's heartbeat. No indication is shown when the heartbeat has been stale for minutes.
5. **External technicians** (`memberType: 'external'`) are rendered identically to internal ones except for a team badge. The "shared with me via availability" provenance is invisible in the card.

**Verdict for Qbe.** **Modernize.** Replace the per-technician queries with a single RPC that returns the materialized view for one manager. Remove the static fallback array. Add "stale status" UX (e.g., "last seen 12 min ago"). Wire realtime on `users.live_status` (see §10).

---

## 5. Click-into-technician flow

**What it is.** Clicking a technician (card, sidebar row, or indirectly via a project marker) opens the **right-side technician drawer** (`#techMapDrawer`) with: status, current project, team, week stats (interventions completed / avg time / success rate), project history list, and a preview of the last 5 messages from the manager↔tech thread.

**Entry points.**
- `openTechMapDrawer(techOrId)` at `:4775` — map/sidebar entry.
- `openTechDetail(id)` at `:5366` — teams-page entry (alternate).
- `buildTechMapDrawerContent(tech)` at `:4810` — primary HTML builder.
- `buildTechDrawerContent(m)` at `:5248` — second HTML builder (for the teams-page path).

**State.**
- `liveTeamData[techId]` — everything the drawer needs is pre-fetched by `loadTeam()` (§4). The drawer does **no additional queries** — it's a pure render of cached data.

**DOM.**
- `#techMapDrawer` (`:1995`), `#techMDName` (`:1999`), `#techMDRole` (`:2000`), `#techMDStatus` (`:2002`), `#techMapDrawerBody` (`:2004`).
- Drawer footer buttons: `Message` (`:2006`, wired to `openTechChat()`) and `Appeler` (`:2007`, wired to `callTechnician()`) — **both placeholders, see §7 and §8**.

**Data flow.**
- No queries at click time. No webhooks.

**Honest assessment.**
1. **Stats are hard-coded placeholders.** `:4834–4837` contains literal strings: *"5 interventions, 4 completed, 3.5h avg, 92% success"* rendered as if they were real. There is no query behind them.
2. **Two builder functions** (`buildTechMapDrawerContent` and `buildTechDrawerContent`) render the same concept with slightly different layouts. The two entry points each call a different one — consistent within a surface but divergent across.
3. **Availability calendar slot** in the drawer (an empty section) is scaffolded in the HTML but never populated.
4. **"Message" and "Appeler" buttons are visible and enabled** — operators click them and get alert popups (§7, §8). This is worse than "coming soon" — it actively misleads.

**Verdict for Qbe.** **Modernize.** The drawer architecture is sound (pre-fetched data, fast open). Replace hard-coded stats with real queries (a simple RPC per tech), consolidate the two builder functions into one, populate the availability slot, and either implement or remove the Message/Appeler buttons (per §7 / §8 verdicts).

---

## 6. Click-into-report flow (preview + download)

**What it is.** Clicking a project card or a map marker opens the **project detail drawer** (`#mapDrawer`) with a **read-only report preview**: problem summary, site/client info, equipment details, intervention dates/times, error codes, and system status.

**Entry points.**
- `openMapProjectDetail(id)` at `:5326` — map marker entry.
- `openLiveProjectDrawer(projectId)` at `:3691` — live-data entry.
- `buildLiveProjectDrawerContent(p, tech)` at `:3966` — comprehensive HTML builder (the one actually used).
- `buildProjectDrawerContent(p)` at `:5203` — a simpler alternate builder.

**State.**
- `liveProjectData[projectId]` — the pre-fetched project + joined report rows.
- Project shape: `{ id, title, tech, techId, client, address, equipment, status, progress: { total }, report: { id, status, type, problem_reported, problem_identified, solution, error_codes, client, equipment_brand, equipment_model, technician_name, intervention_date, extracted: {…} } }`.

**DOM.**
- `#mapDrawer` (`:1976`), `#mapDTitle` (`:1980`), `#mapDSubtitle` (`:1981`), `#mapDBadge` (`:1982`), `#mapDrawerBody` (`:1985`).

**Data flow.**
- Data comes from `loadProjects()` at `:3309`, which runs `db.from('projects').select('*, technician:user_id(*), report:reports(...)').in('user_id', teamTechIds)` (`:3325`). One query, joins reports via the FK.
- No queries at click time.
- No webhooks.

**Honest assessment — two critical gaps.**
1. **No download.** There is **no download button, no export action, no PDF/Word generator**. `docx`, `jsPDF`, and `FileSaver` are not imported into this file. The preview drawer has no footer action. A manager who wants to email a technician's report cannot do it from here.
2. **No photos rendered.** The builder at `:3999–4200` does not emit `<img>` tags for `projects.photos` or `extracted_data.photos[]`. A report can have 10 photos attached in the technician app; the ops dashboard displays none of them.
3. **No signatures rendered** either — same omission.
4. **Fragile fallback reads.** The builder tries `p.report[0]` (first element of array), then `p.extracted_data`, then `p.problem_description` (`:3410–3429`). Three formats silently mask data-shape drift.
5. **No read-vs-edit distinction.** Because the drawer is read-only by omission (not by design), there's no affordance telling the operator why they can't edit — they just see fields and wonder if clicking would do something.

**Verdict for Qbe.** **Rewrite.** This is a critical manager workflow. Implement the full report preview by reusing the technician-side Word/PDF generator server-side (via an n8n flow) so the ops dashboard can render an iframe'd HTML preview and offer a real download. Photos and signatures must render. Add "view as read-only" language so operators understand the constraint.

---

## 7. Chat-with-technician — **PLACEHOLDER**

**What it is — intended.** A 1:1 chat between the operations user and a technician, embedded in the technician detail drawer (§5).

**What it actually is.** An alert-only placeholder.

**Verbatim source** (`:4880`):
```js
function openTechChat() { alert('Chat avec technicien'); }
```

The `Message` button at `:2006` of `#techMapDrawer` wires to this function. Clicking it produces a native browser `alert()` popup and nothing else.

**Supporting artifacts that look real but aren't.**
- The **chat-card preview** in the drawer renders `tech.messages[]` — real message history, pulled from `team_messages` at `:3226`. Looking at the drawer, it looks like a live 1:1 chat.
- `.chat-input` at `:5241` and `.chat-send` at `:5242` are present in the DOM but **have no event handlers**. The input accepts keystrokes; the send button does nothing.
- The `team_messages` table **exists** and has real rows (the preview reads them) — so a manager sends messages *to* the technician through some other path (presumably the technician app, or manually through the DB), and the ops dashboard only displays them.

**State / DOM.** `tech.messages[]` populated from `loadTeam()` `:3226`. `.chat-card`, `.chat-input`, `.chat-send` all in `#techMapDrawer`.

**Data flow.**
- Read-only: `db.from('team_messages').select('*').or('sender_id.eq.<mgr>,recipient_id.eq.<mgr>')` at `:3226`.
- **No write path.** No insert into `team_messages`. No webhook.

**Honest assessment.**
1. **Actively misleading UX.** An enabled "Message" button that produces `alert()` is worse than no button. First-time users believe the feature exists and was clicked; second time they realise and lose trust.
2. **Orphan input field.** `.chat-input` rendered without handlers is dead pixels.
3. **Asymmetric visibility.** Messages can flow *to* the dashboard (rendered from `team_messages`) but not *from* it.

**Verdict for Qbe.** **Rewrite (by implementing or deleting).** Either: wire the input to a real `db.from('team_messages').insert(...)` with a realtime subscription on incoming replies (aligning with §10 realtime verdict), or remove the fake inputs and the Message button entirely. The current state is the worst of both options.

---

## 8. Call-technician — **PLACEHOLDER**

**What it is — intended.** A one-tap "call this technician" action from the ops drawer.

**What it actually is.** An alert-only placeholder.

**Verbatim source** (`:4881`):
```js
function callTechnician() { alert('Appel technicien'); }
```

The `Appeler` button at `:2007` wires to this. Clicking produces a native `alert()`.

**Ecosystem check.**
- No `tel:` href anywhere in `operations/index.html`. Not even the "cheap" partial-functionality path (opening the native dialer with `<a href="tel:…">`) is implemented.
- No Twilio SDK import, no WebRTC setup, no `getUserMedia`.
- No scheduled-call / callback-request flow either — the button is the only surface.

**Supporting artifacts.** `tech.phone` is loaded by `loadTeam()` (selected as part of `SELECT *` at `:3193`). The data is present; nothing reads it in this code path.

**Data flow.** None.

**Honest assessment.**
1. Same misleading-UX pattern as §7.
2. **`tel:` would be a cheap fix.** Switching the button from `onclick="callTechnician()"` to `<a href="tel:${tech.phone}">` immediately produces correct behavior on mobile (opens the native dialer) and is a free CSS style of a button. The current code is strictly worse than the obvious 5-minute fix.

**Verdict for Qbe.** **Rewrite (by implementing or deleting).** Minimum viable: `tel:${phone}` anchor. Preferred: Twilio Voice browser SDK for a true click-to-call with recording for QA. Whichever direction — do not ship "alert()" as a feature.

---

## 9. Team / project views

**What it is.** Two full-page sub-surfaces inside `#mainApp`. The **Teams page** (`#teamsPage`) lists managers and technicians as card grids with a "All / Managers / Technicians" filter (counts shown inline). The **Projects page** (`#projectsPage`) lists projects with a "All / Nord / Sud / Direct" team filter.

**Entry points.**
- `showTeamsPage()` at `:5152` — nav entry.
- `showProjectsPage()` (wired via `onclick` at `:1886`).
- `setTeamFilter(filter, btn)` at `:5566` — toggles visibility of `#managersSection`/`#techsSection`.
- `setProjectFilter(filter, btn)` at `:5552` — toggles visibility by team.
- Data loaders reused from §4: `loadTeam()` at `:3184`, `loadProjects()` at `:3309`.

**State.**
- `liveTeamData` — keyed by tech id; carries `memberType: 'internal'|'external'` and `team: 'nord'|'sud'|'direct'`.
- `liveProjectData` — keyed by project id; `team` pulled from `liveTeamData[techId].team` at `:3405`; fallback `'direct'` if undefined.

**DOM.**
- `#projectsPage` (`:2068`), `#teamsPage` (`:2128`).
- Card containers: `#managersSection` + `#managersCardList` (`:5569–5570`), `#techsSection` + `#techsCardList` (`:5571–5572`).

**Data flow.**
- Already covered by §4 queries — same `loadTeam()` and `loadProjects()`.
- `db.from('users').select('*').eq('manager_id', currentUserId)` — internal.
- `db.from('availability_shares').select('*, technician:technician_id(*)').eq('accepted_by_manager_id', currentUserId).eq('status', 'accepted')` — external.
- No webhooks.

**Honest assessment.**
1. **Manager-centric, not organization-centric.** There is no `organizations` or `tenants` table; membership is expressed by `users.manager_id`. A company with two managers sees two disjoint team lists — no unified view.
2. **Team names hard-coded as enum-ish strings** (`nord`/`sud`/`direct`). No CRUD UI to create/rename teams in operations. Onboarding a new team requires a DB migration or a direct row update.
3. **No pagination** on either page. The underlying query is capped at 100 (`loadProjects` `:3334`); projects beyond 100 are invisible.
4. **"Direct" fallback** (`:3405`) means technicians without a team silently land in the "Direct" bucket. Operators can't tell "genuinely direct" from "missing team assignment".
5. **No CSV export / no bulk actions.** Card grids only.

**Verdict for Qbe.** **Rewrite.** Introduce a real `organizations` model for multi-tenant grouping. Replace the hard-coded team enum with an `organizations.teams` relation and a management UI. Add pagination + CSV export for managers who need to report across hundreds of projects.

---

## 10. Realtime subscriptions — **NOT IMPLEMENTED**

**What it is — intended.** A dashboard called "operations" with "live" presence dots, a map of projects updated as technicians move, and a status badge reading *En ligne / Inactif / Hors ligne* strongly implies real-time data.

**What it actually is.** A polling-then-static display. There are no Supabase realtime subscriptions anywhere in `operations/index.html`.

**Evidence.**
- `let realtimeSubscriptions = [];` at `:2416` — the array is declared.
- At logout (`:3134–3141`), the code iterates the array calling `.unsubscribe()` on each entry.
- The array is **never pushed to**. Grep for `.channel(`, `.subscribe(`, `postgres_changes`, `broadcast`, `presence` against `operations/index.html` returns zero hits.
- The cleanup loop at `:3135–3140` runs every logout but always iterates an empty array.

**How "status" actually stays fresh.**
- `tech.live_status` is read once during `loadTeam()` at `:3239`.
- `projects.progress` and `reports.status` are read once during `loadProjects()` at `:3365–3391`.
- After initial load, the dashboard is static until the user refreshes.

**User-observable symptom.**
- A technician closes the app (their `users.live_status` flips to `offline` after the `beforeunload` handler fires). The ops dashboard continues to show them as `online` until the manager manually refreshes.
- A technician starts a new project. The marker does not appear on the ops map until manual refresh.
- A project's progress bar never moves while the drawer is open; the bar reflects load-time values.

**State / DOM.** `realtimeSubscriptions` (`:2416`). Status badges `#techMDStatus` (`:2002`). Progress bars `.progress-fill` (`:395`).

**Data flow.** None relevant.

**Honest assessment.**
1. **The UI lies.** Language like *"En ligne"*, live dots, a constantly-rendering map — all imply realtime where the data is hours-stale.
2. **The scaffolding exists.** The `realtimeSubscriptions` array and its cleanup loop were written in anticipation of subscriptions that were never wired. This is the most "shovel-ready" line of code in the file — add 5 subscriptions and the loop works unchanged.
3. **Supabase realtime is enabled** for the project (per §03); the server side is ready. Only the client-side `channel().on().subscribe()` calls are missing.

**Verdict for Qbe.** **Rewrite (by implementing).** Add realtime subscriptions on `users` (presence), `projects` (progress), `reports` (status), and `team_messages` (new-message toast). The scaffolding is already there — this is a half-day task, not a rewrite. Leaving it unimplemented is the single most damaging gap between the ops dashboard's stated value prop and its actual behavior.

---

## Summary — verdicts at a glance

| # | Feature | Verdict | One-line rationale |
|---|---|---|---|
| 1 | File structure and entry point | Rewrite | One-file, no build — fine for technician, wasteful for ops. |
| 2 | Auth and role check | Rewrite | Collapse 4 role-check sites; use Supabase's built-in session; actually `signOut()` on logout. |
| 3 | Mapbox integration | Modernize | Server-side geocoding + clustering + responsive fit-bounds; restrict the access token. |
| 4 | Technician list | Modernize | Replace N+1 per-tech queries with a single RPC; remove static fallback data; add "stale since" UX. |
| 5 | Click-into-technician | Modernize | Replace hard-coded stats with real queries; consolidate the two builders; decide on Message/Appeler buttons. |
| 6 | Click-into-report (preview + download) | Rewrite | Implement full preview (photos, signatures) + server-rendered Word/PDF download. |
| 7 | Chat-with-technician | Rewrite (implement or delete) | Alert-only placeholder; wire to `team_messages` insert + realtime, or remove the input and button. |
| 8 | Call-technician | Rewrite (implement or delete) | Alert-only placeholder; minimum viable is a `tel:` anchor. |
| 9 | Team / project views | Rewrite | Introduce a real org model; replace the hard-coded team enum; add pagination + CSV export. |
| 10 | Realtime subscriptions | Rewrite (implement) | Scaffolding present, zero subscriptions wired. Half-day task, highest value-per-effort in the file. |

**Tallies.** Keep: 0. Modernize: 3. Rewrite: 7 (including two straight placeholders and one never-implemented-realtime surface).

**One-line summary of the whole dashboard.** The operations dashboard is a demo-quality surface sold as production: good map, reasonable drawers, placeholder interactions where the money is (chat, call, report download), and no realtime despite the entire value prop being "see your fleet live". A Qbe rebuild should treat this file as an interactive mockup to port the *structure* from — not a working app to port the *behavior* from.

