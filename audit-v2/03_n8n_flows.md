# 03 — n8n flows

The n8n workflows that sit between FixAIR's frontend and its LLMs / Pinecone / Gmail. Documented exclusively from the **client side** — the n8n server's flow JSON is **not in this repo** and not accessible to this audit; what can be observed is the wire (URL, request body, response body, timing, callers) plus whatever instructions or system prompts the client sends *into* the request body.

**What this doc is.** A per-webhook contract: caller, trigger, request shape, response shape, observed failure modes, and best-effort inference of internal n8n behavior from request inputs.

**What this doc is not.** A walkthrough of the n8n DAG — for that, the n8n editor is the source of truth and a separate `audit-v3/n8n-flows-export/` directory should hold the exported workflow JSONs. None are committed today (see Appendix).

**Conventions:**
- Hostnames redacted as `https://[N8N-HOST]/webhook/…`. The actual host is hard-coded in two places (`technician/index.html` and `master/index.html`); search for `_WEBHOOK` to find them.
- Line references are against the working tree at branch `audit-v2/deep-dive-for-qbe`.
- "LLM model" / "Pinecone index" / "node graph" entries are marked **(n8n-side, inferred)** unless the request payload commits the client to a specific model.
- Latency numbers come from observed client timeouts and AbortController bounds, not from server-side metrics.

---

## 1. ASSISTANT_WEBHOOK — `/webhook/fixair-assistant-dev`

**URL constant.** `ASSISTANT_WEBHOOK` declared at `technician/index.html:9492` (host redacted). Path suffix `-dev` is the live production endpoint; there is **no `-prod` variant** — the `-dev` name is a leftover from the staging/prod merge.

**Caller.** `sendChatMessage()` flow → `fetch(ASSISTANT_WEBHOOK, …)` at `technician/index.html:16521`.

**Trigger.** Every user message typed into the technician chat panel. Fires once per submit, with the full conversation context attached. Not used for the OCR or extraction sub-flows (those have their own webhooks).

**Request body** (built `:16465–16510`, content-type `application/json`):
```json
{
  "user_id": "uuid",
  "project_id": "uuid|null",
  "chat_id": "uuid|null",
  "timestamp": "2026-04-20T09:42:11.000Z",
  "is_first_message": false,
  "is_existing_conversation": true,
  "message_count": 7,
  "conversation_summary": "<assistant-generated summary of prior turns>",
  "brand_instruction": "MARQUE CONFIRMÉE: DAIKIN. NE DEMANDE JAMAIS LA MARQUE. NOUVELLE CONVERSATION.",
  "system_context": "NOUVELLE CONVERSATION. MARQUE: DAIKIN. Mode Rapport - pose les questions pour générer un rapport d'intervention.",
  "report_extraction_mode": true,
  "extraction_instructions": "<see code block below>"
}
```

`brand_instruction` and `system_context` collapse to the bare `conversationSummary` string when `is_existing_conversation === true` (`:16473–16478`), so on turn 2+ the persona instructions are dropped — the LLM is expected to infer them from history.

**Response body.** The renderer tries three response keys in order: `response`, then `message`, then `output` (`technician/index.html:16545`). The body may also contain a fenced `[REPORT_DATA]…[/REPORT_DATA]` JSON island that is parsed at `:16549` and merged into `lastReportData` via `unifiedMerge`. Shape:
```json
{
  "response": "Pour cette pression HP de 28.5 bar, vérifie d'abord …\n\n[REPORT_DATA]{ \"mesures\": [{\"label\":\"Pression HP\",\"valeur\":\"28.5\",\"unite\":\"bar\"}] }[/REPORT_DATA]"
}
```

**n8n internals (inferred).** The presence of `system_context`, `brand_instruction`, and `conversation_summary` in the request indicates the n8n flow concatenates these into the LLM system prompt rather than holding them server-side. This means **the system prompt is partly client-controlled** — anyone who can reach the webhook can override the assistant persona by spoofing `system_context`. LLM model: not fixed by the request payload; n8n-side decision (likely GPT-4-class given the FR-language reasoning quality observed). Pinecone: very likely a brand-knowledge index gated by `brand_instruction`, but **(n8n-side, inferred)** — not provable from the client.

**System prompt sent by client.** Three discrete inputs are sent and stitched server-side into the LLM system message. The largest is `extraction_instructions`, hard-coded at `technician/index.html:16483–16509`. Verbatim:

```text
EXTRACTION DE DONNÉES POUR RAPPORT:
Après chaque message utilisateur, tu DOIS extraire les informations et les retourner dans un bloc JSON.

FORMAT OBLIGATOIRE - Ajoute à la fin de ta réponse:
[REPORT_DATA]
{
  "client": { "societe": "...", "contact": "...", "telephone": "..." },
  "site": { "adresse": "...", "ville": "...", "numero_affaire": "..." },
  "systeme": { "type": "VRF/Split/PAC...", "modele": "...", "serie": "...", "puissance": "..." },
  "fluide": { "type": "R410A/R32/...", "charge_totale": "..." },
  "codes_defaut": [{ "code": "7100", "description": "Description exacte du code" }],
  "adressage": [{ "ref_usine": "...", "serie": "...", "adresse": "01", "designation": "...", "commentaire": "..." }],
  "travaux_effectues": [{ "texte": "..." }],
  "mesures": [{ "label": "...", "valeur": "...", "unite": "..." }],
  "technicien": { "nom": "...", "heure_arrivee": "...", "heure_depart": "..." },
  "resultat": { "status": "resolu/en_attente/non_resolu", "description": "..." }
}
[/REPORT_DATA]

RÈGLES:
1. N'inclure QUE les champs qui ont des informations dans le message
2. Pour les codes erreur, TOUJOURS donner la description exacte du code (ex: "7100 = Défaut communication bus")
3. Pour l'adressage système, extraire CHAQUE unité mentionnée (UI, UE, BC, SC...)
4. Les valeurs doivent être EXACTES, pas de texte générique
5. Ce bloc JSON sera parsé pour remplir le rapport en temps réel
```

The `n8n` system message construction itself (where `system_context` ends up, what additional preamble is prepended server-side, what RAG snippets are injected) is **not in this repo**.

**Failure modes.**
1. Network timeout — no `AbortController` is wired; client hangs until the platform default (~30 s on most browsers). Surfaces as a stuck "thinking…" indicator.
2. Empty body — if all three of `response`/`message`/`output` are missing, the chat shows a blank assistant bubble; no error toast.
3. Malformed `[REPORT_DATA]` JSON — the parser at `:16549` swallows the exception silently and the chat text still renders, but no merge happens.

**Observed latency.** No client timeout. Empirical assistant replies routinely take 3–12 s; the OCR-augmented variants run longer.

**Token / cost profile.** With `conversation_summary` + `system_context` + `brand_instruction` + last message, request tokens land in the **2–6 k input** range, response **300–1200 output**. At GPT-4o pricing this is ~$0.01–0.04 per call. The free tier has no per-call rate limit on the client side; throttling is webhook-side **(inferred)**.

---

## 2. EXTRACTION_WEBHOOK — `/webhook/fixair-extraction-dev`

**URL constant.** `EXTRACTION_WEBHOOK` declared at `technician/index.html:9494`.

**Caller.** `runExtractionPass()` flow → `fetch(EXTRACTION_WEBHOOK, …)` at `technician/index.html:16211`.

**Trigger.** Two paths: (a) automatic, debounced after each chat turn (the assistant's reply triggers a re-extraction); (b) explicit, when the user clicks "extract" or finalises the report. The webhook is **separate from `ASSISTANT_WEBHOOK`** because extraction is non-streaming and produces a structured payload only.

**Request body:**
```json
{
  "brand_name": "DAIKIN",
  "message": "<last user/assistant exchange>",
  "message_count": 7,
  "panel": "assistant",
  "full_conversation": [
    { "role": "user", "content": "…" },
    { "role": "assistant", "content": "…" }
  ],
  "current_report_data": { "…full lastReportData snapshot…": "…" },
  "timestamp": "2026-04-20T09:42:11.000Z"
}
```

`current_report_data` is the entire `extracted_data` shape from §02 — sent on every call, no diffing. For mature reports this is the dominant cost contributor.

**Response body:**
```json
{
  "extracted_data": {
    "client": { "societe": "Acme SAS" },
    "mesures": [ { "label": "Pression HP", "valeur": "28.5", "unite": "bar" } ]
  },
  "completion_percentage": 47
}
```

The `extracted_data` payload follows the §`projects.extracted_data` contract verbatim and is fed straight into `unifiedMerge` (`:16220` → `:13322`) without re-validation. `completion_percentage` is rendered in the progress badge and stored in `projects.progress`.

**n8n internals (inferred).** Function-calling LLM with a JSON-schema tool definition matching `extracted_data`. The model is almost certainly OpenAI (the JSON-mode behavior and brand-following are consistent with GPT-4o-class). Brand-specific extraction hints likely come from a Pinecone index keyed by `brand_name` **(n8n-side, inferred)**.

**System prompt sent by client.** None. Unlike `ASSISTANT_WEBHOOK`, this flow does not accept `system_context`. The full system prompt lives server-side.

**Failure modes.**
1. **Empty `extracted_data`** — the merge runs with `{}`, so nothing changes; no warning to the user. Common when the LLM returns prose instead of JSON.
2. **Truncated JSON** for very large reports — `current_report_data` round-tripping a 200 KB report blob can hit the LLM context cap and produce truncated output that fails JSON parse server-side, returning `{}`.
3. **Concurrent extraction** — debounced caller does not cancel an in-flight request; two overlapping extractions can race and the slower one wins, undoing the faster one's merges.
4. **Schema drift** — any new key the LLM invents (not in the `extracted_data` contract) is silently merged into the row. There is no allowlist.

**Observed latency.** 4–15 s typical; > 30 s on long reports. No client timeout — same hang behavior as `ASSISTANT_WEBHOOK`.

**Token / cost profile.** Dominant input is `current_report_data` (3–30 k tokens depending on report maturity) + `full_conversation` (1–10 k) + system prompt (~1 k). Output 1–4 k tokens (the full extracted_data JSON). Per call ~$0.05–0.20 at GPT-4o pricing. **This is the most expensive webhook in the system per invocation, and it fires frequently** — primary cost driver.

---

## 3. OCR_WEBHOOK_URL — `/webhook/fixair-ocr`

**URL constant.** `OCR_WEBHOOK_URL` declared at `technician/index.html:17265`. Same path is also referenced from the demo build at `index.html:12128` — they hit the **same n8n flow**.

**Caller.** `runOcrOnImage()` flow → `fetch(OCR_WEBHOOK_URL, …)` at `technician/index.html:17298` (and `index.html:12161` for the demo).

**Trigger.** A photo (camera capture or file picker) is dropped into the chat panel. The image is base64-encoded client-side first, then POSTed.

**Request body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABg…",
  "brand": "daikin"
}
```

The `image` field is a **full data URL**, not just the base64 payload — meaning the MIME prefix is part of the request. `brand` is the lowercase `brand_key` (see §02 `extracted_data.brand_key`) and is forwarded server-side to bias the OCR LLM toward expected nameplate vocabulary for that vendor.

**Response body** (three possible keys, fallback chain at `:17309`):
```json
{ "output": "DAIKIN\nMODEL: RXYQ10U\nSERIAL: SN-UE-000001\nFLUIDE: R410A\n…" }
```
Or `{ "response": "…" }` or `{ "text": "…" }`. The chosen value is dropped into the chat as a `content_type='ocr'` message and immediately fed back into the assistant flow as user input on the next turn.

**n8n internals (inferred).** Vision LLM with brand-conditioned prompting. Per the agent's source pass, the flow is described in repo docs as **Claude Vision primary with Tesseract fallback**, but this is documentation-only — not provable from the client. Likely no Pinecone usage on this path.

**System prompt sent by client.** None. The OCR prompt lives entirely server-side; only `brand` is forwarded as a hint.

**Failure modes.**
1. **Image too large** — typical phone photos are 2–5 MB; base64 inflates to ~3–7 MB. n8n / Cloudflare reject payloads above their respective body limits with 413; client surfaces a generic OCR error.
2. **Empty result** — the chained `output||response||text` fallback returns the empty string, rendered as an empty bubble.
3. **Wrong MIME** — HEIC photos from iPhones convert to base64 with a HEIC MIME prefix that the server-side LLM may reject; no client-side transcoding.

**Observed latency.** No client timeout. Vision passes typically 5–20 s; large or multi-page captures > 30 s.

**Token / cost profile.** Vision input dominates: a single 1024×1024 photo at GPT-4o-vision detail=high is ~1.1 k image tokens + ~0.5 k system prompt = ~1.6 k input, ~300–800 output. Per call ~$0.01–0.03. Cheap relative to extraction, but high-frequency on field interventions where techs photograph nameplates and screens.

---

## 4. APPROVAL — `/webhook/fixair-approval`

**URL constant.** `N8N_WEBHOOK_URL` declared at `master/index.html:1281`.

**Caller.** User-status mutation flow in the master dashboard → `fetch(N8N_WEBHOOK_URL, …)` at `master/index.html:3449`. Triggered when an admin/master flips a user from `pending` → `active` / `suspended` / `rejected` (`:3407–3447`).

**Trigger.** Admin-only. Each row mutation in the user-management table fires one call. Not exercised by the technician app at all.

**Request body** (composed `:3407–3447`):
```json
{
  "action": "approve|reject|suspend|reactivate",
  "user_id": "uuid",
  "email": "user@example.com",
  "first_name": "Jean",
  "last_name": "Exemple",
  "company_name": "Acme SAS",
  "role": "technician",
  "status": "active",
  "subscription_tier": "free",
  "approved_by_master_id": "uuid",
  "approved_at": "2026-04-20T09:42:11.000Z",
  "notes": "<admin free-text>"
}
```

**Response body:**
```json
{ "success": true, "error": null }
```
On error: `{ "success": false, "error": "<n8n exception text>" }`. The dashboard renders `error` verbatim in a toast.

**n8n internals (inferred).** A simple state-machine flow: validate `action`, mutate `auth.users`/`public.users` via the Supabase service role key (held server-side as an n8n credential), then dispatch a transactional email through the same Gmail credential used by `EMAIL_SEND_WEBHOOK`. **No LLM, no Pinecone.**

**System prompt sent by client.** Not applicable — no LLM in this flow.

**Failure modes.**
1. **Race conditions** — two admins simultaneously toggling the same user: last-write-wins, no optimistic lock.
2. **Email send failure** — the response can return `success: true` even if the downstream email step failed (depends on n8n flow design — the docs did not commit on this). Worth verifying server-side.
3. **No idempotency key** — replays double-fire the welcome email.

**Observed latency.** No client timeout. 1–4 s typical (DB write + email queue).

**Token / cost profile.** No LLM. Cost is the email send only (~$0.0001 per Gmail send via the n8n credential's quota).

---

## 5. EMAIL_SEND — `/webhook/email-send`

**URL constant.** `EMAIL_SEND_WEBHOOK` declared at `master/index.html:3508`.

**Caller.** Custom-email composer in the master dashboard → `fetch(EMAIL_SEND_WEBHOOK, …)` at `master/index.html:3712`.

**Trigger.** Admin-only. The master operator composes a one-off HTML email (announcement, billing nudge, support reply) targeted at a specific user.

**Request body** (composed `:3690–3715`):
```json
{
  "recipient_email": "user@example.com",
  "recipient_user_id": "uuid",
  "subject": "Mise à jour FixAIR",
  "content_html": "<p>Bonjour Jean,</p><p>…</p>",
  "company_name": "Acme SAS",
  "role": "technician",
  "project_count": 12,
  "chat_count": 47,
  "signature_html": "<p>— L'équipe FixAIR</p>"
}
```

`signature_html` is optional; defaults to a baked-in template server-side **(inferred)**.

**Response body:**
```json
{ "success": true, "error": null }
```
Same shape as approval webhook (`:3720`).

**n8n internals (inferred).** Validate → render template (`subject`, `content_html`, `signature_html` concatenated) → send via Gmail node using the platform's Gmail credential. **No LLM.** Per-user metadata fields (`company_name`, `project_count`, `chat_count`) are forwarded so the n8n template can mail-merge personalized strings — the merge logic is server-side.

**System prompt sent by client.** Not applicable — no LLM.

**Failure modes.**
1. **HTML injection** — `content_html` is composed in a CKEditor-style WYSIWYG and shipped raw to the recipient. No sanitization on the client side; if n8n doesn't sanitize either, this is an XSS-via-email vector for any account that the master uses to email a hostile recipient back.
2. **Mass-send misuse** — there is no rate limit on master-side sends; an admin can loop the call to spam users.
3. **Hard-coded sender** — the From: address is set in the n8n Gmail credential, not configurable per call. No per-tenant signing for a future multi-tenant build.

**Observed latency.** No client timeout. 1–3 s typical (single Gmail API call).

**Token / cost profile.** No LLM. Gmail send quota only.

---

## 6. SUPPORT_LOGIN — `/webhook/support-login`

**URL constant.** `SUPPORT_CONFIG.webhookUrl` declared at `master/index.html:2512`.

**Callers.** Two: `master/index.html:2531` (initial dispatch when the support tile is opened) and `:4038` (the actual "send magic link" submit).

**Trigger.** A support operator enters an end-user's email and requests a one-click magic-link login that they can forward to the user.

**Request body** (composed at the call sites above):
```json
{
  "email": "user@example.com",
  "master_key": "FixAIR_Houssam_2026!"
}
```

**Response body:** the n8n flow returns the magic-link URL (or an error string). Exact shape not commented in the client — the dashboard pastes the response into the support-message UI.

**n8n internals (inferred).** Verify `master_key` against an n8n credential → call `supabase.auth.admin.generateLink({ type: 'magiclink', email })` using the service-role key → return the URL. **No LLM.**

**System prompt sent by client.** Not applicable.

**Failure modes — severity: critical.**
1. **The master key is a hard-coded plaintext literal in the master dashboard HTML** (`master/index.html:3511`, also embedded in the request body at the call sites above). Any visitor who loads `master/index.html` over the public internet (and the file is shipped statically from the FE repo, so any CDN snapshot suffices) recovers the string `FixAIR_Houssam_2026!` and can mint magic-links for arbitrary email addresses. This is a **full account takeover** primitive against any FixAIR user.
2. **No rate limit** on the n8n side that the client is aware of — a single attacker can iterate over a user list.
3. **No audit trail** in the FE codebase — issuance is not logged client-side.

**Required for Qbe rebuild.** Move the secret out of HTML. The support-login flow must require a signed admin session (Supabase JWT with `role='master'`) verified server-side by an n8n function node, not a static string. The client should send no secret at all.

**Observed latency.** No client timeout. 1–2 s typical (one Supabase admin API call).

**Token / cost profile.** No LLM.

---

## 7. DEMO ASSISTANT — `/webhook/fixair-assistant` (no `-dev` suffix)

**URL constant.** Inline literal at the public landing/demo build `index.html:7816`. Distinct from §1: the demo build hits **`/webhook/fixair-assistant`**, the technician app hits **`/webhook/fixair-assistant-dev`**. They are two separate n8n flows in the same n8n project.

**Caller.** Demo chat send → `fetch(WEBHOOKS.assistant, …)` at `index.html:11467`.

**Trigger.** Anonymous visitors using the demo on the public site. No auth, no persistence beyond localStorage.

**Request body** (composed near `index.html:11423`):
```json
{
  "panel": "assistant",
  "message": "<user input>",
  "brand_instruction": "<brand-bias prompt — same shape as §1>",
  "session_id": "<localStorage uuid>",
  "message_count": 1
}
```

Notably **omits** `user_id`, `chat_id`, `project_id`, and the full extraction-instructions block — the demo does not write to Supabase and does not produce a structured report. `conversation_summary` is also absent.

**Response body.** Same three-key fallback (`response | message | output`) as §1.

**n8n internals (inferred).** Likely a stripped-down clone of the technician assistant flow with persistence and extraction stages disabled. Possibly a smaller / cheaper model to control public-traffic costs **(inferred)**.

**System prompt sent by client.** `brand_instruction` only.

**Failure modes.**
1. **No rate limit** on the demo path — a public abuser can pin the model-cost meter without auth.
2. **No CAPTCHA** in the FE flow — demo opens straight into a chat input.
3. **Drift from production** — demo and production are two different n8n flows, so prompt-quality fixes ship to one and not the other unless the operator remembers to mirror.

**Observed latency.** No client timeout. Usually faster than the technician variant (smaller context).

**Token / cost profile.** Per-call ~1–3 k input, 200–800 output. Cheapest of the chat variants. **Highest abuse risk** because of unauth public access.

---

## 8. DEMO COPILOT — `/webhook/fixair-copilot` (legacy diagnosis mode)

**URL constant.** Inline literal at `index.html:7816` (same `WEBHOOKS` object as §7).

**Caller.** Demo "diagnosis mode" panel → `fetch(WEBHOOKS.copilot, …)` at `index.html:11467` (router selects between assistant/copilot via `panel`).

**Trigger.** Demo visitors who toggle from "report mode" to "diagnosis mode" — the latter is the **pre-pivot Copilot** product surface, kept alive on the public site for legacy reasons. Not present in the technician app at all.

**Request body.** Same shape as §7 with `panel: "copilot"` and a different `brand_instruction` (the diagnosis prompt rather than the report-extraction prompt). No `extraction_instructions` block.

```json
{
  "panel": "copilot",
  "message": "<user input>",
  "brand_instruction": "<diagnosis-mode brand bias>",
  "session_id": "<localStorage uuid>",
  "message_count": 1
}
```

**Response body.** Same three-key fallback. No `[REPORT_DATA]` island — the renderer for `panel === 'copilot'` never parses one.

**n8n internals (inferred).** A separate n8n flow tuned for free-form troubleshooting (no structured output requirement). The same Pinecone brand index is plausible **(inferred)**.

**System prompt sent by client.** `brand_instruction` only — same channel as §7.

**Failure modes.** Same unauth-abuse profile as §7. Additionally: this flow is **functionally orphaned** — the diagnosis mode is no longer surfaced anywhere except the demo, and is the last surviving consumer of the `'copilot'` panel value (which still leaks into legacy `chats.chat_type='copilot'` rows; see §02).

**Observed latency.** Same as §7.

**Token / cost profile.** Same as §7. **Recommended for retirement** — one less surface to maintain, one less prompt to keep in sync.

---

## Appendix — exportable / committed flow JSON

**No n8n workflow JSON is committed to this repo.** A grep for the n8n export shape (`"nodes"` + `"connections"` JSON keys, the `*.n8n.json` extension, `n8n-workflow*` filenames) returns zero matches against the FE tree. The eight flows above exist only inside the n8n editor on the operator's n8n cloud instance.

### Recommended next step
Export each flow from n8n (Editor → ⋮ → Download) and commit the JSON to `audit-v3/n8n-flows-export/` so a Qbe rebuild has the actual node graph, model selection, system prompts, and Pinecone wiring as ground truth — rather than the client-side inference compiled in this file.

Suggested filenames (one file per flow):
- `01-assistant-dev.json`
- `02-extraction-dev.json`
- `03-ocr.json`
- `04-approval.json`
- `05-email-send.json`
- `06-support-login.json`
- `07-assistant-public-demo.json`
- `08-copilot-public-demo-legacy.json`

### Planned but not yet built — STRIPE_WEBHOOK
A ninth webhook is **documented in a planning markdown file** but is not wired into any production HTML:
- **Path.** `/webhook/stripe-webhook`
- **Source of record.** `technician/ADDENDUM-STRIPE-AUDIT-PROTECTION.md:253`
- **Intended flow.** Stripe `checkout.session.completed` → n8n verifies signature with the Stripe webhook secret → updates `users.subscription_tier` in Supabase → fires confirmation email through the same Gmail credential as §4/§5.
- **Status.** Specification only. No FE caller exists; no n8n flow exists in the live editor as far as the client codebase indicates. **Treat as a TODO**, not as documentation of working behavior.

When the Stripe flow ships, this doc gains a Section 9.

### Hostname
The actual n8n host is hard-coded as `https://cherhabil.app.n8n.cloud` in both `technician/index.html` and `master/index.html`. It is **not** redacted in source. Hostname appears redacted in this audit doc by convention only (`[N8N-HOST]`); a Qbe-targeted rebuild should externalize this to a config (env var, build-time injection, or Supabase `app_settings` row) so that staging and prod can point at different n8n tenants.

### Cross-cutting risks across all 8 flows
1. **No client-side timeout anywhere.** Every `fetch` to n8n is awaited indefinitely. A stuck n8n node = a stuck UI.
2. **No retry policy.** A single 5xx fails the user-facing action with no automatic retry.
3. **System prompts split between client and n8n.** Anything sent in the request body (`extraction_instructions`, `brand_instruction`) is editable by anyone who can call the URL, and silently overrides server-side defaults. Trust boundary is wrong.
4. **No request signing.** All eight webhooks accept anonymous POSTs. The only "auth" is the support-login master_key string (broken — see §6). For a Qbe rebuild, gate every webhook behind a Supabase JWT validated server-side by an n8n function node.
