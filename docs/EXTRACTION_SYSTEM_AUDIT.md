# AUDIT RESULTS - 2026-01-20

## FixAIR Report Extraction System - Complete Analysis

**FILE:** `/technician/index.html` (branch: `claude/dev-lab-7iGKi`)
**FILE SIZE:** 16,138 lines

---

## 1. FRONTEND FUNCTIONS FOUND

### Report Functions

| Function | Line # | Purpose |
|----------|--------|---------|
| `renderReport(data)` | 9154 | Renders beautiful report template from JSON data |
| `saveReport(reportContent)` | 12178 | Saves final report to `reports` table (text only) |
| `buildPartialReport()` | 10234 | Extracts data from chat history as fallback |
| `mergeReportData(target, source)` | 10482 | Merges extracted JSON into existing report data |
| `updateDrawerPreview(data)` | 10096 | Updates drawer with report data |
| `renderReportPreview(data, status)` | 10519 | Generates editable drawer HTML |
| `calculateReportCompletion(data)` | 10139 | Calculates % completion for manager |
| `updateReportField(path, value)` | 11250 | Updates single field in lastReportData |
| `refreshReportPreview()` | 11336 | Re-renders drawer after edit |
| `initEditableReport()` | 11414 | Attaches event listeners to editable fields |
| `openReport()` | 8058 | Opens drawer panel |
| `closeReport()` | 8066 | Closes drawer panel |
| `shareReport()` | 9510 | Share functionality |
| `exportReportPDF()` | 9570 | PDF export |
| `addPhotoToReport(msgId, panel)` | 13364 | Adds photo to report |

### Key Variables

| Variable | Line # | Purpose |
|----------|--------|---------|
| `lastReportData` | 9493 | Global object holding current report data (IN MEMORY ONLY) |

---

## 2. DATA FLOW ANALYSIS

### 2.1 [REPORT_DATA] Extraction Locations

| Location | Line # | Context | What Happens After |
|----------|--------|---------|-------------------|
| Live AI Response | 12106 | `sendMsg()` function | Parsed → `mergeReportData()` → `updateDrawerPreview()` |
| DB Load (loadProject) | 8958 | Loading saved messages | Parsed → `lastReportData = reportData` → `updateDrawerPreview()` |
| DB Load (switchMode) | 7965 | Switching chat mode | Parsed → `lastReportData = reportData` → `updateDrawerPreview()` |
| parseMarkdown() | 11425 | Rendering messages | Parsed → `renderReport()` (visual only) |
| buildPartialReport() | 10291 | Fallback extraction | Parsed → `mergeReportData()` |

### 2.2 Complete Live Response Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: User sends message                                          │
│   sendMsg() [line 11894]                                            │
│   → fetch(webhookUrl) [line 12081]                                  │
└────────────────────────────────────────────────────────────────────┬┘
                                                                     │
┌────────────────────────────────────────────────────────────────────▼┐
│ STEP 2: n8n AI processes and returns                                │
│   aiResponse = data.response [line 12102]                           │
│   Format: "Text...\n[REPORT_DATA]{...json...}[/REPORT_DATA]"        │
└────────────────────────────────────────────────────────────────────┬┘
                                                                     │
┌────────────────────────────────────────────────────────────────────▼┐
│ STEP 3: Extract REPORT_DATA [lines 12104-12127]                     │
│   regex: /\[REPORT_DATA\]([\s\S]*?)\[\/REPORT_DATA\]/               │
│   extractedData = JSON.parse(match[1])                              │
│   mergeReportData(lastReportData, extractedData) [line 12120]       │
│   updateDrawerPreview(lastReportData) [line 12123]                  │
│   ✅ DRAWER UPDATED REAL-TIME                                        │
└────────────────────────────────────────────────────────────────────┬┘
                                                                     │
┌────────────────────────────────────────────────────────────────────▼┐
│ STEP 4: Strip for display [line 12134]                              │
│   cleanResponse = aiResponse.replace(/\[REPORT_DATA\]..., '')       │
│   parsedResponse = parseMarkdown(cleanResponse) [line 12135]        │
│   addMsg(panel, 'ai', parsedResponse) [line 12141]                  │
│   ✅ CLEAN MESSAGE DISPLAYED                                         │
└────────────────────────────────────────────────────────────────────┬┘
                                                                     │
┌────────────────────────────────────────────────────────────────────▼┐
│ STEP 5: Save to Supabase [line 12149]                               │
│   saveMessage(chatId, 'assistant', aiResponse, ...)                 │
│                                                                     │
│   ⚠️ SAVES ORIGINAL aiResponse WITH [REPORT_DATA] BLOCK            │
│   ⚠️ BUT ONLY TO messages.content AS TEXT                          │
│   ❌ NO extracted_data COLUMN SAVED                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 Supabase Save Analysis

#### saveMessage() [Line 8335-8363]

```javascript
async function saveMessage(chatId, role, content, contentType = 'text', thoughtProcess = null, thoughtSummary = null) {
    const { data, error } = await db
        .from('messages')
        .insert({
            chat_id: chatId,
            role: role,
            content: content,              // ← FULL TEXT WITH [REPORT_DATA] BLOCK
            content_type: contentType,
            thought_process: thoughtProcess,
            thought_summary: thoughtSummary
        })
        // ...
}
```

**What's saved:**
- `chat_id` - Link to chat
- `role` - 'user' or 'assistant'
- `content` - FULL message text INCLUDING `[REPORT_DATA]` block
- `content_type` - 'text', 'image', 'ocr'
- `thought_process` - TP steps JSON
- `thought_summary` - TP summary

**What's NOT saved:**
- ❌ No `extracted_data` column
- ❌ No parsed JSON structure
- ❌ No separate report fields

#### saveReport() [Line 12178-12206]

```javascript
async function saveReport(reportContent) {
    await db.from('reports').insert({
        project_id: currentProjectId,
        user_id: currentUserId,
        report_type: '...',
        title: 'Rapport d\'intervention',
        status: 'completed',
        solution_description: reportContent  // ← FULL TEXT, NOT STRUCTURED
    })
}
```

**Only called when:** `aiResponse.includes('RAPPORT D\'INTERVENTION')` [line 12152]

### 2.4 Database Load Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: Load project [loadProject() line 8757]                      │
│   db.from('projects').select('id, title, brand, ...')               │
│   ❌ NO extracted_data LOADED                                        │
└────────────────────────────────────────────────────────────────────┬┘
                                                                     │
┌────────────────────────────────────────────────────────────────────▼┐
│ STEP 2: Load messages [lines 8900-8904]                             │
│   db.from('messages').select('*').eq('chat_id', chatId)             │
└────────────────────────────────────────────────────────────────────┬┘
                                                                     │
┌────────────────────────────────────────────────────────────────────▼┐
│ STEP 3: Process each AI message [lines 8955-8974]                   │
│   if (msg.content.includes('[REPORT_DATA]')) {                      │
│       const reportDataMatch = msg.content.match(regex);             │
│       const reportData = JSON.parse(reportDataMatch[1]);            │
│       lastReportData = reportData;                                  │
│       updateDrawerPreview(reportData);                              │
│   }                                                                 │
│   ✅ DRAWER RESTORED FROM MESSAGE CONTENT                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.5 Drawer Update Function [Line 10096-10136]

**Function:** `updateDrawerPreview(data)`

**What it does:**
1. Takes JSON data object
2. Calculates completion % via `calculateReportCompletion()`
3. Generates HTML via `renderReportPreview(data, completionStatus)`
4. Updates `#reportPreviewContent` DOM
5. Attaches edit listeners via `initEditableReport()`

**Fields it can display (from renderReportPreview):**

| Category | Fields |
|----------|--------|
| Meta | `status`, `reference`, `type_intervention`, `date` |
| Resume | `resume` |
| Site | `numero_affaire`, `adresse`, `ville` |
| Client | `societe`, `contact`, `telephone`, `reference` |
| Dates | `debut_date`, `debut_heure`, `fin_date`, `fin_heure` |
| Systeme | `type`, `modele`, `serie`, `puissance`, `annee_installation`, `garantie` |
| Fluide | `type`, `charge_initiale`, `type_huile`, `charge_totale` |
| Adressage | Array of `{ref_usine, serie, adresse, designation, commentaire}` |
| Codes Defaut | Array of `{code, description}` |
| Securite | `etat`, `risques` |
| Mesures | Array of `{label, valeur, unite}` |
| Fonctionnement | `heures_compresseur`, `nb_demarrages` |
| Travaux Effectues | Array of `{texte}` |
| Travaux Prevoir | Array of `{texte, priorite}` |
| Pieces | Array of `{designation, reference, quantite}` |
| Rapport Technicien | `rapport_technicien` |
| Remarques | `remarques` |
| Reserves | Array of `{texte}` |
| Resultat | `status`, `description` |
| Technicien | `nom`, `entreprise`, `heure_arrivee`, `heure_depart`, `autres` |
| Observation Client | `observation_client` |
| Tests | `pression_test_bar`, `duree_test_heures`, `valeur_vacuometre_mbar` |
| Tuyauteries | `longueur_totale_m`, `denivele_oc_ui_m`, `appoint_calcule_kg` |
| Electrique | `calibre_disjoncteur`, `section_cable` |
| Releves UE | `pd1_bar`, `ps_bar`, `ta_celsius`, `freq_inv1_hz` |
| Releves UI | Array of `{adresse, tc_celsius, ta_celsius}` |
| CERFA | `fluide_total_charge_kg`, `fluide_total_recupere_kg`, `attestation_capacite` |
| Garantie | `fin_garantie_pieces`, `fin_garantie_compresseur` |
| Hydraulique | `volume_eau_litres`, `debit_m3h`, `type_antigel` |
| Checklist | Various boolean flags |
| Preconisations | Various boolean flags |
| EHS | `acces_securise`, `numero_urgence`, `risques_specifiques[]` |
| Signatures | `signature_client`, `signature_technicien` |

---

## 3. IDENTIFIED ISSUES

### CRITICAL ISSUE #1: No Persistent Storage of Extracted Data

| Issue | Location | Impact |
|-------|----------|--------|
| `lastReportData` is IN-MEMORY ONLY | Line 9493 | Data lost on page refresh if messages don't have REPORT_DATA |
| No `extracted_data` column in projects table | - | Manager can't query structured data |
| No `extracted_data` column in messages table | - | Can't track extraction per message |

**Current workaround:** Data is reconstructed by re-parsing `[REPORT_DATA]` blocks from `messages.content` on every load (lines 7963-7969, 8956-8962).

### CRITICAL ISSUE #2: Extraction Only Works With [REPORT_DATA] Wrapper

| Issue | Location | Impact |
|-------|----------|--------|
| Extraction regex requires exact format | Lines 12106, 7965, 8958 | If AI doesn't wrap in [REPORT_DATA], extraction fails |
| No fallback for raw JSON | - | JSON without wrapper shows as raw text |

### CRITICAL ISSUE #3: saveReport() Only Saves Text

| Issue | Location | Impact |
|-------|----------|--------|
| `saveReport()` saves full text to `solution_description` | Line 12190 | No structured data in `reports` table |
| Only triggered for final reports | Line 12152 | Partial data never saved to reports |

### CRITICAL ISSUE #4: No Real-Time Sync to Supabase

| Issue | Location | Impact |
|-------|----------|--------|
| Drawer edits only update `lastReportData` | Line 11254 | Manual edits not persisted |
| No auto-save on field change | - | Edits lost on page refresh |
| No `updateProject()` with extracted_data | - | Manager never sees live data |

---

## 4. DATA FLOW TRACE - Single Field Example

**Scenario:** User says "Le client c'est Auchan"

| Step | Location | Data State |
|------|----------|------------|
| 1 | User types message | `"Le client c'est Auchan"` |
| 2 | Frontend sends to n8n | `{message: "Le client c'est Auchan", ...}` |
| 3 | n8n AI processes | Returns: `"Parfait!\n[REPORT_DATA]{"client":{"societe":"Auchan"}}[/REPORT_DATA]"` |
| 4 | Frontend extracts [12106] | `extractedData = {client: {societe: "Auchan"}}` |
| 5 | Merge [12120] | `lastReportData.client.societe = "Auchan"` |
| 6 | Update drawer [12123] | Drawer shows "Société: Auchan" |
| 7 | Save message [12149] | `messages.content = "Parfait!\n[REPORT_DATA]..."` (full text) |
| 8 | ❌ NO structured save | No `projects.extracted_data` update |
| 9 | Page refresh | `lastReportData = null` |
| 10 | Load project [8757] | Load messages from DB |
| 11 | Re-extract [8958] | Parse REPORT_DATA from message content |
| 12 | Restore drawer | Drawer shows "Société: Auchan" again |

**Key Finding:** Data IS preserved, but only as text inside `messages.content`. It must be re-parsed on every load.

---

## 5. FIELD MAPPING VERIFICATION

### AI Prompt Extraction Fields vs Frontend Support

| Category | AI Extracts | Stored in DB? | Displayed in Drawer? |
|----------|-------------|---------------|---------------------|
| client.societe | ✓ | ✓ (in message text) | ✓ Line 10672 |
| client.contact | ✓ | ✓ (in message text) | ✓ Line 10673 |
| client.telephone | ✓ | ✓ (in message text) | ✓ Line 10674 |
| client.reference | ✓ | ✓ (in message text) | ✓ Line 10675 |
| site.adresse | ✓ | ✓ (in message text) | ✓ Line 10666 |
| site.ville | ✓ | ✓ (in message text) | ✓ Line 10667 |
| site.numero_affaire | ✓ | ✓ (in message text) | ✓ Line 10665 |
| systeme.type | ✓ | ✓ (in message text) | ✓ Line 10700 |
| systeme.modele | ✓ | ✓ (in message text) | ✓ Line 10701 |
| systeme.serie | ✓ | ✓ (in message text) | ✓ Line 10702 |
| fluide.type | ✓ | ✓ (in message text) | ✓ Line 10715 |
| fluide.charge_initiale | ✓ | ✓ (in message text) | ✓ Line 10716 |
| fluide.charge_totale | ✓ | ✓ (in message text) | ✓ Line 10720 |
| adressage[] | ✓ | ✓ (in message text) | ✓ Lines 10740-10763 |
| codes_defaut[] | ✓ | ✓ (in message text) | ✓ Lines 10769-10780 |
| travaux_effectues[] | ✓ | ✓ (in message text) | ✓ Lines 10829-10842 |
| travaux_prevoir[] | ✓ | ✓ (in message text) | ✓ Lines 10847-10860 |
| mesures[] | ✓ | ✓ (in message text) | ✓ Lines 10797-10810 |
| reserves[] | ✓ | ✓ (in message text) | ✓ Lines 10898-10912 |
| resultat.status | ✓ | ✓ (in message text) | ✓ Line 10921 |
| resultat.description | ✓ | ✓ (in message text) | ✓ Line 10925 |
| technicien.nom | ✓ | ✓ (in message text) | ✓ Line 10976 |
| technicien.heure_arrivee | ✓ | ✓ (in message text) | ✓ Line 10980 |
| technicien.heure_depart | ✓ | ✓ (in message text) | ✓ Line 10981 |
| remarques | ✓ | ✓ (in message text) | ✓ Line 10891 |
| cerfa.* | ✓ | ✓ (in message text) | ✓ Lines 11086-11099 |
| tests.* | ✓ | ✓ (in message text) | ✓ Lines 11000-11012 |
| electrique.* | ✓ | ✓ (in message text) | ✓ Lines 11034-11044 |
| releves_ue.* | ✓ | ✓ (in message text) | ✓ Lines 11048-11062 |
| releves_ui[] | ✓ | ✓ (in message text) | ✓ Lines 11066-11082 |

**Summary:** ALL fields are supported in the drawer UI. The issue is NOT missing fields, but missing PERSISTENT STRUCTURED STORAGE.

---

## 6. RECOMMENDED FIXES (DO NOT IMPLEMENT)

### Fix #1: Add `extracted_data` Column to Projects Table

**Location:** Supabase schema
**Change needed:**
```sql
ALTER TABLE projects ADD COLUMN extracted_data JSONB DEFAULT '{}';
```

### Fix #2: Save Extracted Data to Projects Table

**File:** `/technician/index.html`
**Line:** After 12123 (after `updateDrawerPreview`)
**Change needed:**
```javascript
// After line 12123: updateDrawerPreview(lastReportData);
// Add:
if (currentProjectId && lastReportData) {
    await db.from('projects')
        .update({ extracted_data: lastReportData })
        .eq('id', currentProjectId);
}
```

### Fix #3: Load `extracted_data` on Project Load

**File:** `/technician/index.html`
**Line:** 8814 (project select)
**Change needed:**
```javascript
// Change from:
.select('id, title, brand, original_brand, status, created_at, updated_at')
// To:
.select('id, title, brand, original_brand, status, created_at, updated_at, extracted_data')

// Then after line 8836, add:
if (project.extracted_data) {
    lastReportData = project.extracted_data;
    updateDrawerPreview(lastReportData);
}
```

### Fix #4: Auto-Save on Drawer Field Edit

**File:** `/technician/index.html`
**Line:** After 11268 (in `updateReportField`)
**Change needed:**
```javascript
// Add debounced save after field update
if (currentProjectId && lastReportData) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        await db.from('projects')
            .update({ extracted_data: lastReportData })
            .eq('id', currentProjectId);
    }, 1000);
}
```

### Fix #5: Embedded JSON Regex for Fallback

**File:** `/technician/index.html`
**Line:** 11509
**Change needed:**
```javascript
// Change from:
const embeddedJsonMatch = trimmed.match(/^([\s\S]*?)\s*(\{[\s\S]*"type"\s*:\s*"report"[\s\S]*\})\s*$/);
// To:
const embeddedJsonMatch = trimmed.match(/^([\s\S]*?)\s*(\{[\s\S]*(?:"client"|"resultat"|"resume"|"travaux_effectues"|"type"\s*:\s*"report")[\s\S]*\})\s*$/);
```

---

## 7. ANSWERS TO SUCCESS CRITERIA

| Question | Answer |
|----------|--------|
| 1. Where is `[REPORT_DATA]` parsed? | Lines 12106, 7965, 8958, 11425, 10291 |
| 2. What happens to parsed JSON? | Merged into `lastReportData` (memory), displayed in drawer, NOT saved to separate column |
| 3. Which Supabase table/column stores data? | `messages.content` (as text with [REPORT_DATA] wrapper) |
| 4. Saved on EVERY message or final? | Every AI message saves full text; `reports` table only on final |
| 5. Can Manager access data? | Only by re-parsing messages.content; no direct JSONB query |
| 6. Which fields extracted/saved/displayed? | All 100+ fields supported; all saved as text; all displayed |
| 7. Gap between extraction and UI? | No gap for display; Gap is in PERSISTENT STRUCTURED STORAGE |

---

## 8. CONCLUSION

The FixAIR extraction system **WORKS CORRECTLY** for:
- ✅ Real-time extraction from AI responses
- ✅ Real-time drawer updates
- ✅ Message persistence (with REPORT_DATA in text)
- ✅ Drawer restoration on page load (by re-parsing)

The system **FAILS** for:
- ❌ Direct JSONB queries (Manager can't query structured data)
- ❌ Efficient data access (must re-parse on every load)
- ❌ Drawer edit persistence (manual edits lost)
- ❌ Cross-table data consistency (reports table has text only)

**ROOT CAUSE:** The extracted JSON is stored INSIDE message content as text, not in a dedicated JSONB column. This design works for the technician app but fails for manager queries and analytics.
