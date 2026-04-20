# 04 — technician/index.html anatomy

A feature-by-feature dissection of the technician single-page app. Every section follows the same template:

- **What it is** — what the user sees / does.
- **Entry points** — the function names and `file:line` for the primary handlers.
- **State** — the global / module-level variables that the feature reads or mutates.
- **DOM** — the IDs the feature owns.
- **Data flow** — the Supabase queries and the n8n webhooks the feature touches (the wire shapes themselves are documented in §02 and §03 respectively).
- **Honest assessment** — what works, what's bug-prone, with named bugs.
- **Verdict for Qbe** — Keep / Modernize / Rewrite, with a one-sentence rationale.

**Conventions.** All `file:line` references are against `technician/index.html` at branch `audit-v2/deep-dive-for-qbe` unless prefixed (e.g. `master/index.html:1281`). The "Verdict" rubric:
- **Keep** — port the behavior verbatim; the design is sound.
- **Modernize** — port the contract but reimplement the internals (e.g. extract a component, add types, replace a library).
- **Rewrite** — design is wrong; redo from spec, not from this code.

---

## 1. Auth flow

**What it is.** A two-step email → password login screen. Step 0 looks the user up by email and confirms the row exists with `role='technician'` and `status='active'`. Step 1 takes the password and hands it to `supabase.auth.signInWithPassword()`. Magic-link callbacks (signup confirmation, password reset) are handled at boot time. Demo mode is an escape hatch where IDs prefixed `demo-` skip every Supabase write.

**Entry points.**
- `nextLoginStep()` at `:7747` — validates email, fetches the user row, advances the slider to step 1.
- `prevLoginStep()` at `:7739` — slides back to step 0.
- `handleMagicLinkCallback()` at `:6949` — parses URL hash on cold load; on a recovery link, redirects to `/auth`; on a signup confirmation, hydrates session and proceeds.
- `loadUserDashboard()` at `:7942` — sets `currentUser`/`supabaseUser` and reveals `#mainApp`.

**State.**
- `loginStep` (`:7699`), `existingUserData` (`:7700`).
- `currentUser` (global, declared `:7466`), `supabaseUser` (set `:7969`).
- `localStorage['fixair_user']` (written `:8181`, `:8251`; read on cold boot for fast hydration before the Supabase round-trip).
- `localStorage['fixair-tech-auth']` is **only ever deleted** (`:6982` removes a legacy pre-Supabase key) — kept for cleanup of old installs.

**DOM.**
- `#loginScreen`, `#loginEmail`, `#loginPassword`, `#loginBtn`, `#loginSlider` (the 2-step carousel — translates on `loginStep` change), `#loginStatus` (error text), `#mainApp` (revealed after auth succeeds).

**Data flow.**
- `db.from('users').select('id, email, first_name, status, role').eq('email', email).maybeSingle()` (`:7765`).
- `db.auth.signInWithPassword({ email, password })` (`:7837`).
- `db.from('users').select('*').eq('id', userSlug).single()` (`:7947`).
- `db.auth.getSession()` (`:8176`); `db.auth.setSession(...)` (`:6968`) for magic-link rehydration.
- No webhooks.

**Honest assessment.**
1. **No rate-limit or MFA** — supabase auth's defaults only.
2. **Email validation is `@`-presence only** (`:7754`).
3. **localStorage trust** — `fixair_user` is read for `user_id` in many downstream writes (see §02). If the row is deleted server-side but the localStorage blob persists, the next "save" attempt produces an orphaned row. Cold-boot does refresh, but mid-session staleness is real.
4. **No password-reset path inside the technician portal** — the user is bounced to a separate `/auth` URL (`:6990`).
5. **Demo mode** branches in dozens of code sites via `userId.startsWith('demo-')` checks; cohesion is poor.

**Verdict for Qbe.** **Modernize.** Keep the 2-step email-then-password UX (it's better than a single combined form for the "is this account approved?" gate). Drop the localStorage shadow-cache and derive `user_id` from `supabase.auth.getUser()` on every write — the cache is a footgun.

---

## 2. Home screen

**What it is.** The post-login dashboard. A gamified ring gauge ("you saved X minutes / X €") with count-up animation and confetti on milestone hits, two recent project cards, and an inline calendar widget. Stats are computed client-side from the projects loaded for the project list — no separate stats API.

**Entry points.**
- `loadUserDashboard()` at `:7942` — boots the screen.
- `showMainApp()` at `:8012` — reveals `#mainApp`, calls `initGamification()` and `loadProjectsListAndCheckOnboarding()`.
- `initGamification()` (referenced `:8018`) — initializes stats display.
- `updateStatsDisplay()` at `:19543` — writes stat values to DOM.
- `triggerCelebration()` (referenced `:19751`) — animates confetti + count-up.

**State.**
- `currentUser` (global).
- `stats = { totalMinutes, totalEuros, reports }` derived from the projects array (`:19428–19429`).
- `lastKnownStats` (`:19582`), persisted to `localStorage['fixair_lastStats']` and rehydrated on cold load.
- `celebrationInProgress` (`:19583`) — re-entry lock for the confetti animation.
- `onboardingComplete` (`:7991`).

**DOM.**
- `#homepageContent`, `#statsRingPercent`, `#statsTimeValue`, `#statsTimeUnit`, `#statsEurosSaved`, `#statsReports`, `#statsMessage`, `#recentProjectsHome`, `#techCalendar`, `#celebrationOverlay`.

**Data flow.**
- `db.from('projects').select(...).eq('user_id', userId).order('updated_at', { ascending: false }).limit(20)` (`:9729`) — same query that drives the project list. Joins `chats(id, chat_type, message_count)` for chat-count derivation.
- No webhooks.

**Honest assessment.**
1. **Stats are session-derived, not stored.** Computed from the most recent 20 projects — delete a project and the stats silently drop. There is no actions-history table.
2. **Celebration only triggers on `totalEuros` increase** (`:19731`). Time-saved or report-count alone do not animate (`:19762–19763`).
3. **No real-time subscriptions.** A second device that creates a project will not refresh the home tile until the user navigates away and back.
4. **localStorage cache can mis-fire celebrations.** Clearing `fixair_lastStats` makes the next render look like every euro is a new milestone (`:19750`).
5. **Calendar widget is embedded here** but is its own feature — see §13.

**Verdict for Qbe.** **Modernize.** The gamification is a real product hook — keep the ring + euros + confetti motif. Move stats to a typed `daily_stats` view in Postgres so the numbers don't lie when projects get deleted, and wire a Supabase realtime channel so multi-device users see fresh tiles immediately.

---

## 3. Project list

**What it is.** A scrollable list of all projects the technician owns, ordered by `updated_at desc`, capped at 20. Each card shows title, brand (with a "Brand A → Brand B" indicator if the brand has changed), the static label "Rapport", and a relative time. Right-click / long-press opens a context menu with rename / delete. No filter, no search, no sort UI.

**Entry points.**
- `loadProjectsList()` at `:9722` — fetches projects and triggers both renders.
- `renderProjectsList()` at `:9803` — populates `#projectsList`.
- `renderRecentProjects()` at `:9821` — populates `#recentProjectsHome` (the home-screen recent tile).
- `generateProjectCardHtml()` at `:9769` — single-card HTML builder.
- `showProjectContextMenu()` at `:9838` — positions and reveals the context menu.
- `loadProject(id)` (referenced `:9791`) — opens the project drawer/chat.

**State.**
- `userId` (resolved via `getCurrentUserId()` `:9723`).
- `window.projectsData` (`:9754`) — the full result set, retained so the context menu can look up the row.
- `contextMenuProjectId` (`:9765`, `:9842`) — currently open menu's target.
- `currentProjectTitle` (`:9766`, `:9843`) — used by the rename modal.

**DOM.**
- `#projectsList`, `#recentProjectsHome`, `#projectContextMenu`. Cards carry `data-project-id`.

**Data flow.**
- One query: `db.from('projects').select('id, title, brand, original_brand, status, created_at, updated_at, chats(id, chat_type, message_count)').eq('user_id', userId).order('updated_at', { ascending: false }).limit(20)` (`:9729`).
- No webhooks.

**Honest assessment.**
1. **Hard limit of 20.** Older projects silently disappear from the UI. There is no "load more" — power users with > 20 projects can only reach old work via the calendar (which links to projects by id) or by URL.
2. **`status` is fetched but never displayed** (`:9736` selected, `:9786` only renders the static "Rapport" label).
3. **Brand-change indicator** uses `original_brand` vs `brand` but stores no timestamp on the change — the badge says "X → Y" with no "when".
4. **Long-press conflict on mobile.** The 500 ms long-press detector (`:9872–9883`) competes with native text selection; copy gestures are flaky.
5. **Context menu can overflow the viewport bottom.** Clamping logic (`:9854–9855`) only handles right/top overflow.

**Verdict for Qbe.** **Rewrite.** A project list is a foundational surface and this one is missing pagination, search, filter, and status badges. Reimplement with a virtualized list, server-side filter/sort, and explicit pagination — the "20-project cap" is a customer-visible defect, not a feature.

---

## 4. Project creation

**What it is.** There is **no dedicated "New project" form**. Projects are created implicitly: when the calendar produces an event of `type === 'assistant'`, the event-save flow inserts a `projects` row and a paired `chats` row in lockstep. From the user's point of view, scheduling an intervention *is* creating a project.

**Entry points.**
- `createProjectForEvent(eventData)` at `:19921` — the only project-creation site in the app. Called from the event save handler around `:20322`.

**State.**
- `userId` (resolved at `:19923`).
- `eventData` (`type`, `title`, …) determines whether the branch fires (`:19927`).
- `db` (Supabase client), null-checked at `:19924`.

**DOM.** None. There is no project-creation modal. The calendar event modal is the only surface, and it is documented in §13.

**Data flow.**
- `db.from('projects').insert({ user_id, title: eventData.title, brand: 'mitsubishi' }).select().single()` (`:19933`).
- `db.from('chats').insert({ project_id: project.id, user_id, chat_type: 'assistant' }).select().single()` (`:19946`) — the paired chat row.
- No webhooks during creation. `ASSISTANT_WEBHOOK` and `EXTRACTION_WEBHOOK` only fire later, on the first chat turn.

**Honest assessment.**
1. **Brand is hard-coded `'mitsubishi'`** at `:19938`. There is no brand picker. Every new project starts as Mitsubishi and the user must edit later (or the brand-detector inferred from a chat message overwrites it). This is the single most user-confusing default in the app.
2. **Chat insert error is swallowed** (`:19956`). A `projects` row can be created without its paired `chats` row; the project then loads with an empty chat list and the user has no way to recover it cleanly.
3. **No title validation.** `eventData.title` may be `undefined`; the row goes in with `title=null` and the project list renders an empty card.
4. **Demo mode returns `null` silently** (`:19925`).
5. **No `extracted_data` initialization.** The column starts empty; every reader has to handle `null/undefined` defensively. §02 documents this.

**Verdict for Qbe.** **Rewrite.** A project should be created by an explicit, intentional action with a real form: brand, vertical (electricien / plombier / HVAC / …), client, address, optional template. Implicit creation through the calendar is convenient for one user flow but produces hard-to-debug orphan rows for every other path.

---

## 5. Chat interface

**What it is.** The technician-facing chat panel. The user types or dictates a message; the n8n assistant flow replies and may attach a `[REPORT_DATA]` JSON island that is parsed and merged into `lastReportData`. Bubbles render with optional thought-process steps shown collapsed and a "thinking…" indicator while the request is in flight. Conversation context is persisted to Supabase per `chat_id`.

**Entry points.**
- `sendMsg(panel)` at `:16314` — the main submit handler. Builds the request payload (`:16465–16510`) and POSTs to the right webhook (`:16513`).
- `addMsg(panel, role, text)` (~`:9300`) — appends a bubble.
- `loadMessages(chatId)` (~`:10199`) — restores the conversation on project open.

**State.**
- `chatHistory[panel]` (array of `{ role, content, ... }`).
- `currentProjectId`, `currentChatId[panel]`.
- `lastReportData` (the live report mirror — see §02).
- `reportCompletionState`.
- `previousUserMessages` / `isExistingConversation` (`:16469`) drive the brand_instruction collapse described in §03.

**DOM.**
- `#assistantInput` (`:6701`), `#assistantBody` (`:8543`), `#assistantActionBtn` (send/record toggle), `#assistantBars` (waveform during voice).

**Data flow.**
- `db.from('messages').insert({ chat_id, role, content, content_type, thought_process, thought_summary })` at `:9629–9640`.
- `db.from('messages').select(...).eq('chat_id', currentChatId[panel])` for restore.
- After save, `db.from('projects').update({ extracted_data, updated_at, progress })` is debounced via `debouncedSaveExtractedData` (see §9, drawer).
- Webhooks: `ASSISTANT_WEBHOOK` (`:16521`); `EXTRACTION_WEBHOOK` triggered in parallel by `triggerExtraction(payload)` at `:16517` (assistant panel only).

**Honest assessment.**
1. **`[REPORT_DATA]` parsing is fragile** (`:16549–16552`). A single malformed brace silently drops the merge and the user sees no indication their message did not move the report.
2. **Conversation history capped at last 20 turns** (`:16389`). Long sessions lose early context — model has to re-derive client/site facts.
3. **No retry on 5xx.** A single 500 throws (`:16532`), the user sees a generic error toast, and the message is gone from the input.
4. **Chat rename only triggers on message 3** (`:16650`). Renames after that depend on the user.
5. **No streaming.** The webhook is request/response; the chat sits at "thinking…" until the full reply lands. With extraction-heavy flows (4–15 s per §03), this feels broken.

**Verdict for Qbe.** **Modernize.** Keep the dual chat+extraction architecture (it's the right separation) but: switch to streaming responses, add retry-with-backoff on 5xx, validate the `[REPORT_DATA]` island against the contract from §02 and surface parse errors to the user, and replace the 20-message cap with proper context summarization on the n8n side.

---

## 6. Voice capture

**What it is.** A push-to-record mic button next to the chat input. Records audio with `MediaRecorder`, animates a real-time waveform sourced from `AudioContext` analyser bins, sends the resulting `Blob` to ElevenLabs Speech-to-Text, and inserts the returned French transcription into the chat input as if the user had typed it. If `getUserMedia` is denied, falls back to a "simulated speaking" mode that returns hard-coded French strings.

**Entry points.**
- `startRecording(panel)` at `:16781` — requests mic, starts `MediaRecorder` and the analyser loop.
- `stopRecording(panel)` at `:16943` — stops the recorder and triggers transcription.
- `transcribeWithElevenLabs(panel, audioBlob)` at `:16857` — POSTs to ElevenLabs.

**State.**
- `recordings[panel]` — `{ recorder, stream, timer, … }`.
- `audioContexts[panel]`, `analysers[panel]` — Web Audio analysis chain.
- `simulatedSpeaking[panel]` — fallback flag.

**DOM.**
- `#assistantInputRow` (toggles `recording` class at `:16843`), `#assistantBars` (waveform `<div>` row at `:16784`), `#assistantTimer` (mm:ss elapsed), `#assistantTranscriptionSphere` (the glassy spinner shown while ElevenLabs is processing, `:16860–16864`).

**Data flow.**
- `db.from('app_settings').select('value').eq('key', 'elevenlabs_api_key').single()` (called via `getApiKey()` at `:16869`) — see §02 / §03 security note: the key is shipped to the browser.
- POST to `https://api.elevenlabs.io/v1/speech-to-text` with header `xi-api-key: <key>` (`:16879`). Direct browser → ElevenLabs, no n8n hop.
- No internal webhooks.

**Honest assessment.**
1. **Hard-coded French fallback strings** (`:16920–16926`) when mic access is denied — UX lies to the user about what was captured. This is a bug, not a feature.
2. **No max-duration cap.** A user who taps record and walks away records until the tab closes; battery and cost both bleed.
3. **API key fetched per transcription** (`:16869`) rather than cached for the session — extra round-trip on every utterance.
4. **Touch handlers use `{ passive: false }` for `preventDefault`** (`:16963–16965`) without an explicit cleanup/timeout — recorder can be left orphaned if the user navigates away mid-record.
5. **Direct ElevenLabs key exposure.** Anyone who looks in DevTools can copy the key and use it for their own apps.

**Verdict for Qbe.** **Rewrite.** Move transcription behind a server-side proxy (one of the n8n flows, or a Supabase edge function). The current "ship the API key to the browser" pattern is a billing-fraud waiting to happen. Keep the waveform/UI, replace the implementation.

---

## 7. Photo + OCR

**What it is.** The user picks an image from camera/gallery; it appears in the chat as an image bubble with an "Extraire" button. Tapping it sends the base64 image to the OCR webhook (Claude Vision server-side per §03), with Tesseract.js as a browser-side fallback. The OCR text is dropped back into the chat as an `ocr` content-type message and immediately fed to the assistant on the next turn.

**Entry points.**
- `handlePhotoUpload(event)` at `:18060` — `FileReader` → base64 data URL → render a chat bubble with `dataset.imageData` (`:17271`).
- `extractFromPhoto(msgId, panel)` at `:17267` — orchestrates the OCR call.
- Photo array persistence: `:18112–18115`.

**State.**
- `window.reportPhotos` — the in-memory photo array; mirrored to `projects.photos` and to `extracted_data.photos[]` (the duplication called out in §02).
- `lastReportData` — the OCR result is `unifiedMerge`d into it.
- Per-message `<element>.dataset.imageData` — the base64 blob, kept on the DOM until OCR runs.

**DOM.**
- `#photoUploadInputV12` (hidden `<input type="file">` at `:18056`), the dynamic message bubbles with `.photo-action-btn` (`:17278`).

**Data flow.**
- `db.from('messages').insert({ chat_id, role, content, content_type: 'ocr' })` at `:17463` — stores the OCR text as a regular chat message.
- `db.from('projects').update({ photos: window.reportPhotos, updated_at })` at `:18112–18115`.
- Webhook: `OCR_WEBHOOK_URL` POST `{ image: base64, brand }` at `:17298`. Three-key fallback (`output | response | text`).
- Browser fallback: Tesseract.js loaded lazily, runs in a Web Worker.

**Honest assessment.**
1. **Server fallback rejection by string match** (`:17314–17315`) — the Claude Vision response is rejected if it contains `"Je suis prêt"` or `"Envoie-moi"`. Brittle: a legitimate OCR transcript that happens to contain those phrases is dropped.
2. **Tesseract progress callback writes button HTML every frame** (`:17335–17338`). Excessive reflows on slow devices.
3. **No size/format guard.** Phone HEIC images go straight to base64 with the wrong MIME prefix; n8n rejects them with 400; user sees a generic OCR error.
4. **Word-count regex bug** (`:17396`) uses `split(/\\s+/)` (double-escaped backslash) — splits on the literal characters `\` and `s`, returning wrong word counts in the OCR result UI.
5. **Photos exist in two places.** `projects.photos` and `extracted_data.photos[]` are both written; only the latter feeds the Word/PDF export. See §02 photos issue.

**Verdict for Qbe.** **Modernize.** Keep the user flow (snap → extract → drop into chat). Replace the string-match fallback gate with a real `success/error` field from the OCR n8n flow, add HEIC→JPEG transcoding before upload, fix the regex, and consolidate `photos` to one storage location.

---

## 8. Signature capture

**What it is.** A modal with a single 300×150 canvas where either the technician or the client draws their signature. A "Clear" button blanks the canvas; "Save" converts it to a base64 PNG via `canvas.toDataURL()` and writes it into `lastReportData.signature_client` or `lastReportData.signature_technicien`. Persisted via the same drawer auto-save flow as everything else in `extracted_data`.

**Entry points.**
- `openSignatureModal(type)` at `:17941` — type is `'client'` or `'technicien'`; initializes the 2D context and wires mouse/touch handlers.
- `saveSignature()` at `:18027` — captures the canvas to base64.
- `clearSignature()` at `:18021` — fills with white.

**State.**
- `signatureContext` — the 2D rendering context.
- `isDrawing` — pen-down flag.
- `currentSignatureType` — `'client' | 'technicien'`.
- `lastReportData.signature_client`, `lastReportData.signature_technicien` — base64 data URL strings.

**DOM.**
- `#signatureCanvas` — the canvas element (`:5652`, hard-coded width 300, height 150).
- `#signatureModal` — `.signature-modal.active` toggle (`:3461`).

**Data flow.**
- No direct Supabase write at signature time — the data flows through `lastReportData` and is persisted by the next debounced save.
- No webhooks.

**Honest assessment.**
1. **Hard-coded 300×150 canvas.** On a phone, the signature box is the size of a thumbnail; signatures look cramped and become unreadable in the exported Word.
2. **Touch coordinate math** (`:18009`, `:18017`) uses `touch.clientX - rect.left` — does not account for page scroll. If the modal scrolls (long screens), the drawn line drifts from the finger.
3. **Mouse vs touch coordinate inconsistency.** Mouse uses `e.offsetX/offsetY`; touch uses `clientX/clientY` minus `getBoundingClientRect`. Slight offset between the two input modes on hybrid laptops.
4. **Empty-signature acceptance.** "Save" with no strokes drawn writes a blank white PNG to the row — the drawer then renders an "empty box" signature in the export, which clients have queried.
5. **No undo / no eraser** — the only correction tool is "Clear and start over".

**Verdict for Qbe.** **Modernize.** Keep the modal+canvas pattern but: make the canvas responsive (full modal width on mobile), use a maintained library (`signature_pad` is the obvious choice — handles touch math and undo for free), reject saves with no ink, and store the SVG path along with the rasterized PNG so re-renders are crisp.

---

## 9. Drawer — part 1 (open, render, edit, auto-save)

The drawer is the right-side editable preview of the report. It is **the most complex single feature in the app** and the place where the most quietly-broken behavior lives. Split across two sections: §9 covers open / render / edit / auto-save; §10 covers extraction merge, conflict semantics, Word/PDF export, and undo/redo.

### Open

`openReport()` at `:9324` is the single entry point. Three steps:
```js
document.getElementById('reportSheet').classList.add('open');
document.getElementById('reportBackdrop').classList.add('show');
buildPartialReport();          // reconstruct from chat history if needed
updateDrawerPreview(lastReportData || {});
```

DOM containers: `#reportSheet` (sheet, `:6150`), `#reportBackdrop` (`:6149`), `#reportPreviewContent` (the rendered area, `:6176`), `#rptDoc` (the actual document container the v12 renderer mounts into, `:14622`).

Closing goes through `closeReport()` at `:9335` which **explicitly calls `flushDrawerAutoSave()`** before removing the classes. That call is what guarantees that an in-flight 800 ms debounce isn't lost when the user backgrounds the drawer.

### Render

`updateDrawerPreview()` at `:12504` is the orchestrator. It hides the empty state, computes completion via `calculateReportCompletion()`, and delegates the actual HTML to `renderReportPreviewV12()` at `:14344`. The "v12" suffix is real — there is a v11 renderer alongside it (kept for backward-compat), and the choice between them is made by feature flag.

`renderReportPreviewV12()` is essentially a giant template literal. Each leaf field becomes a `<span data-field="…" contenteditable="true" oninput="drawerAutoSave()" onblur="drawerAutoSave()">` (representative example at `:14357`). Repeating sections are rendered as tables or arrow-prefixed `<ul>`s:
- **`equipements`** (`:14401–14420`) — deduplicated by `modele`, rendered as a bullet list, fields keyed `data-field="eq_${i}"`.
- **`adressage`** (`:14424–14459`) — 4-column table (ADR, MODÈLE, ZONE, N° SÉRIE), every `<td>` is contenteditable, table-level `data-field="table_adressage"`.
- **`mesures`** (`:14471–14500`) — 4-column table (PARAMÈTRE, VALEUR, UNITÉ, STATUS), `data-field="table_mesures"`.
- **`travaux_effectues`** (`:14504–14509`) — arrow list, per-item `data-field="travaux_${i}"`.
- **`reserves`** (`:14513–14518`), **`recommandations`** (`:14522–14527`) — same arrow-list pattern.

After mount, v12.5 features (drag-to-reorder, photo previews) are initialized at `:14625`, and auto-save listeners are wired at `:14558`.

### Edit

Every editable element wears `oninput="drawerAutoSave()" onblur="drawerAutoSave()"` inline. There is no event delegation — handlers are inline strings on every leaf. Signature name inputs: `onblur="drawerAutoSave()"` (`:14609`, `:14616`). Photo captions: `onblur="updatePhotoCaption(${i}, this.value)"` (`:14563`).

The contract is: **the DOM is the truth while the drawer is open**, and `drawerExtractDataFromDOM()` at `:15088` is what reads it back into a JSON object on every save. Critically, it **does not extract every field**:

- ✅ resume `[data-field="resume_content"]` (`:15095–15096`)
- ✅ signatures (`:15098–15109`) — `#sigNameClient` / `#sigNameTech` → `data.signatures[role].nom`
- ✅ adressage table (`:15112–15131`)
- ✅ mesures table (`:15134–15151`)
- ✅ technicien fields (`:15154–15181`)
- ✅ `travaux_effectues` (`:15184–15217`) — index parsed from regex `/travaux_effectues\.(\d+)\.(\w+)/`
- ❌ `client.*`, `site.*`, `systeme.*`, `fluide.*`, all root scalars — **not extracted**

Edits to those un-extracted fields are written to the DOM only and are **lost on next render**. They survive in the visual preview as long as the drawer stays open; they vanish the moment the next extraction round arrives or the project reloads.

### Auto-save

Two-level debounce, both 800 ms:

**Level 1 — `drawerAutoSave()` at `:14962`** (debounce var `drawerAutoSaveTimeout` at `:14233`, interval set near `:14975`). Triggered by every `oninput` / `onblur` from the drawer:
1. Clear pending timeout.
2. After 800 ms: `drawerExtractDataFromDOM(doc, lastReportData)` → mutate `lastReportData` in place.
3. Recompute completion percentage.
4. **Write to Supabase synchronously** (no further debounce):
   ```js
   db.from('projects').update({
     extracted_data, updated_at, progress,
     completion_status: progress >= 90 ? 'completed' : null,
     completed_at: progress >= 90 ? now : null,
   }).eq('id', currentProjectId)
   ```
   (`:15010`).
5. Visual feedback: "Enregistrement…" → "Enregistré ✓".

**Level 2 — `debouncedSaveExtractedData()` at `:13436`** (debounce var `_saveTimeout` at `:13433`, 800 ms). Used by `handleExtractionResult()` at `:16261` to coalesce extraction-driven writes. Pending payload stored at `_pendingSaveData`; on timeout, popped and POSTed with the same column set.

**Lifecycle hooks.**
- `flushDrawerAutoSave()` at `:15047` — synchronously fires both pending timeouts. Called by `closeReport()`.
- `visibilitychange` (`:8094`) — only updates `users.live_status` to `'idle'`, **does not flush the drawer**.
- `beforeunload` (`:8104`) — pushes user presence to `'offline'`, **does not flush the drawer**.

The unflushed close-tab path is a bug: if the user types into a contenteditable then closes the tab within the 800 ms window, the typed text is lost. The drawer's flush only fires on explicit `closeReport()`.

---

## 10. Drawer — part 2 (extraction merge, conflicts, export, verdict)

### `triggerExtraction(payload)` — the parallel webhook fan-out

Defined at `:16181`. Called from `sendMsg(panel)` at `:16517` whenever the panel is `'assistant'`. It is **not debounced** — every chat turn fires one extraction request — and there is **no `AbortController`**, so a slow extraction in flight will not be cancelled when the next turn fires.

Request body (`:16194–16207`):
```json
{
  "project_id": "...",
  "user_id": "...",
  "chat_id": "...",
  "session_id": "...",
  "brand": "daikin",
  "brand_name": "DAIKIN",
  "message": "<latest user message>",
  "message_count": 7,
  "panel": "assistant",
  "full_conversation": [...],
  "current_report_data": "<lastReportData>",
  "timestamp": "..."
}
```

The webhook is `EXTRACTION_WEBHOOK` (§03 §2). The response is handled by `handleExtractionResult(extracted_data, completion_percentage)` at `:16221`. Errors are non-blocking: a `console.warn` (`:16224`) and the chat carries on as if extraction never fired.

### `unifiedMerge` and `mergeReportData` — two merge strategies, one canonical

**`unifiedMerge(target, source)` at `:13322` is the canonical, immutable merger.** It returns a *new* object (`{ ...target }`), skips `null`/`undefined`/`''` from source, skips the special `_metadata` key, recursively merges nested objects, and applies array semantics:
- If source array empty → skip.
- If key in `REPLACE_ARRAYS = ['travaux_effectues', 'travaux_prevoir', 'recommandations']` (`:13320`) → **replace wholesale**.
- Else → dedup-merge via `deduplicateArray()` at `:13355`.

Dedup keys per array:
- `equipements` → normalized `modele` (uppercase, strip trailing `-[A-Z]\d*`) + `role`.
- `adressage` → normalized `equipement_id || ref_usine || adresse` (`UI01 → UI1` regex at `:13367–13375`).
- `mesures` → `normalizeMesureLabel(label)` + `equipement_id`.
- `codes_defaut` → uppercase `code`.

Primitive collisions are **last-write-wins** (`:13348`).

**`mergeReportData(target, source)` at `:13474` is the legacy mutating merger.** Same logic on paper but mutates `target` in place. Marked R5 ("last-write-wins + dedup arrays"). Still referenced in older paths but the FIX-2 cleanup migrated the hot paths (chat at `:9257` and `:10260`, drawer load at `:13022`, extraction at `:16246`, REPORT_DATA island at `:16572`) to `unifiedMerge`. Two implementations is one too many; pick one and delete the other.

`smartMergeExtraction` at `:16265` is a third implementation that appears unused — orphan code.

### Conflict handling

There is **no locking, no diff, no notification, no last-modified comparison**. Concurrent edits between technician and extraction are resolved purely by ordering:

1. Technician types → `drawerAutoSave()` queues at T+0, fires at T+800 ms, mutates `lastReportData`, writes to Supabase.
2. Extraction returns at T+5 s → `handleExtractionResult()` fires, calls `unifiedMerge(lastReportData, extracted_data)`. For primitives, **the extraction overwrites the technician's edit**.
3. Both `drawerAutoSave` and `debouncedSaveExtractedData` queue Supabase updates with the same 800 ms debounce — race window for who lands the last update.

Result: a technician who types a correct value into the drawer and waits a few seconds can watch it silently revert when the assistant's extraction lands. There is no UX for this anywhere in the app.

`REPLACE_ARRAYS` makes the situation worse for the three list fields: any drawer-side reorder, deletion, or text edit to `travaux_effectues` / `travaux_prevoir` / `recommandations` is wiped on the next extraction — wholesale replacement, no merge.

### Word export

Entry: `exportReportPDF()` at `:10883` (the function name is misleading — it's the export-menu opener, not PDF-specific). `showExportMenu()` at `:10888` puts up a Word/PDF chooser modal, then `exportReport(format)` at `:10925` dispatches to `generateWord()` or `generatePDF()`.

`generateWord(data)` at `:10987`. Library: `docx` (window.docx). Builds a `Document` with section helpers (`sectionHeading()` at `:11050` for blue divider + numbered title), reads scalars and arrays out of `data`, embeds the company logo as base64 PNG bytes (`:11024`), packs to a Blob (`:11968`), and downloads with `FileSaver.saveAs()` (`:11971`). Filename `Rapport_${companyName}_${brand}_${reference}.docx`. The file is downloaded client-side; it is **never uploaded to Supabase Storage**.

### PDF export

Yes, it exists. `generatePDF(data)` at `:11983`. Library: `jsPDF`, A4 portrait. Brand colors come from a hard-coded `brandColorsPDF` map (`:11996`). Header bar 25 mm with the brand color, FixAIR logo, brand name, report title, reference, date. Loops the same sections as Word: client / site / equipment / measurements / work done / results / photos / signatures. Toasts `"PDF téléchargé !"` at `:12491`. Same client-side download model — no upload.

The two exports diverge silently when fields differ. There is no shared template — the same content can render slightly differently between the two formats because they are two parallel implementations.

### Undo / redo

There is an undo stack inside the drawer (`drawerAutoSaveTimeout` lives next to it at `:14233`, undo stack init at `:14514–14515`). It is **cleared on close** (`:15049`). Closing the drawer with unsaved-but-debounce-pending state both flushes the save *and* throws away the undo history — a surprise for any user who closes-then-reopens to undo something.

### Honest assessment

1. **Two merge implementations.** `unifiedMerge` and `mergeReportData` overlap; the second is supposed to be legacy but is still on some paths. Consolidate.
2. **Silent overwrite of user edits** by extraction (described above) is the single most damaging bug in the app.
3. **Half-bidirectional binding.** Only ~6 of the ~30 top-level fields are read back from the DOM by `drawerExtractDataFromDOM`. Every other edit is rendering-only.
4. **No flush on `beforeunload` / `pagehide`.** Lose-the-window = lose-the-typing.
5. **`triggerExtraction` not cancelled on next turn.** Two extractions racing to merge: same primitive-overwrite risk, just compressed in time.
6. **Two export paths (Word + PDF) duplicate the template.** Diverge on every change.
7. **Undo cleared on close** with no warning.

### Verdict for Qbe — Drawer

**Rewrite.** This is the single most important component of the product *and* the most accidentally complex code in the repo. Replace it with: a typed in-memory model (Zod-validated `extracted_data`), a single immutable merge function with explicit conflict resolution (preferably "user-edit wins until the user re-asks for re-extraction"), proper bidirectional data binding (a real form library — React Hook Form, Svelte stores, whatever), one shared template fed by both Word and PDF generators, and an undo stack that survives drawer close.

---

## 11. Report generation trigger

**What it is.** The thing that *looks like* a "Generate report" button in the header but actually just opens the drawer for review. There is no separate "compile" or "render" pass — the report is the live `extracted_data`, and "generate" is "open and look at it".

**Entry points.**
- The header button at `:6107`:
  ```html
  <button class="h-btn" onclick="openReport()" title="Voir rapport">
    <span class="icon"><svg><use href="#icon-columns"/></svg></span>
  </button>
  ```
- `openReport()` at `:9324` — the same function documented in §9.
- `buildPartialReport()` (called inside `openReport`) — reconstructs `lastReportData` from chat history if the in-memory mirror is empty (e.g., on first open after a cold load).
- `exportReport(format)` at `:10925` — the actual "produce a file" action; lives in the export menu inside the drawer.

**State.** Same as the drawer (§9, §10).

**DOM.** `#reportSheet`, `#reportBackdrop`, `#reportPreviewContent`. The button itself has no ID.

**Data flow.** No webhooks fire on open (the report is already extracted). On export, no Supabase write happens — the file is downloaded directly from the browser. The `projects.completion_status='completed'` flip happens in `drawerAutoSave` when `progress >= 90` (`:15013–15015`), not on a discrete "finalize" action.

**Honest assessment.**
1. **The naming lies.** Users expect a "Generate report" button to *do* something — render, pre-flight, validate. This one only opens the drawer. Newer users repeatedly think the report wasn't generated because they never opened the drawer to look at it.
2. **No "finalize" action.** A report becomes "completed" implicitly when its `progress` crosses 90%. There's no "I'm done" button — meaning a half-filled report can be accidentally marked completed by a single late edit, and a complete report stays "in progress" forever if the completion calculator under-counts.
3. **Two-step export friction.** "Generate" → drawer opens → user clicks Export → modal asks Word vs. PDF → user picks → file downloads. Five clicks for a one-shot action.
4. **No server-side render.** The Word and PDF are built in the browser; clients with low-end devices wait visibly long for `Packer.toBlob`.

**Verdict for Qbe.** **Rewrite the trigger UX.** The drawer can stay (modernized per §10), but split the surface in two: a "Review & edit" button that opens the drawer, and a "Finalize & export" action that runs server-side validation, locks the row, generates the file via an n8n flow (consistent template, no in-browser CPU spike), and stores the result in Supabase Storage with a stable URL. Today's "the report is whatever you've extracted so far" model needs an explicit completed/locked state.

---

## 12. Calendar

**What it is.** A day/week/month calendar embedded on the home tab and accessible as its own view. Lets the technician schedule interventions and other reminders. Events of `type === 'assistant'` create paired `projects` + `chats` rows (see §4); other event types are calendar-only. Recurrence and reminders have UI but no enforcement.

**Entry points.**
- `initTechCalendar()` at `:19791` — boot.
- `renderTechCalendar()` at `:19991` — view-mode rendering.
- `createCalendarEvent()` / `createCalendarEventForDate()` at `:20178`, `:20182`.
- `openEventDrawer()` / `openEventDrawerForEdit()` at `:20189`, `:20223`.
- `saveCalendarEvent()` at `:20292`.
- `saveEventToSupabase()` at `:19850`, `deleteEventFromSupabase()` at `:19903`.

**State.**
- `techCalDate` (`:19786`), `techCalView` (`'day'|'week'|'month'`, `:19787`).
- `calendarEvents[]` (`:19788`) — the current rendered set.
- `editingEventId` (`:19789`).

**DOM.**
- `#techCalContent`, `#techCalTitle`, `#eventDrawerOverlay`, `#eventDrawer`, `#eventName`, `#eventDate`, `#eventStartTime`, `#eventEndTime`, `#eventLocation`, `#eventClient`, `#eventRepeat`, `#eventReminder`, `#eventVisibility`, `#eventNotes`, `#eventAllDay`.

**Data flow.**
- `db.from('calendar_events').select('*').eq('user_id', userId)` at `:19796`.
- `db.from('calendar_events').insert(...) | update(...)` at `:19850`.
- `db.from('calendar_events').delete()` at `:19903`.
- For `type === 'assistant'`: cascades into `createProjectForEvent()` at `:19921` (§4).
- No webhooks.

**Honest assessment.**
1. **Recurrence is cosmetic.** `repeat_type` is saved to the DB but the calendar **does not expand recurring events** — a "weekly" event shows on its single original date.
2. **Reminders are stored, never fired.** No timer, no service worker, no email path. The column exists; nothing reads it.
3. **Week / month views truncate event titles** to a few characters; users cannot identify events without clicking.
4. **No overlap detection.** Two events at the same time draw on top of each other.
5. **Long-press delete** can leave a `projects` row orphaned if the underlying event was the only project handle — see §4 for the symmetric bug on the create side.
6. **Timezone-naive.** `date` is `YYYY-MM-DD` text and `start_time` is `HH:MM` text — see §02 calendar gotcha. Multi-region rollout is broken by design.

**Verdict for Qbe.** **Modernize.** Pick a vetted calendar component (FullCalendar, Schedule-X, etc.) — date/time grid, drag-to-reschedule, recurrence expansion all come for free. Behind it, replace the text date+time fields with `timestamptz`, hook real reminders through the email-send n8n flow, and decouple project creation from calendar events (per §4 verdict).

---

## 13. Freemium / quota

**What it is.** A soft paywall: free tier gets 20 assistant chats and 3 reports per week. At 80% usage a banner appears; at 100% a hard upgrade modal blocks further chats. Stripe handles the payment, polled client-side until `users.subscription_tier` flips from `'free'` to `'pro'`.

**Entry points.**
- `trackChatUsage()` at `:18619`, `trackReportGeneration()` at `:18662`.
- `checkSubscriptionStatus()` at `:18578`.
- `showUpgradeModal()` at `:18738`, `showUpgradeBanner()` at `:18778`.
- `startPaymentPolling()` at `:18774` (post-checkout).

**State.**
- `FREEMIUM_CONFIG` at `:18496` — `{ freeAssistantChats: 20, freeReports: 3, softLimitWarning: 0.8, monthlyPrice: 49, upgradeUrl: 'https://pay.fixair.ai/b/dRm7sKa3MbPAgxdfgR2VG00' }`.
- `localStorage['fixair_freemium_usage']` — `{ assistantChatsTracked, reportsGenerated, bufferQueries, isPro, weekStart }`.
- Owner bypass: hard-coded user `d5baabf1-147a-4ee5-a07a-8f80212fbc9a` (`:18584`) skips all gates.

**DOM.** `#upgradeOverlay`, `#upgradeTitle`, `#upgradeSubtitle`, `.upgrade-banner`.

**Data flow.**
- Reads `users.subscription_tier` (`:18596`).
- No quota row server-side; counts live in `localStorage`.
- No webhooks for usage.
- Stripe checkout link is opened in a new tab; the page polls Supabase for the tier flip.

**Honest assessment.**
1. **Quota lives in localStorage.** Clear browser storage and the user resets to 0/20 chats. The "weekly limit" is enforceable only on a single device.
2. **Week reset keyed to Monday only — timezone-naive** (no `weekStart` rotation per region).
3. **Buffer-query grants** (`+5` chats on invite, 24 h window) bypass the hard limit but are not synced server-side.
4. **No payment verification webhook.** The Stripe link opens, the user pays, the page polls. If Stripe → Supabase wiring is broken (and per §03 the Stripe webhook is *planned but not built*), a paying customer can be locked out for hours.
5. **Owner bypass UUID is in client source** (`:18584`). Anyone reading the file knows the tier-bypass user id.
6. **Hard-coded €49/mo** in client config — pricing change requires a redeploy.

**Verdict for Qbe.** **Rewrite.** Move quota tracking server-side (Postgres row per user per week, RLS-protected). Wire the Stripe webhook for real (per §03 appendix), so subscription state is event-driven not poll-driven. Drop the hard-coded owner bypass; use a `role='admin'` flag instead.

---

## 14. Referral

**What it is.** Each user gets a personal referral code (`firstname + 4-digit-random`). Sharing the code via WhatsApp or copy-link gives both inviter and invitee a free week. Three conversions in a 7-day "sprint" makes the user an "ambassador" with extended bonuses. Stats (invited count, bonus queries, ambassador status) are read from `users.*`.

**Entry points.**
- `initReferral()` at `:19280`.
- `ensureReferralCode()` at `:19234` — generates and persists the code on first login if missing.
- `loadReferralData()` at `:19183`.
- `shareOnWhatsApp()` at `:19110`, `copyReferralCode()` at `:19125`.
- `handleInviteClick()` at `:18820`.

**State.**
- `referralState = { code, totalReferrals, bonusQueries, isAmbassador }` (`:19089`).
- Code generation: `firstname + Math.floor(Math.random()*10000)` (`:19258`).

**DOM.**
- `#myReferralCode`, `#referralCount`, `#bonusQueries`, `#referralPendingPopup`, `#inviteConfirmPopup`.

**Data flow.**
- Reads `users.{ referral_code, total_referrals, bonus_queries, is_ambassador }` at `:19190`.
- Writes `users.referral_code` on first login if absent (`:19263`).
- Share link format: `https://go.fixair.ai/r/{CODE}`.
- WhatsApp message rotates 3 templates (`:18829`) to dodge spam filters.
- `total_referrals`, `is_ambassador`, `bonus_queries` are mutated **server-side only** (n8n flow watching the `go.fixair.ai/r/` redirect — not in this repo).
- `trackReferralShare()` at `:19164` is a `console.log`-only stub — no analytics actually sent.

**Honest assessment.**
1. **Code uniqueness not checked.** `firstname + 4-digit-random` collides regularly for common French first names (Jean, Pierre, Marie). No retry-on-conflict.
2. **No frontend record of which invites converted.** `bonus_queries` is granted server-side, but the UI cannot show "your invite of paul@example.com became a paid user".
3. **Pending popup loops.** Shown when `invitesSentThisWeek > 0` but `totalReferrals === 0` (`:18875`) — fires every login until a conversion lands; users explicitly complain about it.
4. **Sprint week never persisted.** The "60 days free for 3 conversions in 7 days" sprint (`:18906`) reads `referralState.isAmbassador ? 60 : 7` (`:18961`) but never writes `users.week_free_granted_at`, so the timing is lossy.
5. **Tracking stub.** `trackReferralShare` only logs; product analytics for referral funnel are flying blind.

**Verdict for Qbe.** **Modernize.** The referral mechanic is on-brand and works, but the implementation is held together with localStorage and `console.log`. Move attribution to a typed `referrals` table (`inviter_id`, `invitee_id`, `state`, `granted_at`), retry-on-conflict for code generation, surface conversion list in the UI, and wire real analytics.

---

## 15. Onboarding

**What it is.** A four-step wizard shown on first login: (1) brand picker, (2) welcome card, (3) "ask your first question" prompt, (4) feature tour. Completion is double-gated: a `localStorage['fixair_onboarding_done']` flag and a `users.onboarding_done` boolean.

**Entry points.**
- Step click handlers `handleStep1Click` / `handleStep3Click` / `handleStep4Click` at `:8277`.
- `completeStep(n)` at `:8792` — the step-progression engine.
- `openProfile() → toggleBrandSelect()` at `:8134`, `:5732` — brand-picker invocation from step 1.

**State.**
- `onboardingStep` (`1|2|3|4|5`, `:6645`).
- `onboardingComplete` (`:6646`).
- `onboardingBrand` (`:6649`) — chosen brand from step 1; **memory-only**, lost on reload mid-wizard.

**DOM.**
- `#onboardingSection`, `#onboardingCard`, `#onboardingSteps`, `#step1` / `#step2` / `#step3` / `#step4` (clickable cards), `#onboardingProgress` (the `0/4` counter), `.congrats-content`.

**Data flow.**
- Reads `users.onboarding_done` on init (`:7989`).
- Writes `users.onboarding_done = true` when wizard completes (`:8813`).
- Also writes `projects.onboarding_done = true` when the user completes their first report flow (`:19713`).
- No webhooks.

**Honest assessment.**
1. **Soft step gates.** All step gating is client-side `classList` flips; a curious user can advance via DevTools.
2. **Memory-only `onboardingBrand`.** Reload during the wizard wipes the choice; user has to re-pick.
3. **Step 3 depends on `step4Done`** which is set only inside the step 4 handler (`:8722`) — skipping step 4 leaves step 3 visually incomplete forever.
4. **Two flags, two truths.** `localStorage['fixair_onboarding_done']` (string) and `users.onboarding_done` (bool) can disagree across devices. The local flag wins on cold load, then the DB overrides — so a user who finished onboarding on phone can briefly see the wizard on a new desktop login.
5. **No re-run path.** Existing users with projects skip onboarding (`:9700`, `:9703`); there is no "show me the tour again" link.
6. **Counter semantics off-by-one.** `completeStep(1)` advances counter to "1/4" but step 1 UI labels as "Choisissez votre marque" — semantic mismatch when users compare progress to step labels.

**Verdict for Qbe.** **Modernize.** Onboarding mechanic is fine; replace the bespoke step engine with a proper wizard (Stepper component from any UI kit), persist the brand pick to `users.preferred_brand` immediately so reload survives, and collapse the two completion flags into one DB-sourced truth (cache only as a write-through, not as authoritative).

---

## 16. Profile

**What it is.** A settings screen accessible from the nav. Three sections: Personal (first/last name, email read-only, phone), Company (name, logo with drag-drop and remove), and Settings (language FR/EN, theme dark/light).

**Entry points.**
- `openProfile()` at `:8134`.
- `saveProfile()` at `:8156`.
- `setLanguage(lang)` at `:6570`.
- `toggleTheme()` at `:6564`.
- `removeCompanyLogo()` at `:8364`.
- `saveCompanySettings()` at `:8376`.

**State.**
- `currentLang` — read from localStorage.
- `currentUser` — global; profile fields read from here and written via `saveProfile`.
- Company data also cached in `localStorage['fixair_company_settings']` (`:8376+`).

**DOM.**
- `#profileView`, `#profileFirstName`, `#profileLastName`, `#profileEmail`, `#profilePhone`, `#companyNameInput`, `#logoUploadArea`, `#logoPreview`, `#logoPlaceholder`, `#logoFileInput`, `#removeLogoBtn`, `#langFR`, `#langEN`, `#themeToggle`, the `Enregistrer` button.

**Data flow.**
- `db.from('users').update({ first_name, last_name, phone, language, updated_at })` via `saveProfile()` (`:8227`).
- Logo upload: `db.storage.from('FixAIRbucket').upload('logos/{userId}_{timestamp}.{ext}', file)` (`:8416+`).
- Reads `users.{ company_name, company_logo }` on profile open (`:8157`).
- No webhooks.

**Honest assessment.**
1. **`company_name` is never persisted to DB.** The input value lives only in `localStorage['fixair_company_settings']`. The exported Word/PDF reads from this localStorage cache, so a user on a new device gets a blank company header until they reopen Profile and re-save. Severe on-brand regression for anyone who switches devices.
2. **Logo storage path mismatch with §02.** This section uploads the logo to Supabase Storage (`FixAIRbucket/logos/`), while §02 documented `users.company_logo` as a base64 inline column. Both code paths exist — depending on the codepath that produced the row, the logo may be a Storage URL **or** a base64 data URL. The export reads whichever is set. This is a live inconsistency, not a doc disagreement.
3. **Language not persisted to Supabase.** `setLanguage` updates DOM and localStorage but the DB `users.language` is only written when `saveProfile` runs — skipping the explicit Save loses the choice on cold boot from a new device.
4. **Two parallel `await`s in Save** — `saveProfile()` and `saveCompanySettings()` (`:8269`) without `Promise.all`; race condition possible when one finishes faster than the other.
5. **Phone field silently skipped if empty** (`:8216`) — no validation, no nullable handling.
6. **No file-type guard** beyond the `accept` attribute on the file input; server-side MIME check absent.

**Verdict for Qbe.** **Rewrite.** Profile is a small surface and the bugs here (company name not persisted, logo split between two storage models, language partially persisted) are user-facing and silent. Reimplement as a typed form bound to a single `users` row, single source of truth for logo (Storage URL only — never inline base64), every change auto-saves with a single mutation.

---

## 17. Hotline-as-Pro toast — `:18365`

**What it is.** A "Hotline" tab in the technician UI. Tapping it does nothing functional — it pops a toast that says the feature is coming in Pro. Every adjacent function (`closeHotline`, `resetHotline`, `toggleHotline`, `connectHotline`, `disconnectHotline`) is an empty stub.

**Verbatim source** (`:18364–18378`):
```js
function openHotline() {
  toast('Hotline FixAIR - Bientôt disponible en version Pro');
}
function closeHotline()      {}
function resetHotline()      {}
function toggleHotline()     {}
function connectHotline()    {}
function disconnectHotline() {}
```

Translation of the toast: *"FixAIR Hotline — coming soon in Pro version."*

**Why it's weird.**
1. **The UI keeps the entry point.** A persistent nav tab implies a working feature. The user's first tap teaches them the tab does nothing.
2. **All downstream functions are stubs.** This is the visual fingerprint of a feature that was either ripped out incompletely or scaffolded ahead of time and never implemented.
3. **No feature flag, no config.** The "Pro" message is a hard-coded string in the function body. Whether the user is already Pro is not consulted — the toast fires for everyone, including paying subscribers.
4. **No upgrade CTA.** Despite mentioning Pro, the toast does not link to the upgrade modal (§13). It is a *marketing nag* with no funnel.
5. **Not a freemium gate.** Real freemium gates (`showUpgradeModal()` at `:18738`) block usage and link to Stripe. This one just teases.

**Honest assessment.** Zombie code. The tab takes navigation real estate, the toast trains users to ignore the surface, the stubs add lines and confuse readers who grep for "hotline" expecting to find the implementation. In every prior session the same handful of lines have been flagged as the most obvious "delete me" candidate in the file.

**Verdict for Qbe.** **Rewrite — by deleting it.** Either ship a real hotline (chat-with-support, scheduled call request, Calendly handoff) or remove the nav tab and the seven stub functions. The current state is the worst of both: the cost of feature presence with none of the value.

---

## Summary — verdicts at a glance

| # | Feature | Verdict | One-line rationale |
|---|---|---|---|
| 1 | Auth flow | Modernize | Two-step UX is good; drop the localStorage shadow-cache for `user_id`. |
| 2 | Home screen | Modernize | Keep gamification; move stats to a typed view + add realtime. |
| 3 | Project list | Rewrite | Missing pagination/search/filter; the 20-project cap is a defect. |
| 4 | Project creation | Rewrite | Replace implicit "calendar event = project" with an explicit form. |
| 5 | Chat interface | Modernize | Add streaming, retry-with-backoff, and `[REPORT_DATA]` validation. |
| 6 | Voice capture | Rewrite | Move ElevenLabs key off the client; keep the waveform UI. |
| 7 | Photo + OCR | Modernize | Drop the string-match fallback gate; transcode HEIC; consolidate `photos`. |
| 8 | Signature capture | Modernize | Use `signature_pad`; responsive canvas; reject empty saves. |
| 9–10 | Drawer | Rewrite | Single merge function, real bidirectional binding, conflict UX, shared template. |
| 11 | Report generation trigger | Rewrite (UX) | Split "review" from "finalize"; server-side render and storage. |
| 12 | Calendar | Modernize | Adopt FullCalendar / Schedule-X; `timestamptz`; real reminders. |
| 13 | Freemium / quota | Rewrite | Move quota server-side; wire the Stripe webhook; drop owner-bypass UUID. |
| 14 | Referral | Modernize | Typed `referrals` table; conversion list in UI; real analytics. |
| 15 | Onboarding | Modernize | Real Stepper; persist brand pick immediately; one completion flag. |
| 16 | Profile | Rewrite | Persist `company_name`; one storage model for logo; auto-save on change. |
| 17 | Hotline-as-Pro toast | Rewrite (delete) | Ship the feature or remove the tab — the current state is the worst option. |

**Tallies.** Keep: 0. Modernize: 8. Rewrite: 9 (including the drawer, the heart of the app). The rewrite count is the honest answer to "how much of the technician app survives a Qbe pivot intact" — about half the surface needs new code, and the other half can be ported with discipline.

