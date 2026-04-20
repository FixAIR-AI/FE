# 02 — Data shapes

The shapes that flow through FixAIR at runtime. Each shape gets: purpose, storage location, field table, known issues. Line references are against `technician/index.html` at commit `fbbf8dd` unless noted.

**Purpose.** A reimplementation of FixAIR for a neighbouring vertical (Qbe / electricians) must re-emit these shapes byte-for-byte at every boundary — chat persistence, webhook IO, settings, storage, localStorage — or the existing frontend logic breaks. This doc is the contract.

**How to read.** Each section = one persistent shape. "Produced by" tells you whether the assistant, technician, or system owns a field; "Req" is true if the UI/export explodes without it. Tables omit fields that are internal caches only (prefixed `_`).

**Legend — Produced by:**
- **A** = assistant (n8n extraction webhook or chat stream)
- **T** = technician (drawer DOM edits or explicit UI input)
- **S** = system (defaults injected on create, or computed by client code)
- **M** = mixed / reconciled (multiple writers, merged by `normalizeReportData` or equivalent)

---

## `projects.extracted_data` (jsonb)

The full report JSON. One row per intervention lives in `public.projects` (see `audit-v2/01_supabase_schema.sql:104`). `extracted_data` is the column; the in-memory mirror is the global `lastReportData` (declared `technician/index.html:10801`).

**Writers** — three, all merged through `unifiedMerge()` (`technician/index.html:13322`) after passing through `normalizeReportData()` (`technician/index.html:13059`):

| # | Source | Code site | Produced-by |
|---|--------|-----------|-------------|
| 1 | n8n extraction webhook response (`result.extracted_data`) | `technician/index.html:16220`, via `EXTRACTION_WEBHOOK` at `:9494` | assistant |
| 2 | Chat stream partial extractions | `:9253`, `:10256`, `:16553` | assistant |
| 3 | Drawer DOM edits via `drawerExtractDataFromDOM()` | `:15063`, `:15088` | technician |

**Readers** — drawer preview (`updateDrawerPreview` at `:9258`), Word export (`:10943`), `reports` row build (`saveReportData` at `:16667`), completion calc (`calculateReportCompletion` at `:7135`). Persisted by the debounced `extracted_data` save (`debouncedSaveExtractedData` at `:16261`) and the synchronous flush (`flushDrawerAutoSave` at `:15047`). On project load: `:10109–10112`.

### Anonymized example

```json
{
  "brand": "DAIKIN",
  "brand_key": "daikin",
  "status": "en_cours",
  "date": "12/04/2026",
  "reference": "RAP-2026-0412-0001",
  "numero_rapport": "RAP-2026-0412-0001",
  "resume": "Maintenance préventive annuelle VRV — 1 UE, 4 UI. RAS.",
  "type_intervention": "MAINTENANCE PRÉVENTIVE ANNUELLE",
  "type_operation": "MAINTENANCE PRÉVENTIVE ANNUELLE",
  "nature_intervention": "MAINTENANCE PRÉVENTIVE ANNUELLE",
  "conclusion": "Installation conforme, aucune action corrective requise.",
  "status_intervention": "resolu",
  "charge_totale": "8.4",
  "charge_usine": "8.0",
  "charge_appoint": "0.4",

  "intervention": {
    "type": "MAINTENANCE PRÉVENTIVE ANNUELLE",
    "type_label": "MAINTENANCE PRÉVENTIVE ANNUELLE",
    "type_detail": "Visite annuelle contractuelle — VRV IV"
  },

  "client": {
    "nom": "[REDACTED-CLIENT]",
    "societe": "Acme SAS",
    "contact": "Jean Exemple",
    "telephone": "01 23 45 67 89",
    "email": "jean.exemple@acme.example",
    "reference": "CLI-00042",
    "adresse": "10 rue de l'Exemple, 75000 Paris"
  },

  "site": {
    "adresse": "10 rue de l'Exemple",
    "ville": "Paris",
    "numero_affaire": "AFF-2026-0042",
    "postal": "75000",
    "country": "FR"
  },

  "equipements": [
    {
      "id": "ue-1",
      "marque": "DAIKIN",
      "modele": "RXYQ10U",
      "role": "ue",
      "type_ui": "",
      "numero_serie": "SN-UE-000001",
      "puissance": "28 kW"
    },
    {
      "id": "ui-1",
      "marque": "DAIKIN",
      "modele": "FXAQ32A",
      "role": "ui",
      "type_ui": "murale",
      "numero_serie": "SN-UI-000001",
      "puissance": "3.2 kW"
    }
  ],

  "systeme": {
    "type": "VRV",
    "modele": "RXYQ10U",
    "serie": "SN-UE-000001",
    "puissance": "28 kW",
    "garantie": "hors_garantie"
  },

  "fluide": {
    "type": "R410A",
    "charge_totale": "8.4 kg",
    "charge_initiale": "8.0 kg",
    "charge_appoint": "0.4 kg",
    "type_huile": "FVC68D"
  },
  "fluide_global": {
    "type": "R410A",
    "charge_totale_site_kg": 8.4,
    "charge_usine_kg": 8.0,
    "charge_appoint_kg": 0.4
  },

  "adressage": [
    {
      "adresse": "UI1",
      "equipement_id": "UI1",
      "ref_usine": "UI1",
      "modele": "FXAQ32A",
      "zone": "Bureau RDC",
      "designation": "Bureau RDC",
      "numero_serie": "SN-UI-000001"
    }
  ],

  "mesures": [
    {
      "label": "Pression HP",
      "type": "Pression HP",
      "valeur": "28.5",
      "valeur_texte": "28.5 bar",
      "unite": "bar",
      "status": "conforme",
      "sous_type": "circuit 1",
      "equipement_id": "ue-1"
    },
    {
      "label": "Température soufflage",
      "type": "Température soufflage",
      "valeur": "14",
      "valeur_texte": "14 °C",
      "unite": "°C",
      "status": "conforme",
      "sous_type": "",
      "equipement_id": "ui-1"
    }
  ],

  "codes_defaut": [],

  "travaux_effectues": [
    {
      "titre": "Nettoyage filtres UI",
      "texte": "Dépose, soufflage et rinçage des 4 filtres UI.",
      "contenu": "Dépose, soufflage et rinçage des 4 filtres UI.",
      "status": "done"
    },
    {
      "titre": "Contrôle pressions",
      "texte": "HP/BP relevées, valeurs dans les tolérances constructeur.",
      "contenu": "HP/BP relevées, valeurs dans les tolérances constructeur.",
      "status": "done"
    }
  ],

  "travaux_prevoir": [
    {
      "titre": "Remplacement filtres UI",
      "texte": "Prévoir un jeu complet de filtres sous 6 mois.",
      "priorite": "basse"
    }
  ],

  "reserves": [
    {
      "titre": "Accès UE restreint",
      "description": "Toiture accessible uniquement avec nacelle.",
      "texte": "Toiture accessible uniquement avec nacelle.",
      "type": "acces"
    }
  ],

  "recommandations": [
    {
      "titre": "Contrat d'entretien",
      "description": "Souscrire un contrat annuel pour garantir la longévité.",
      "texte": "Souscrire un contrat annuel pour garantir la longévité."
    }
  ],

  "resultat": {
    "status": "resolu",
    "label": "Résolu",
    "description": "Installation conforme, aucune action corrective requise.",
    "conclusion": "Installation conforme, aucune action corrective requise."
  },

  "technicien": {
    "nom": "[REDACTED-TECH]",
    "entreprise": "FixAIR Démo",
    "adresse": "1 avenue du Test, 75000 Paris",
    "email": "tech@fixair.example",
    "heure_arrivee": "09:15",
    "heure_depart": "11:40",
    "autres": ""
  },

  "signatures": {
    "client": { "image": "data:image/png;base64,iVBORw0KGgo...[truncated]" },
    "technicien": { "image": "data:image/png;base64,iVBORw0KGgo...[truncated]" },
    "nom_client": "Jean Exemple",
    "nom_technicien": "[REDACTED-TECH]"
  },

  "photos": [
    {
      "url": "https://[PROJECT].supabase.co/storage/v1/object/public/project-photos/USER_ID/PROJECT_ID/photo-1.jpg",
      "data": "",
      "caption": "Vue générale UE toiture",
      "name": "photo-1.jpg"
    }
  ],

  "observation_client": "Client présent, site accessible aux heures convenues.",
  "dates":        { "debut_date": "12/04/2026", "debut_heure": "09:15", "fin_date": "12/04/2026", "fin_heure": "11:40" },
  "securite":     { "etat": "conforme", "risques": "" },
  "tests":        { "pression_test_bar": "", "duree_test_heures": "", "valeur_vacuometre_mbar": "" },
  "tuyauteries":  { "longueur_totale_m": "42", "denivele_oc_ui_m": "6", "appoint_calcule_kg": "0.4" },
  "electrique":   { "calibre_disjoncteur": "32A", "section_cable": "4 mm²" },
  "releves_ue":   { "pd1_bar": "28.5", "ps_bar": "7.1", "ta_celsius": "22", "freq_inv1_hz": "62" },
  "pieces":       [],
  "rapport_technicien": "Visite conforme au contrat. Pas de défaut constaté.",
  "remarques": ""
}
```

### Field-by-field

Produced-by legend: **A** = assistant (n8n extraction webhook or chat stream), **T** = technician (drawer DOM edits), **S** = system (constructor/defaults), **M** = mixed (multiple sources, reconciled by `normalizeReportData`).

| Path | Produced-by | Req | Mirrored to `reports.*` | Known issues / legacy |
|---|---|---|---|---|
| `brand` | M (S on create `:9255`) | yes | `equipment_brand` | Uppercase brand name; `brand_key` is lowercase slug. Both exist for historical reasons. |
| `brand_key` | S (`:9255`) | yes | `equipment_brand` | — |
| `status` | S | yes | — | Free-form; `"en_cours"` set on create. Not the same as `projects.status`. |
| `date` | S (`new Date().toLocaleDateString('fr-FR')` `:9255`) | yes | — | French locale hard-coded — breaks for non-FR verticals. |
| `reference` / `numero_rapport` | A | no | `title` (via `saveReportData :16685`) | Duplicate fields — alias only. |
| `resume` | A | no | `problem_reported` (`:16690`) | — |
| `type_intervention` | A | no | `report_type` (`:16686`) | 3-way duplicated with `intervention.type|type_label|type_detail` + `type_operation` + `nature_intervention`. `normalizeReportData` picks longest candidate (`:13182–13203`). |
| `conclusion` (root) | M | no | — | Duplicates `resultat.conclusion`; kept for "backward compat" per code comment `:13300`. |
| `status_intervention` (root) | M | no | — | Duplicates `resultat.status`; `normalizeReportData:13256` maps FR→slug. |
| `charge_totale` / `charge_usine` / `charge_appoint` (root) | M | no | — | Duplicates `fluide.*`. R4-FIX1 `:13072–13078, :13127–13129`. |
| `intervention.{type,type_label,type_detail}` | A | no | — | See `type_intervention` above. |
| `client.{nom,societe,contact,telephone,email,reference,adresse}` | A+T | no | `client_name` = `societe` (`:16695`) | `nom` rarely populated; `societe` is the de-facto client name. |
| `site.{adresse,ville,numero_affaire,postal,country}` | A+T | no | `client_address` = `adresse + ', ' + ville` (`:16696`) | — |
| `equipements[].{id,marque,modele,role,type_ui,numero_serie,puissance}` | A+T | no | — | `role` enum: `ue\|ui\|outdoor\|indoor\|unite_exterieure`. Bidirectionally synced with `systeme` (`:13131–13152`). HVAC-specific. |
| `systeme.{type,modele,serie,puissance,garantie}` | A+T | no | `equipment_model` = `.modele`, `equipment_type` = `.type` (`:16688`) | Back-filled from `equipements[0]` or injected as `id:"sys-1"`. HVAC-specific. |
| `fluide.{type,charge_totale,charge_initiale,charge_appoint,type_huile}` | A+T | no | — | String values with " kg" suffix; `cleanKg` strips double-kg (`:13065,:13108`). HVAC-refrigerant-specific — not applicable to electrical verticals. |
| `fluide_global.{type,charge_totale_site_kg,charge_usine_kg,charge_appoint_kg}` | M | no | — | Numeric mirror of `fluide` for queryability. 3-way sync `:13080–13124`. |
| `adressage[].{adresse,equipement_id,ref_usine,modele,zone,designation,numero_serie,serie,model}` | A+T | no | — | Per-indoor-unit addressing table. Every field has ≥1 alias synced in `:13217–13233`. HVAC-specific. |
| `mesures[].{label,type,valeur,valeur_texte,unite,status,sous_type,equipement_id,_normalizedLabel,_normalizedType}` | A+T | no | — | `_normalized*` are internal caches for dedup (`:13211`). Label alias map via `normalizeMesureLabel`. |
| `codes_defaut[].{code,description,resolution}` | A | no | `error_codes` (`:16693`) | **Mostly empty post-`fbbf8dd`.** Diagnostic pivot removed the extractor paths that populated this; schema kept for legacy rows. |
| `travaux_effectues[].{titre,texte,contenu,status}` | A+T | no | `actions_performed` (`:16694`) | `texte` and `contenu` kept as aliases (`:13154–13160`). Status enum: `done\|error\|pending`. |
| `travaux_prevoir[].{titre,texte,priorite}` | A+T | no | — | — |
| `reserves[].{titre,description,texte,type}` | A+T | no | — | May arrive as bare string; `:13169–13174` coerces to object. `description` ↔ `texte` synced. |
| `recommandations[].{titre,description,texte}` | A+T | no | — | Same string-coercion pattern as `reserves` (`:13236–13245`). |
| `resultat.{status,label,description,conclusion}` | M | no | `problem_identified` = `.description` (`:16691`) | 4-way reconcile with root-level `conclusion`/`status_intervention`/`resultat_intervention` (`:13247–13302`). Status enum: `resolu\|en_cours\|non_resolu\|en_attente_pieces`. Prefix-strip regex `:13283–13296`. |
| `technicien.{nom,entreprise,adresse,email,heure_arrivee,heure_depart,autres}` | T | no | — | `"HH:MM"` placeholder stripped (`:13304–13310`). |
| `signatures.{client.image,technicien.image,nom_client,nom_technicien}` | T | no | — | `image` is base64 data-URL; signatures live inline in jsonb — can push the row past 1 MB. See Part B. |
| `photos[].{url,data,caption,name}` | T | no | — | **Duplicates `projects.photos`** (separate jsonb column, `:10096`). `url` points at `project-photos` bucket; `data` is sometimes base64 for photos pending upload. Report export reads from here, not from `projects.photos`. |
| `observation_client` | T | no | — | — |
| `dates.{debut_date,debut_heure,fin_date,fin_heure}` | T | no | — | Separate from `technicien.heure_arrivee/depart`; both are populated independently. |
| `securite.{etat,risques}` | T | no | — | — |
| `tests.{pression_test_bar,duree_test_heures,valeur_vacuometre_mbar}` | T | no | — | HVAC-specific (pressure/vacuum test of refrigerant circuit). |
| `tuyauteries.{longueur_totale_m,denivele_oc_ui_m,appoint_calcule_kg}` | T | no | — | HVAC-specific (refrigerant piping). |
| `electrique.{calibre_disjoncteur,section_cable}` | T | no | — | Small — electrician vertical will expand this substantially. |
| `releves_ue.{pd1_bar,ps_bar,ta_celsius,freq_inv1_hz}` | T | no | — | HVAC-specific (outdoor unit live readings). |
| `pieces[].{reference,designation,quantite}` | T | no | — | Parts list. Integer `quantite`. |
| `rapport_technicien` | T | no | `solution_description` (`:16692`) | Free-text — the "body" of the report. |
| `remarques` | T | no | — | — |

### Known issues at the shape level

1. **No schema enforcement.** `extracted_data` is `jsonb` with no validator. All reconciliation is in `normalizeReportData`; anything that bypasses it writes arbitrary shapes. A future port should front this with Zod.
2. **Three-way fluide sync (`:13062–13129`)** carries `fluide`, `fluide_global`, and root-level `charge_*` — every writer must update all three or `normalizeReportData` will silently reconcile them. Net effect: the row often contains the same kg value 3 times in 3 formats.
3. **Array replace semantics.** `unifiedMerge` (`:13322–13346`) **replaces** `travaux_effectues`, `travaux_prevoir`, `recommandations` wholesale on every chat update — technician edits to these lists are lost the moment the assistant re-emits the array. Documented as intentional but routinely trips users.
4. **Legacy `codes_defaut`.** Diagnostic pivot (`fbbf8dd`) removed the extractor paths but not the column, the UI, or the export branch. Existing rows retain stale codes; new rows arrive empty.
5. **`photos` duplication.** `extracted_data.photos[]` and `projects.photos` (column) coexist. Word export (`:10943`) reads the jsonb copy only.
6. **Row size.** Two base64 signature PNGs plus embedded photo data-URLs routinely push one row past 500 KB. Supabase REST row limit is 1 MB; observed truncation when >3 photos are saved as `data:` URLs instead of uploaded.
7. **FR-locale coupling.** Dates (`toLocaleDateString('fr-FR')`), status slugs (`resolu`/`non_resolu`/`en_cours`/`en_attente`), and prefix-strip regexes (`Conclusion:`, `Statut:`, `Description:`) are hard-coded. i18n requires touching `normalizeReportData`.
8. **HVAC-specific top-level keys** that a non-HVAC vertical (Qbe/electricians) must drop or remodel: `equipements[].role='ue|ui'`, `systeme`, `fluide`, `fluide_global`, `adressage[]`, `tests` (pressure/vacuum), `tuyauteries`, `releves_ue`. See `08_vertical_specific_vs_agnostic.md` for the full fork map.

---

## `projects.drawer_state` (does not exist)

**Verdict: no such column, no such field.** A grep for `drawer_state`, `drawerState`, `drawer_data`, `ui_state`, `editor_state` against `technician/index.html` returns zero hits. The drawer's open/closed state, active tab, scroll position, and "which section is being edited" are **in-memory only** and lost on every reload.

What does persist per project:

| Column | Writer | Site |
|---|---|---|
| `extracted_data` (jsonb) | `debouncedSaveExtractedData` | `technician/index.html:13449` |
| `updated_at` | same | `:13450` |
| `progress` | same | `:13450` |
| `completion_status` (conditional) | same | `:13450` |
| `completed_at` (conditional) | same | `:13450` |
| same five fields | `flushSaveToSupabase` (sync flush on close/blur) | `:15070–15076` |

**Implication for Qbe.** A faithful port keeps the drawer state ephemeral — there is no contract to honor. If the Qbe UI wants persistent drawer state (e.g. "resume on the same tab"), that's a *new* column, not a migration of existing behaviour.

---

## `chats` row

One row per conversation, scoped to one user and (usually) one project. Read in the chat history loader (`:9196–9210`, `:10184–10210`); written by `createChat` (`:9290–9295`), the project-creation flow (`:9607–9612`), and the legacy assistant shim (`:9950–9955`).

| Column | Type | Producer | Notes / known issues |
|---|---|---|---|
| `id` | uuid | S | Server default. |
| `project_id` | uuid (FK → `projects.id`) | S | Filter for "chats on this project" (`:10056`). Nullable for legacy global-assistant chats. |
| `user_id` | uuid (FK → `auth.users`) | S | Set on insert (`:9291`). |
| `chat_type` | text | S | Read at `:9196`, `:10055`, `:10059`, `:10190`. **Legacy value `'copilot'` still present** — `:10190` reads `chat.chat_type === 'copilot'` and remaps to the modern `'assistant'` mode for display. New writes use `'assistant'` (`:9292`, `:9609`, `:9951`). |
| `is_active` | bool | S | Set true on insert (`:9293`, `:9610`). No code path flips it back to false — old chats stay "active" forever. |
| `started_at` | timestamptz | S | Used as the order-by for chat list (`:10184`). |
| `created_at` | timestamptz | S | Server default; not read directly anywhere except via Supabase auto-ordering. |

**Legacy `copilot` rows** are the residue of the pre-pivot "Copilot" branding. They are not migrated — they're remapped on read. A clean Qbe rebuild can drop the `'copilot'` enum value and remap-on-read code entirely.

---

## `messages` row

One row per chat turn (user input or assistant reply). Read in `loadMessages` (`:9206–9210`, `:10199–10260`); written by `saveMessage` (`:9632–9638`).

| Column | Type | Producer | Notes |
|---|---|---|---|
| `id` | uuid | S | Server default. |
| `chat_id` | uuid (FK → `chats.id`) | S | `:9206`, `:9632`. |
| `role` | text | M | `'user' \| 'assistant'`. Read at `:9214`, `:10243`; written at `:9633`. No `'system'` or `'tool'` rows observed. |
| `content` | text | M | Plain text or markdown. Read at `:9247`, `:10251`; written at `:9634`. For OCR/image messages this holds the OCR'd text body. |
| `content_type` | text | M | Enum: `'text' \| 'image' \| 'ocr'`. Read at `:9217`, `:9230`, `:10214`, `:10227`; written at `:9635`. Drives whether the bubble renders as text, image preview, or OCR result block. |
| `thought_process` | jsonb | A | **Array of `{ title, body }` reasoning steps.** Parsed at `:10241` and iterated at `:10242` (variable `steps`). Written at `:9636`. Empty array for user messages. |
| `thought_summary` | text | A | One-liner summary of the thought steps, displayed collapsed above the bubble. Read at `:10243`, written at `:9637`. |
| `created_at` | timestamptz | S | Order-by (`:9207`, `:10199`). |

**Streaming state is not persisted.** There is no `is_streaming`, `status`, or `stream_id` column. While a reply streams, the UI maintains an in-memory placeholder; only the final, complete message is inserted via `saveMessage`. A reload mid-stream loses the in-flight reply with no recovery path.

---

## Webhook payload shapes (brief)

The brief asked for 8 webhooks; the codebase contains **6 distinct n8n endpoints**. Three live in `technician/index.html` (the field app) and three in `master/index.html` (the admin dashboard). Detailed flow descriptions are in `audit-v2/03_n8n_flows.md`; this section is just the wire shape for each.

### 1. `ASSISTANT_WEBHOOK` — `/webhook/fixair-assistant-dev`
- **Declared:** `technician/index.html:9492` · **Called:** `:16521`
- **Request:** `{ user_id, chat_id, session_id, panel, message, message_count, conversation_summary, brand_instruction, system_context, report_extraction_mode, extraction_instructions }`
- **Response:** `{ response | message | output }` — the renderer tries all three keys in that order (`:16545`); body may contain a `[REPORT_DATA]…[/REPORT_DATA]` JSON island parsed at `:16549`.

### 2. `EXTRACTION_WEBHOOK` — `/webhook/fixair-extraction-dev`
- **Declared:** `technician/index.html:9494` · **Called:** `:16211`
- **Request:** `{ brand_name, message, message_count, panel, full_conversation, current_report_data, timestamp }`
- **Response:** `{ extracted_data: {…full report shape…}, completion_percentage: number }` (`:16221`). The `extracted_data` payload follows the §`projects.extracted_data` contract above and is fed straight into `unifiedMerge`.

### 3. `OCR_WEBHOOK_URL` — `/webhook/fixair-ocr`
- **Declared:** `technician/index.html:17265` · **Called:** `:17298`
- **Request:** `{ image: "<base64>", brand: "<brand_key>" }`
- **Response:** `{ output | response | text }` — same three-key fallback as the assistant webhook (`:17309`). Output is dropped into the chat as a `content_type='ocr'` message.

### 4. `N8N_WEBHOOK_URL` (approval) — `/webhook/fixair-approval`
- **Declared:** `master/index.html:1281` · **Called:** in the admin approval flow.
- **Request / response:** admin-only operations (approve user, approve project) — payload is `{ action, target_id, master_id }`-shaped, response is `{ success, error? }`. Not exercised by the technician app.

### 5. `EMAIL_SEND_WEBHOOK` — `/webhook/email-send`
- **Declared:** `master/index.html:3508` · **Called:** `:3712`
- **Request:** `{ recipient_email, recipient_user_id, subject, content_html, company_name, role, project_count, chat_count, signature_html? }`
- **Response:** `{ success: bool, error?: string }` (`:3720`).

### 6. `SUPPORT_LOGIN_WEBHOOK` — `/webhook/support-login`
- **Declared:** `master/index.html:2512` (`SUPPORT_CONFIG.webhookUrl`) · **Called:** `:4038`
- **Request:** `{ email, master_key: 'FixAIR_Houssam_2026!' }`
- **Response:** magic-link URL.
- **Severe security issue:** the master key is a hard-coded string literal shipped to every browser that loads the master dashboard (`master/index.html:3511`). Any visitor can mint a support magic-link for any email. Flag for the Qbe rebuild — must move to a server-side secret.

---

## `app_settings` and `api_keys` rows

### `app_settings`
A flat key/value bag, one row per setting. Read at `technician/index.html:7481–7498`.

| Column | Type | Notes |
|---|---|---|
| `key` | text (PK or unique) | The setting name. Filtered with `.eq('key', …)`. |
| `value` | text / jsonb | The setting value. Stringly-typed; callers cast as needed. |

**Known keys in production:** `elevenlabs_api_key` (read at `:7498` and cached in the in-memory `cachedApiKeys` map at `:7475–7495`).

### `api_keys`
**Does not exist as a table.** No `.from('api_keys')` calls anywhere in the codebase. All "API keys" are stored as rows in `app_settings` (above) and a few are also referenced by name in `users.*` (e.g. `subscription_tier` for paywall gating, but no third-party key columns).

### Security note (severe)
Both the ElevenLabs key and any future keys added to `app_settings` are **fetched client-side** via the public Supabase URL using the `anon` key (`technician/index.html:7481–7498`). RLS does not protect them — `audit-v2/01b_supabase_rls.sql` shows `app_settings` has a permissive `SELECT` policy. Any logged-in user (and possibly any anon visitor, depending on policy) can read every key. The Qbe rebuild must move third-party API keys to a server-side proxy (n8n credential, edge function, or a Supabase RPC that gates by role).

---

## `users` row (no separate `profiles` table)

The `public.users` table is the single source of profile, billing, freemium, and gamification state — there is **no `profiles` table** (every `.from('profiles')` grep returned zero hits). This row is a god-object: 6+ functional concerns piled into one table, all read client-side.

### Auth / identity
| Column | Type | Producer | Read | Notes |
|---|---|---|---|---|
| `id` | uuid (PK = `auth.users.id`) | S | `:7766`, `:1120` | FK target for every other table. |
| `email` | text | S | `:7766`, `:1120` | Mirrored from `auth.users.email`. |
| `first_name`, `last_name` | text | T | `:7767`, `:8227` | Edited in profile settings. |
| `phone` | text | T | `:8228` | Optional. |
| `language` | text | T | `:8229` | `'fr' \| 'en' \| …` UI locale. |
| `role` | text | S | `:1121` | `'technician' \| 'admin' \| 'master'`. Drives which dashboard loads. |
| `status` | text | S | `:1122` | `'active' \| 'pending' \| 'suspended'` — gates login. |
| `live_status` | text | S | `:8053–8057` | `'online' \| 'idle' \| 'offline'` — heartbeat write every N seconds. |
| `onboarding_done` | bool | T | `:6438`, `:8388` | Set true after first-run wizard completes. |

### Company metadata
| Column | Type | Producer | Read | Notes |
|---|---|---|---|---|
| `company_name` | text | T | `:8381–8396` | Free text; appears on report header. |
| `company_logo` | text (base64 data URL) | T | `:8355` (FileReader → `dataUrl`), written `:8383` | **Severe:** stored inline as a base64 PNG/JPEG inside the row. Logos routinely 50–200 KB; pushes the row past efficient REST limits and re-downloads on every profile fetch. Must move to Supabase Storage in any rebuild. |

**Missing fields the brief asked about** (grep returned nothing): `company_address`, `siret`, `vat`. Companies are name+logo only.

### Freemium / subscription
| Column | Type | Notes |
|---|---|---|
| `subscription_tier` | text | `'free' \| 'pro' \| …`. Read at `:18596`, `:19005`, `:19040`. Drives paywall gates and freemium counters. |

**Trial dates** (`trial_start`, `trial_end`, `trial_expires_at`) are **not present** — the freemium model is tier-based, not time-bounded. **Stripe / billing IDs** (`stripe_customer_id`, `subscription_id`) are also absent — billing integration is not in this codebase.

### Referral / ambassador
| Column | Type | Notes |
|---|---|---|
| `referral_code` | text | Unique per user. Read `:19190`. |
| `total_referrals` | int | Counter of users who signed up with this code. |
| `completed_referrals` | int | Subset that converted (paid / verified). `:19263`. |
| `bonus_queries` | int | Extra assistant calls earned via referrals. `:19241`. |
| `is_ambassador` | bool | Unlocks the ambassador UI (`:19263`). |
| `week_free_granted_at` | timestamptz | Timestamp of last "free week" reward — used to throttle re-grants. |

### Gamification
**None present.** Grep for `xp`, `level`, `points`, `achievements`, `badges`, `streak` against the users-table calls returned zero hits. The brief mentioned XP/level — not in the schema. If Qbe wants gamification, it's a new build, not a port.

---

## `calendar_events` row

One row per scheduled item (intervention, follow-up, internal task). Read at `technician/index.html:14445`, `:14524`, `:14537`, `:14558`; written via the calendar create/edit modal.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Server default. |
| `user_id` | uuid (FK → `users.id`) | Owner. |
| `title` | text | Display label. |
| `type` | text | Enum — observed values include `'copilot'` (legacy) and `'assistant'` alongside generic event types. Same legacy-rename pattern as `chats.chat_type`. |
| `date` | text (`YYYY-MM-DD`) | ISO date string. `:14448`, `:14613`. Stored as `date` (not timestamp) so that `start_time`/`end_time` can be optional. |
| `start_time` | text (`HH:MM`) | Nullable. `:14456`, `:14512`. |
| `end_time` | text (`HH:MM`) | Nullable. `:14457`, `:14513`. |
| `all_day` | bool | Default false. `:14458`, `:14514`. When true, time fields are ignored. |
| `location` | text | Free text — address or site name. |
| `client` | text | Free text — duplicates `projects.client_name` when `project_id` is set. |
| `notes` | text | Free text. |
| `project_id` | uuid (FK → `projects.id`) | Nullable. `:14465`, `:14518`. Links the calendar entry to the intervention being scheduled. |
| `repeat_type` | text | Recurrence — `'none' \| 'daily' \| 'weekly' \| 'monthly'`. In-memory key is `repeat`, mapped from the `repeat_type` column at `:14461`. |
| `reminder` | text/int | `:14462`. Column present in select; not exercised by any UI in the technician app. |
| `visibility` | text | `:14463`. `'private' \| 'team'` — scaffolded but unused. |
| `job_id` | uuid | `:14466`. Reserved for an unimplemented "job dispatch" feature. |

**Date/time gotcha.** Because `date` is a text `YYYY-MM-DD` and `start_time` is a separate text `HH:MM`, there is **no timezone information stored** anywhere. The render and the n8n flows both assume Europe/Paris. A multi-region rollout will need a real `timestamptz` column.

**No color coding** is stored — colors are derived client-side from `type`.

---

## Signature shape

**Capture.** Custom HTML5 canvas (`#signatureCanvas`, `300×150`px, `technician/index.html:5652`) with hand-rolled mouse/touch handlers (`:13216–13224`). No third-party library — no `signature_pad`, no `SignaturePad` class.

**Format.** Base64 PNG via `canvas.toDataURL('image/png')` (`:13288`). Output is a `data:image/png;base64,…` URL string, not a file upload.

**Storage.** Inline inside `projects.extracted_data.signatures` (see §`projects.extracted_data` example above) under two keys:
- `signatures.client.image` — captured into `lastReportData.signature_client` at `:13294`
- `signatures.technicien.image` — captured into `lastReportData.signature_technicien` at `:13296`

Both are persisted by the same debounced `extracted_data` save as the rest of the report — there is no separate signatures table, no Supabase Storage upload, no compression step.

**Size.** A 300×150 PNG of a typical scribble lands between **2 and 8 KB** raw (~3–11 KB once base64-encoded). With both signatures present, the row carries 6–22 KB of signature data on every fetch and write. Combined with logos (`users.company_logo`, also inline base64) and any pending photo uploads (`extracted_data.photos[].data`), it is straightforward to push a single project row past 200 KB. The Supabase REST 1 MB row cap is the hard ceiling.

**Two distinct signatures.** Client and technician are captured separately by the same canvas component, swapped in/out on the modal. The `nom_client` and `nom_technicien` strings are stored alongside the images at the `signatures.*` level for the export header.

**Recommendation for Qbe.** Move both signatures and the company logo to Supabase Storage, store URLs only in the row. The current inline-base64 design is the single biggest contributor to row bloat.

---

## `localStorage` keys that matter

Every `localStorage.setItem` / `getItem` call in the technician app, with shape, owner, and blast-radius if cleared. `sessionStorage` is **not** used by production code — only by `debug/index.html`.

| Key | Shape | Writer | Reader | Purpose | Breaks if cleared |
|---|---|---|---|---|---|
| `fixair_theme` | string `'dark' \| 'light'` | `:5933` | `:5820` | UI theme preference. | Theme silently reverts to `'dark'`. No data loss. |
| `fixair_lang` | string `'fr' \| 'en' \| …` | `:5951` | `:5821` | UI locale. | Locale reverts to `'fr'`; FR-locale strings still hard-coded so impact is small. |
| `fixair_onboarding_done` | string `'true'` | `:6438`, `:8368` | `:6763` | First-run wizard completion flag. | Onboarding modal re-appears on next load; survivable, mildly annoying. |
| `fixair_user` | JSON `{ id, email, first_name, role, status, … }` | `:6960`, `:7010` | `:6940`, `:6953`, `:14111` | **The cached session.** Used to bypass an auth round-trip on cold load. | Re-auth required on next load. Mid-session, code reads `fixair_user` for `user_id` in many writes — clearing it during use will break the next save (writes will fail with null FK or get silently misattributed). |
| `fixair_demo_user_id` | string (uuid) | `:8229` | `:8226` | Stable ID for the offline/demo path. | Demo mode regenerates a new ID; demo-mode rows previously written under the old ID become orphaned (not migrated). |
| `fixair_calendar_events` | JSON array of event objects (same shape as `calendar_events` rows) | `:14495` | `:14481` | Fallback storage for the calendar in offline/demo mode (deprecated for authenticated users). | Demo calendar empties. Authenticated users unaffected — they read from Supabase. |
| `fixair_lastStats` | JSON `{ totalMinutes, totalEuros, reports }` | `:14236` | `:14230` | Cached stats counters for the dashboard tile (avoids a round-trip to render the tile on cold load). | Counters render as `0` until the next stats refresh repopulates them. |
| `fixair-tech-auth` | (legacy) | — | removed at `:6804` | Legacy auth token from a pre-Supabase build. Code only ever **deletes** it, never sets it. | N/A — kept only for cleanup of old installs. |

### Cross-cutting risks
1. **`fixair_user` is treated as authoritative for `user_id`** in several write paths (chats, messages, projects). A user who clears localStorage mid-session and then writes a row will miss the auth refresh and produce orphaned data. The Qbe rebuild should derive `user_id` from `supabase.auth.getUser()` on every write, not from the cached blob.
2. **No write-version stamping.** None of these keys carry a schema version. A future shape change to `fixair_user` (new required field) will silently misread old payloads.
3. **No quota awareness.** `fixair_calendar_events` can grow unbounded in demo mode. localStorage's 5–10 MB cap would silently truncate writes — code does not catch `QuotaExceededError`.
