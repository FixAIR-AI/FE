# FRONTEND AUDIT RESULTS — FixAIR Technician App

**File**: `technician/index.html` (~20,752 lines)
**Branch**: `claude/dev-lab-7iGKi`
**Audit Date**: 2026-02-12

---

## TABLE OF CONTENTS

- [A. CHAT → DATA FLOW](#a-chat--data-flow)
- [B. SUPABASE → DRAWER](#b-supabase--drawer)
- [C. PAGE LOAD / REFRESH](#c-page-load--refresh)
- [D. WORD EXPORT](#d-word-export)
- [E. FIELD MISMATCH ANALYSIS](#e-field-mismatch-analysis--root-cause-of-bugs)
- [DATA FLOW DIAGRAM](#data-flow-diagram)
- [COMPLETE BUG LIST](#complete-bug-list)
- [RECOMMENDED FIXES](#recommended-fixes)

---

## A. CHAT → DATA FLOW

### A1. `sendMsg()` — Line 15845

**Function signature**: `async function sendMsg(panel)`

**Payload sent to webhook** (Lines 15991–16044):
```javascript
{
    brand: brand || 'general',
    brand_name: currentBrandName,
    panel: panel,                          // 'assistant' or 'copilot'
    message: text,
    history: recentHistory,                // system msg + last 19 messages
    chat_history: recentHistory,           // duplicate for compatibility
    session_id: currentSessionId,
    project_id: currentProjectId || null,
    chat_id: currentChatId[panel] || null,
    timestamp: new Date().toISOString(),
    is_first_message: previousUserMessages === 1,
    is_existing_conversation: isExistingConversation,
    message_count: previousUserMessages,
    conversation_summary: conversationSummary,
    brand_instruction: '...',              // conversation summary or brand info
    system_context: '...',                 // context string
    report_extraction_mode: panel === 'assistant',
    extraction_instructions: '...'         // JSON format instructions (assistant only)
}
```

**History construction** (Lines 15920–15926):
- System message is always placed first
- Non-system messages: last 19 messages taken
- Total: up to 20 messages (1 system + 19 recent)

**Extraction instructions sent to AI** (Lines 16017–16043):
The AI is instructed to return data in `[REPORT_DATA]...[/REPORT_DATA]` tags with this structure:
```json
{
  "client": { "societe", "contact", "telephone" },
  "site": { "adresse", "ville", "numero_affaire" },
  "systeme": { "type", "modele", "serie", "puissance" },
  "fluide": { "type", "charge_totale" },
  "codes_defaut": [{ "code", "description" }],
  "adressage": [{ "ref_usine", "serie", "adresse", "designation", "commentaire" }],
  "travaux_effectues": [{ "texte" }],
  "mesures": [{ "label", "valeur", "unite" }],
  "technicien": { "nom", "heure_arrivee", "heure_depart" },
  "resultat": { "status", "description" }
}
```

### A2. `[REPORT_DATA]` Parsing — Lines 16082–16126

After the AI response comes back:
1. **Regex extraction** (Line 16083): `aiResponse.match(/\[REPORT_DATA\]([\s\S]*?)\[\/REPORT_DATA\]/)`
2. **JSON.parse** (Line 16086): `JSON.parse(reportDataMatch[1].trim())`
3. **Initialize lastReportData if null** (Lines 16089–16096): Sets brand, brand_key, status='en_cours', date
4. **Detect new fields** if report already completed (Lines 16098–16103)
5. **Merge** (Line 16105): `mergeReportData(lastReportData, extractedData)`
6. **Update drawer** (Line 16108): `updateDrawerPreview(lastReportData)`
7. **Save to Supabase** (Lines 16110–16122): `db.from('projects').update({ extracted_data: lastReportData }).eq('id', currentProjectId)`

### A3. `mergeReportData()` — Line 13257

**Merge strategy**:
- Arrays: **append** new items (no replacement). Special dedup for `codes_defaut` by code.
- Nested objects: **recursive merge**
- Primitives: **only overwrite if target is empty** (first-write-wins)

**⚠️ BUG**: Primitives use first-write-wins (`if (!target[key]) target[key] = value`). This means if the AI sends corrected data for a field that was already set, the correction is IGNORED.

### A4. `triggerExtraction()` — Line 15708

**When called**: Fired **before** the chat webhook response (Line 16050–16052), runs in **parallel** (non-blocking).

**Payload** (Lines 15721–15734):
```javascript
{
    project_id: chatPayload.project_id,
    user_id: currentUserId,
    chat_id: chatPayload.chat_id,
    session_id: chatPayload.session_id,
    brand: chatPayload.brand,
    brand_name: chatPayload.brand_name,
    message: chatPayload.message,
    message_count: allMessages.length,
    panel: 'assistant',
    full_conversation: fullConversation,       // ALL messages, formatted
    current_report_data: lastReportData || {},
    timestamp: new Date().toISOString()
}
```

**`full_conversation` construction** (Lines 15710–15719):
- Takes ALL messages from `chatHistory.assistant`
- Filters to user/assistant messages only
- Strips `[REPORT_DATA]...[/REPORT_DATA]` blocks
- Formats as `TECHNICIEN: ...` / `ASSISTANT: ...`

**Response handling** (Lines 15744–15749):
- If `result.extracted_data` exists → calls `handleExtractionResult(result.extracted_data, result.completion_percentage)`

### A5. `handleExtractionResult()` — Line 15758

1. Initializes `lastReportData` if null (Lines 15762–15769)
2. Calls `smartMergeExtraction(lastReportData, extractedData)` (Line 15771) — **DIFFERENT merge function than chat flow!**
3. Calls `updateDrawerPreview(lastReportData)` (Line 15772)
4. Updates progress bar (Lines 15774–15783)
5. **Saves to Supabase** (Lines 15785–15793): `db.from('projects').update({ extracted_data: lastReportData, completion_percentage: ... })`

### A6. `smartMergeExtraction()` — Line 15796

**Different from `mergeReportData()`!** Key differences:
- Arrays: Uses **deduplication** strategies per field type:
  - `equipements` → deduplicate by `item.id || item.modele`
  - `adressage` → deduplicate by `item.equipement_id || item.adresse`
  - `mesures` → deduplicate by `type|sous_type|equipement_id`
  - `travaux_effectues`, `reserves`, `recommandations`, `travaux_prevoir` → **full replace** (source overwrites target)
- Nested objects: Recursive merge
- Primitives: **Always overwrite** (source wins — opposite of `mergeReportData`!)

**⚠️ BUG**: Two different merge strategies exist for the same data. Chat response uses `mergeReportData` (first-write-wins for primitives), extraction uses `smartMergeExtraction` (last-write-wins). This creates race conditions since both run in parallel.

### A7. ALL places `lastReportData` is SET

| Line | Context | What Happens |
|------|---------|-------------|
| 11176 | Declaration | `let lastReportData = null` |
| 9583 | New project creation (brand page) | Set to `{ brand, brand_key, status: 'en_cours', date }` |
| 10485 | **Project load from Supabase** | `lastReportData = project.extracted_data` |
| 10630 | New project creation (alt path) | Set to `{ brand, brand_key, status: 'en_cours', date }` |
| 10774 | Project close/clear | `lastReportData = null` |
| 10839 | Direct assignment | `lastReportData = data` |
| 13252 | `buildPartialReport()` end | `lastReportData = partialData` |
| 14899–15099 | `updateReportField()` guards | `if (!lastReportData) lastReportData = {}` (6 occurrences) |
| 15763 | `handleExtractionResult()` init | Set to `{ brand, brand_key, status: 'en_cours', date }` |
| 16090 | `sendMsg()` REPORT_DATA parsing | Set to `{ brand: currentBrandName, brand_key, status: 'en_cours', date }` |
| 17574 | Unknown context | `if (!lastReportData) lastReportData = {}` |

### A8. ALL Supabase WRITES to `projects.extracted_data`

| Line | Context | Trigger |
|------|---------|---------|
| 14734 | Manual save (possibly completion) | Saves `lastReportData` |
| 14968 | Another manual save path | Saves `lastReportData` |
| 15080 | `updateReportField()` auto-save (debounced 1500ms) | Saves `lastReportData` + progress |
| 15787 | `handleExtractionResult()` | Saves `lastReportData` + completion_percentage |
| 16113 | `sendMsg()` after REPORT_DATA parse | Saves `lastReportData` |

---

## B. SUPABASE → DRAWER

### B1. `updateDrawerPreview()` — Line 12810

**Triggers** (found in code):
1. After loading project from Supabase (Line 10486)
2. After `handleExtractionResult()` (Line 15772)
3. After `sendMsg()` REPORT_DATA parsing (Line 16108)
4. After `buildPartialReport()` completes (Line 13253)
5. After manual field edits (via `refreshReportPreview()`)

**Data source**: Reads from `lastReportData` passed as parameter (in-memory, NOT from Supabase).

**What it does** (Lines 12810–12861):
1. Hides empty state, shows preview content
2. Calculates completion percentage via `calculateReportCompletion(data)`
3. Updates progress bar
4. **Calls `renderReportPreviewV12(reportData, completionStatus)`** (Line 12847) — this is the ACTIVE renderer
5. Initializes drag-drop, auto-save features
6. Saves initial undo state

### B2. Supabase Realtime Subscription

**⚠️ NONE FOUND**. There are zero Supabase Realtime channel subscriptions in the entire file. No `.subscribe()`, no `.on('postgres_changes', ...)`, no `.channel()` calls.

This means: If the extraction workflow saves data to Supabase from N8N (server-side), the frontend has **NO WAY** to know about it unless it re-fetches on its own.

### B3. `renderReportPreview()` (V1) — Line 13294

**Status**: Still exists but **NOT the active renderer**. `updateDrawerPreview()` calls `renderReportPreviewV12()` at Line 12847.

**Field structure it expects** (from `reportData`):
```
Top-level: reference, type_intervention, date, status, resume, rapport_technicien, remarques, observation_client
client: { societe, contact, telephone, reference }
site: { numero_affaire, adresse, ville }
dates: { debut_date, debut_heure, fin_date, fin_heure }
systeme: { type, modele, serie, puissance, annee_installation, garantie }
fluide: { type, charge_initiale, type_huile, charge_totale }
adressage[]: { ref_usine, serie, adresse, designation, commentaire }
codes_defaut[]: { code, description }
securite: { etat, risques }
mesures[]: { label, valeur, unite }
fonctionnement: { heures_compresseur, nb_demarrages }
travaux_effectues[]: { texte }
travaux_prevoir[]: { texte }
pieces[]: { reference, designation, quantite }
reserves[]: { titre, texte }
resultat: { status, description }
technicien: { nom, entreprise, heure_arrivee, heure_depart, autres }
tests: { pression_test_bar, duree_test_heures, valeur_vacuometre_mbar }
tuyauteries: { longueur_totale_m, denivele_oc_ui_m, appoint_calcule_kg }
electrique: { calibre_disjoncteur, section_cable }
releves_ue: { pd1_bar, ps_bar, ta_celsius, freq_inv1_hz }
releves_ui[]: { ... }
```

### B4. `renderReportPreviewV12()` (ACTIVE) — Line 14138

**Field structure it expects** (from `data`):
```
Top-level: resume, observation_client
intervention: { type_label, type }
client: { societe, contact, telephone }
site: { adresse, ville, numero_affaire }
technicien: { entreprise, nom, heure_arrivee, heure_depart, autres }
equipements[]: { modele, marque, type_ui, role }          ← EXTRACTION FORMAT!
adressage[]: { adresse, equipement_id, ref_usine, modele, model, zone, designation, numero_serie, serie }
fluide_global: { type, charge_usine_kg, charge_totale_site_kg }    ← EXTRACTION FORMAT!
mesures[]: { label, type, valeur, valeur_texte, unite, status }
travaux_effectues[]: { contenu, texte, titre }             ← HANDLES BOTH FORMATS
reserves[]: { titre, description }                         ← EXTRACTION FORMAT!
recommandations[]: { titre, description, texte }
resultat: { status, label, description, conclusion }
signatures: { client, technicien }
```

**⚠️ CRITICAL**: V12 expects `fluide_global` (extraction format) but the chat `[REPORT_DATA]` sends `fluide`. V12 expects `equipements[]` but chat doesn't send `equipements` at all.

### B5. `calculateReportCompletion()` — Line 12864

This function checks field presence for progress percentage. It references a **THIRD set of field names**:

```
Uses: data.type_intervention, data.client?.societe, data.site?.adresse, data.resultat?.status,
      data.systeme?.modele, data.systeme?.type, data.site?.ville, data.travaux_effectues,
      data.dates?.debut_date, data.reference, data.resume, data.client?.contact,
      data.technicien?.nom, data.resultat?.description, data.client?.telephone,
      data.systeme?.serie, data.fluide?.type, data.codes_defaut, data.mesures,
      data.rapport_technicien, data.technicien?.heure_arrivee, data.technicien?.heure_depart,
      data.site?.numero_affaire, data.systeme?.puissance, data.fluide?.charge_totale,
      data.adressage, data.pieces, data.travaux_prevoir, data.reserves, data.remarques
```

**⚠️ BUG**: Checks `data.fluide?.type` and `data.fluide?.charge_totale` (chat format), but V12 renderer expects `data.fluide_global`. So when extraction writes `fluide_global`, progress calculation doesn't see it!

---

## C. PAGE LOAD / REFRESH

### C1. Project Loading Function — Line ~10458

**Supabase query** (Line 10458):
```javascript
.select('id, title, brand, original_brand, status, created_at, updated_at, extracted_data, completion_status')
```

**Does it fetch `extracted_data`?** ✅ YES

**Does it populate `lastReportData`?** ✅ YES (Lines 10483–10488):
```javascript
if (project.extracted_data && Object.keys(project.extracted_data).length > 0) {
    lastReportData = project.extracted_data;
    updateDrawerPreview(lastReportData);
}
```

**Does it call `updateDrawerPreview()`?** ✅ YES (Line 10486)

**⚠️ CONCLUSION**: Data DOES survive a hard refresh. The project load function properly fetches `extracted_data` from Supabase and populates both `lastReportData` and the drawer preview.

**However**, there is a timing issue: `buildPartialReport()` is called from various places (Line 15881 in `sendMsg`, etc.) and it fully **replaces** `lastReportData` at Line 13252 (`lastReportData = partialData`). If `buildPartialReport()` runs before the chat AI response has been parsed, it may overwrite extraction data with text-parsed guesses.

### C2. `buildPartialReport()` — Line 12959

This is a **fallback text parser** that scans chat messages for report-relevant info using regex patterns. It:
1. Looks for `[REPORT_DATA]` blocks in AI messages (Line 13016)
2. Looks for JSON in ```json blocks (Line 13001)
3. Falls back to **text extraction** using regex patterns (Lines 13031+):
   - Detects `type_intervention` from keywords like "dépannage", "mise en service"
   - Detects `client.societe` from patterns like "chez [Name]"
   - Detects `site.adresse` from street patterns
   - Etc.

**⚠️ BUG**: At Line 13252, `lastReportData = partialData`. This does a **full replacement**, not a merge. If called after extraction data has been stored, it replaces all extraction data with the (often incomplete) partial data from text parsing.

### C3. ALL Supabase READS of `projects.extracted_data`

| Line | Context |
|------|---------|
| 10458 | Project load query (`.select('...extracted_data...')`) |
| 10484 | Check if extracted_data exists and has keys |
| 10485 | Assign to `lastReportData` |

Only **ONE read point** — on project load. No periodic polling, no realtime subscription.

---

## D. WORD EXPORT

### D1. Export Flow

1. **Entry point**: `exportReportPDF()` (Line 11258) → calls `exportReport('word')` (Line 11259)
2. **`exportReport(format)`** (Line 11300): calls `collectReportData()` then `generateWord(data)`
3. **`collectReportData()`** (Line 11315):
   - Source: `{ ...lastReportData }` (in-memory copy)
   - Also adds `window.reportPhotos` and signatures from DOM
4. **`generateWord(data)`** (Line 11353): Uses `docx` library to generate .docx

### D2. Data Source

The Word export reads from `lastReportData` (in-memory), NOT from Supabase. This means it exports whatever is in memory at the time of export.

### D3. Field Names Used by `generateWord()` — Lines 11384–12234

**Cover page fields**:
```
data.type_intervention, data.marque, data.equipement?.marque, data.brand
data.client?.nom, data.nom_client, data.client?.societe
data.client?.adresse, data.adresse, data.site?.adresse, data.site?.ville
data.reference, data.numero_rapport, data.date
data.technicien?.nom, data.nom_technicien, data.technician_name
data.technicien?.entreprise, data.entreprise, data.company_name
```

**Content sections**:
```
data.resume
data.site: { numero_affaire, adresse, ville }
data.client: { societe, contact, telephone, reference }
data.dates: { debut_date, debut_heure, fin_date, fin_heure }
data.systeme: { type, modele, serie, puissance, garantie }
data.fluide: { type, charge_initiale, charge_totale, type_huile }
data.adressage[]: uses { adresse || equipement_id || ref_usine, modele || model, zone || designation, numero_serie || serie }
data.codes_defaut[]: { code, description, resolution }
data.securite: { etat, risques }
data.mesures[]: { label, valeur, unite, note }
data.fonctionnement: { heures_compresseur, nb_demarrages }
data.travaux_effectues[]: { texte, status }
data.travaux_prevoir[]: { texte, priorite }
data.pieces[]: { reference, designation, quantite }
data.rapport_technicien
data.remarques
data.tests: { pression_test_bar, duree_test_heures, valeur_vacuometre_mbar }
data.tuyauteries: { longueur_totale_m, denivele_oc_ui_m, appoint_calcule_kg }
data.electrique: { calibre_disjoncteur, section_cable }
data.releves_ue: { pd1_bar, ps_bar, ta_celsius, freq_inv1_hz }
data.releves_ui[]: { nom, temp_soufflage, temp_reprise, delta }
data.cerfa: { fluide_total_charge_kg, fluide_total_recupere_kg, attestation_capacite }
data.reserves[]: { titre, texte, type }
data.resultat: { status, label, description, conclusion }
data.technicien: { nom, entreprise, heure_arrivee, heure_depart, autres }
data.observation_client
data.signatures: { client, technicien, nom_client, nom_technicien }
data.photos[]: { data, caption }
```

**⚠️ BUG**: Word export expects `data.fluide.type` and `data.fluide.charge_totale` but extraction writes `data.fluide_global.type` and `data.fluide_global.charge_totale_site_kg`. Word export expects `data.travaux_effectues[].texte` but extraction writes `data.travaux_effectues[].contenu`.

### D4. `saveReportData()` — Line 16208

Also saves to a separate `reports` table with mapped fields:
```javascript
{
    project_id, user_id,
    status: completion >= 80% ? 'completed' : 'draft',
    title: data.reference,
    report_type: data.type_intervention,
    equipment_brand: data.brand_key,
    equipment_model: data.systeme?.modele,
    equipment_type: data.systeme?.type,
    problem_reported: data.resume,
    problem_identified: data.resultat?.description,
    solution_description: data.rapport_technicien,
    error_codes: data.codes_defaut,
    actions_performed: data.travaux_effectues,
    client_name: data.client?.societe,
    client_address: site.adresse + ville
}
```

---

## E. FIELD MISMATCH ANALYSIS — ROOT CAUSE OF BUGS

### E1. THREE rendering contexts, THREE different expected formats

The app has **THREE** different consumers of report data, each expecting slightly different field names:

| Consumer | Renderer | Active? |
|----------|----------|---------|
| V1 Drawer | `renderReportPreview()` (Line 13294) | **NO** — still exists but not called |
| V12 Drawer | `renderReportPreviewV12()` (Line 14138) | **YES** — active renderer |
| Word Export | `generateWord()` (Line 11353) | **YES** |

### E2. TWO data sources writing different formats

| Source | Merge Function | Primitive Strategy | When |
|--------|---------------|-------------------|------|
| Chat `[REPORT_DATA]` | `mergeReportData()` (Line 13257) | First-write-wins | After AI response |
| Extraction workflow | `smartMergeExtraction()` (Line 15796) | Last-write-wins (overwrite) | Parallel, non-blocking |

### E3. COMPREHENSIVE FIELD MISMATCH TABLE

| Data Category | Chat [REPORT_DATA] Field | Extraction (N8N) Field | V12 Drawer Expects | V1 Drawer Expects | Word Export Expects | Match? |
|---------------|-------------------------|----------------------|--------------------|--------------------|--------------------|----|
| **Fluide - container** | `fluide` | `fluide_global` | `fluide_global` | `fluide` | `fluide` | ❌ **MISMATCH** |
| **Fluide - charge field** | `fluide.charge_totale` | `fluide_global.charge_totale_site_kg` | `fluide_global.charge_totale_site_kg` | `fluide.charge_totale` | `fluide.charge_totale` | ❌ **MISMATCH** |
| **Fluide - factory charge** | *(not sent)* | `fluide_global.charge_usine_kg` | `fluide_global.charge_usine_kg` | `fluide.charge_initiale` | `fluide.charge_initiale` | ❌ **MISMATCH** |
| **Equipements** | *(not sent)* | `equipements[].{id, modele, marque, role, type_ui}` | `equipements[].{modele, marque, type_ui, role}` | *(not rendered)* | *(not rendered)* | ⚠️ Chat never sends |
| **Adressage - address** | `adressage[].adresse` | `adressage[].adresse` or `adressage[].equipement_id` | `entry.adresse \|\| entry.equipement_id \|\| entry.ref_usine` | `a.ref_usine` (primary) | `a.adresse \|\| a.equipement_id \|\| a.ref_usine` | ⚠️ Fallbacks exist |
| **Adressage - serial** | `adressage[].serie` | `adressage[].numero_serie` | `entry.numero_serie \|\| entry.serie` | `a.serie` | `a.numero_serie \|\| a.serie` | ⚠️ Fallbacks exist |
| **Adressage - zone** | `adressage[].designation` | `adressage[].designation` | `entry.zone \|\| entry.designation` | `a.designation` | `a.zone \|\| a.designation` | ⚠️ Fallbacks exist |
| **Adressage - model** | *(not in chat instructions)* | `adressage[].modele` | `entry.modele \|\| entry.model` | *(not rendered)* | `a.modele \|\| a.model` | ⚠️ Partial |
| **Travaux - text field** | `travaux_effectues[].texte` | `travaux_effectues[].contenu` or `travaux_effectues[].titre` | `t.contenu \|\| t.texte \|\| t.titre` | `t.texte` | `t.texte` (only!) | ❌ **MISMATCH** |
| **Reserves - text field** | *(not in chat instructions)* | `reserves[].description` | `r.titre \|\| r.description` | `r.texte` | `r.texte` | ❌ **MISMATCH** |
| **Reserves - criticité** | *(not sent)* | `reserves[].criticite` | *(not rendered)* | *(not rendered)* | *(not rendered)* | — |
| **Mesures - label** | `mesures[].label` | `mesures[].type` + `mesures[].sous_type` | `m.label \|\| m.type` | `m.label` | `m.label` | ⚠️ Partial fallback |
| **Mesures - value** | `mesures[].valeur` | `mesures[].valeur` | `m.valeur \|\| m.valeur_texte` | `m.valeur` | `m.valeur` | ✅ |
| **Mesures - equipment_id** | *(not sent)* | `mesures[].equipement_id` | *(not rendered)* | *(not rendered)* | *(not rendered)* | — |
| **Technicien - entreprise** | *(not in chat instructions)* | `technicien.entreprise` | `technicien.entreprise` | `technicien.entreprise` | `technicien.entreprise` | ⚠️ Chat never sends |
| **Résumé** | *(not in chat instructions)* | `resume` | `data.resume` | `data.resume` | `data.resume` | ⚠️ Chat never sends |
| **Intervention type** | *(not in chat instructions)* | *(via intervention.type?)* | `data.intervention.type_label \|\| intervention.type` | `data.type_intervention` | `data.type_intervention` | ❌ **MISMATCH** |
| **System** | `systeme.{type,modele,serie,puissance}` | *(via equipements[])* | *(not rendered as systeme)* | `systeme.{type,modele,serie,...}` | `systeme.{type,modele,serie,...}` | ⚠️ V12 ignores systeme |
| **Client** | `client.{societe,contact,telephone}` | `client.{societe,contact,telephone}` | `client.{societe,contact,telephone}` | `client.{societe,contact,telephone}` | `client.{societe,contact,telephone}` | ✅ |
| **Site** | `site.{adresse,ville,numero_affaire}` | `site.{adresse,ville,code_postal}` | `site.{adresse,ville,numero_affaire}` | `site.{adresse,ville,numero_affaire}` | `site.{adresse,ville}` | ✅ (mostly) |
| **Resultat** | `resultat.{status,description}` | *(not documented)* | `resultat.{status,label,description,conclusion}` | `resultat.{status,description}` | `resultat.{status,label,description,conclusion}` | ✅ (mostly) |

### E4. Smart Merge Dedup Key Mismatches

The `smartMergeExtraction()` function at Line 15796 uses these dedup keys:

| Array | Dedup Key | Problem |
|-------|-----------|---------|
| `equipements` | `item.id \|\| item.modele` | Chat never sends equipements — no conflict |
| `adressage` | `item.equipement_id \|\| item.adresse` | Chat sends `adresse`, extraction sends `equipement_id` — dedup may create duplicates |
| `mesures` | `type\|sous_type\|equipement_id` | Chat sends `label` not `type` — dedup always creates duplicates |

---

## DATA FLOW DIAGRAM

```
┌──────────────────┐
│  User sends msg   │
│  in chat panel    │
└────────┬─────────┘
         │
         ├──────────────────────────────────────────────┐
         │                                              │
         ▼                                              ▼
┌──────────────────┐                          ┌──────────────────────┐
│  sendMsg()       │                          │  triggerExtraction() │
│  → n8n webhook   │                          │  → EXTRACTION_WEBHOOK│
│  (BLOCKING)      │                          │  (NON-BLOCKING)      │
└────────┬─────────┘                          └────────┬─────────────┘
         │                                              │
         ▼                                              ▼
┌──────────────────┐                          ┌──────────────────────┐
│  AI returns      │                          │  N8N returns         │
│  [REPORT_DATA]   │                          │  extracted_data      │
│  JSON block      │                          │  (extraction format) │
└────────┬─────────┘                          └────────┬─────────────┘
         │                                              │
         ▼                                              ▼
┌──────────────────┐                          ┌──────────────────────┐
│ mergeReportData()│                          │ smartMergeExtraction()│
│ FIRST-WRITE-WINS │                          │ LAST-WRITE-WINS     │
│ (primitives)     │                          │ (primitives)         │
└────────┬─────────┘                          └────────┬─────────────┘
         │                                              │
         ├──────────────────────────────────────────────┤
         │                                              │
         ▼                                              ▼
┌──────────────────────────────────────────────────────────┐
│                    lastReportData                         │
│              (in-memory, SHARED STATE)                    │
│  ⚠️ RACE CONDITION: Both flows write to same object      │
│  ⚠️ DIFFERENT FIELD NAMES from each source               │
└────────┬──────────────────────────┬──────────────────────┘
         │                          │
         ▼                          ▼
┌──────────────────┐      ┌──────────────────────┐
│ Supabase Write   │      │ updateDrawerPreview() │
│ projects.        │      │ → renderReportPreviewV12()
│ extracted_data   │      │ → reads from memory   │
└──────────────────┘      └──────────────────────┘
                                    │
                          ┌─────────┴────────┐
                          │                  │
                          ▼                  ▼
                  ┌──────────────┐  ┌──────────────┐
                  │ V12 Drawer   │  │ Word Export   │
                  │ (extraction  │  │ (chat field   │
                  │  field names)│  │  names)       │
                  └──────────────┘  └──────────────┘
```

### Page Load Flow

```
┌──────────────────┐
│  User opens      │
│  project         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Supabase fetch  │
│  projects table  │
│  + extracted_data│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  lastReportData  │    ✅ Data DOES survive refresh
│  = project.      │
│  extracted_data  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ updateDrawerPreview()
│ → renders drawer │
└──────────────────┘
```

---

## COMPLETE BUG LIST

### BUG-001: CRITICAL — Fluide data invisible in V12 drawer

**Severity**: CRITICAL
**Location**: `renderReportPreviewV12()` Line 14257
**Problem**: V12 drawer checks `data.fluide_global` but chat `[REPORT_DATA]` writes `data.fluide`. When report is built from chat responses only, fluide section is **never rendered**.
**Impact**: Fluide type, charge totale — invisible in drawer even though data exists in `lastReportData.fluide`.

### BUG-002: CRITICAL — Fluide data missing from Word export after extraction

**Severity**: CRITICAL
**Location**: `generateWord()` Line 11754
**Problem**: Word export reads `data.fluide.type` and `data.fluide.charge_totale`, but if extraction overwrites with `data.fluide_global`, the `data.fluide` fields become empty. Fluide section is missing from exported Word doc.
**Impact**: No fluide information in exported documents.

### BUG-003: HIGH — Travaux text lost in Word export after extraction

**Severity**: HIGH
**Location**: `generateWord()` Line 11849
**Problem**: Word export filters `t.texte && t.texte.trim()` but extraction writes `contenu` not `texte`. If `smartMergeExtraction` replaces the array (it does — Line 15820: `target[key] = sourceVal`), the `texte` field is gone, only `contenu` remains.
**Impact**: Travaux effectués section empty in Word export.

### BUG-004: HIGH — Réserves text lost in Word export after extraction

**Severity**: HIGH
**Location**: `generateWord()` Line 11990
**Problem**: Word export reads `r.texte` but extraction writes `r.description`. After `smartMergeExtraction` replaces the reserves array, Word export sees empty `texte` fields.
**Impact**: Reserves empty in Word export.

### BUG-005: HIGH — Race condition between chat and extraction merge

**Severity**: HIGH
**Location**: Lines 16050, 16105
**Problem**: `triggerExtraction()` and `sendMsg()` webhook both run in parallel. Both write to `lastReportData` when they return. `mergeReportData()` uses first-write-wins for primitives while `smartMergeExtraction()` uses last-write-wins. Whichever finishes last may overwrite the other's data with conflicting field names.
**Impact**: Unpredictable data loss, especially for primitives like client name, site address.

### BUG-006: HIGH — `buildPartialReport()` overwrites extraction data

**Severity**: HIGH
**Location**: Line 13252
**Problem**: `buildPartialReport()` does `lastReportData = partialData` — a **full replacement**. It starts from `lastReportData ? { ...lastReportData }` (shallow copy) but any nested objects are shared references. The bigger issue is that `buildPartialReport` is called early (Line 15881) during `sendMsg()`, before the AI response. At that point, it shallow-copies whatever is in `lastReportData` and then scans text for regex matches, potentially adding incorrect guesses.
**Impact**: Can replace extraction-quality data with text-parsed guesses.

### BUG-007: MEDIUM — Mesures dedup creates duplicates between chat and extraction

**Severity**: MEDIUM
**Location**: `smartMergeExtraction()` Line 15812
**Problem**: Mesures dedup key is `type|sous_type|equipement_id` but chat sends `label` not `type`. Same measurement sent by chat (with `label`) and extraction (with `type`) won't be recognized as duplicates.
**Impact**: Duplicate measurements in drawer and export.

### BUG-008: MEDIUM — Progress calculation uses V1 field names

**Severity**: MEDIUM
**Location**: `calculateReportCompletion()` Lines 12908–12918
**Problem**: Progress checks `data.fluide?.type` and `data.fluide?.charge_totale` but extraction writes to `data.fluide_global`. Progress also checks `data.systeme?.modele` but extraction may write to `data.equipements[].modele` instead.
**Impact**: Progress bar underreports completion. A report may have 80% of fields filled (in extraction format) but show 40% because progress calculator doesn't see them.

### BUG-009: MEDIUM — V12 drawer ignores `systeme` object entirely

**Severity**: MEDIUM
**Location**: `renderReportPreviewV12()` Line 14138
**Problem**: V12 drawer renders `equipements[]` array (extraction format) but never renders the `systeme` object (chat format). Chat sends `systeme: { type, modele, serie, puissance }` — all invisible in V12 drawer.
**Impact**: System type, model, serial number invisible in drawer when data comes from chat.

### BUG-010: MEDIUM — V12 drawer `intervention.type` vs `type_intervention`

**Severity**: MEDIUM
**Location**: `renderReportPreviewV12()` Line 14162
**Problem**: V12 checks `data.intervention?.type_label` and `data.intervention?.type` but chat/V1 format uses `data.type_intervention`. Different key path entirely.
**Impact**: Intervention type not shown in V12 drawer title when coming from chat data.

### BUG-011: LOW — No Supabase Realtime subscription

**Severity**: LOW (informational)
**Location**: Entire file
**Problem**: No Realtime subscription means if N8N saves extraction results directly to Supabase (bypassing the frontend), the drawer won't update until next page load.
**Impact**: If extraction workflow saves directly to DB (not via frontend response), user sees stale data.

### BUG-012: LOW — `mergeReportData()` first-write-wins prevents corrections

**Severity**: LOW
**Location**: Line 13285
**Problem**: For primitives: `if (!target[key]) target[key] = value`. If the AI sends a corrected value in a later message, the correction is silently ignored because the field already has a value.
**Impact**: Typos/errors in first extraction can never be corrected by subsequent AI messages.

### BUG-013: LOW — Dual Supabase writes (race)

**Severity**: LOW
**Location**: Lines 15787 and 16113
**Problem**: Both `handleExtractionResult()` and `sendMsg()` REPORT_DATA parsing save to `projects.extracted_data`. Since they run in parallel, the second write may overwrite the first with stale data.
**Impact**: Data loss possible if extraction response arrives between chat parse and chat save.

---

## RECOMMENDED FIXES

### FIX-001: Normalize field names (Fixes BUG-001, BUG-002, BUG-003, BUG-004, BUG-008, BUG-009, BUG-010)

**Priority**: CRITICAL
**Approach**: Create a single `normalizeReportData(data)` function that maps between extraction format and the unified internal format. Call it:
- After parsing `[REPORT_DATA]` from chat (Line 16086)
- After receiving extraction result (Line 15748)
- After loading from Supabase (Line 10485)

**Mapping needed**:
```javascript
function normalizeReportData(data) {
    // fluide_global → fluide (or vice versa — pick ONE)
    if (data.fluide_global && !data.fluide) {
        data.fluide = {
            type: data.fluide_global.type,
            charge_initiale: data.fluide_global.charge_usine_kg,
            charge_totale: data.fluide_global.charge_totale_site_kg
        };
    }

    // travaux_effectues[].contenu → texte
    if (data.travaux_effectues) {
        data.travaux_effectues.forEach(t => {
            if (t.contenu && !t.texte) t.texte = t.contenu;
            if (t.texte && !t.contenu) t.contenu = t.texte;
        });
    }

    // reserves[].description → texte
    if (data.reserves) {
        data.reserves.forEach(r => {
            if (r.description && !r.texte) r.texte = r.description;
            if (r.texte && !r.description) r.description = r.texte;
        });
    }

    // intervention.type → type_intervention
    if (data.intervention?.type && !data.type_intervention) {
        data.type_intervention = data.intervention.type_label || data.intervention.type;
    }

    // equipements → systeme (first equipment as system)
    if (data.equipements?.length > 0 && !data.systeme?.modele) {
        const main = data.equipements[0];
        data.systeme = data.systeme || {};
        data.systeme.modele = data.systeme.modele || main.modele;
        data.systeme.type = data.systeme.type || main.type_ui;
    }

    // mesures[].type → label
    if (data.mesures) {
        data.mesures.forEach(m => {
            if (m.type && !m.label) m.label = m.type;
            if (m.label && !m.type) m.type = m.label;
        });
    }

    return data;
}
```

### FIX-002: Unify merge functions (Fixes BUG-005, BUG-012)

**Priority**: HIGH
**Approach**: Replace both `mergeReportData()` and `smartMergeExtraction()` with a single `unifiedMerge()` function that uses **last-write-wins for all primitives** (corrections should always apply) and deduplication for arrays.

### FIX-003: Prevent `buildPartialReport()` from replacing data (Fixes BUG-006)

**Priority**: HIGH
**Approach**: Change Line 13252 from `lastReportData = partialData` to use the unified merge function: `unifiedMerge(lastReportData, partialData)`. Or better yet, only call `buildPartialReport()` when `lastReportData` is null/empty.

### FIX-004: Debounce/sequence Supabase writes (Fixes BUG-013)

**Priority**: MEDIUM
**Approach**: Use a single debounced save function that both chat and extraction flows call, ensuring only the latest data is saved after both flows complete.

### FIX-005: Add Supabase Realtime subscription (Fixes BUG-011)

**Priority**: LOW (only needed if N8N writes directly to Supabase)
**Approach**: Add a Realtime subscription on `projects.extracted_data` changes, calling `updateDrawerPreview()` when updates are detected.

---

## SUMMARY

The root cause of most display bugs is **field name inconsistency between three data sources** (chat, extraction, and legacy V1 format) combined with **two different merge strategies** running in parallel on shared mutable state. The V12 drawer was built to consume extraction-format data, but chat data still uses V1 field names. The Word export uses yet another mix of both formats.

**Critical path to fix**: Implement `normalizeReportData()` (FIX-001) — this single change would resolve 7 of the 13 identified bugs.
