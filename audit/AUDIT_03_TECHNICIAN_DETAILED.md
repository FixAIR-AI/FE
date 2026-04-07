# AUDIT_03 - Technician App Detailed Audit

## File: technician/index.html
**Lines:** 21,489
**Size:** 1,081,799 bytes (1.03 MB)
**Title:** "FixAIR Technician"

---

## Section Map

| Section | Lines | Content |
|---------|-------|---------|
| `<head>` + CSS | 1-5650 | All styles inline |
| SVG Icons sprite | ~5100-5570 | SVG symbol definitions |
| CDN Scripts | 5651-5660 | External library loading |
| Modal HTML | 5670-5740 | Upgrade, invite, referral modals |
| Login HTML | 5750-5830 | Login screen |
| Main App HTML | 5830-6560 | App shell, nav, panels, drawer |
| **`<script>`** | **6580-21489** | **All JavaScript** |
| - Constants/Detection | 6580-6700 | PRODUCTION_MODE, device detection, theme vars |
| - i18n/Translations | 6700-6970 | FR/EN translation system |
| - Onboarding | 6970-7070 | 4-step onboarding wizard |
| - Supabase Init | 7070-7240 | DB client, auth tokens |
| - Auth Helpers | 7240-7330 | Magic link, hash parsing |
| - UI Utilities | 7330-7770 | Toast, report locking, completion popup, field detection |
| - API/Config | 7770-7830 | API base, user vars, colors, API key caching |
| - Router | 7827-7970 | URL-based navigation (SPA router) |
| - Init | 7969-8025 | Main init() function |
| - Login System | 8026-8260 | Login wizard, password reset |
| - User Dashboard | 8266-8370 | Post-login setup |
| - Live Status | 8365-8455 | Online/offline status tracking |
| - Profile | 8454-8610 | Profile viewing/editing |
| - Brand Selection | 8608-8970 | Brand picker, inline select |
| - Onboarding Logic | 8736-9030 | Onboarding flow functions |
| - Navigation | 9035-9060 | Page/brand navigation |
| - Chat Brand | 9060-9240 | Per-panel brand selection |
| - Chat Open/Close | 9242-9400 | Chat panel management |
| - Mode Toggle | 9401-9600 | Copilot/assistant mode switching |
| - Report View | 9594-9620 | Report panel open/close |
| - Message Display | 9620-9670 | addMsg() - render messages |
| - Voice Input | 9655-9670 | Audio recording config |
| - Chat Input | 9670-9765 | Input handling, keydown |
| - Webhook Config | 9759-9770 | n8n webhook URLs |
| - Session/Auth | 9776-9840 | Session IDs, user ID |
| - Project CRUD | 9842-10040 | ensureProject, create, load, list |
| - Project UI | 10041-10320 | Project cards, context menu, rename, delete |
| - Load Project | 10320-10660 | loadProject() - THE BIG FUNCTION |
| - Chat Header | 10657-10680 | Update chat header UI |
| - New Project | 10680-10757 | startNewProject(), brand UI |
| - Report Render | 10757-11096 | renderReport() - main report rendering |
| - Report Actions | 11096-11280 | Share, export menu, export report |
| - Word Export | 11282-12218 | generateWord() - Word document generation |
| - PDF Export | 12218-12740 | generatePDF() - PDF generation |
| - Drawer Preview | 12739-12900 | updateDrawerPreview(), calculateReportCompletion() |
| - Build Report | 12897-13277 | buildPartialReport() - construct report from data |
| - Normalize | 13277-13550 | normalizeMesureLabel(), normalizeReportData() |
| - Merge System | 13550-13730 | unifiedMerge(), deduplicateArray(), mergeReportData() |
| - Render Preview | 13730-14460 | renderReportPreview() - drawer template |
| - Drawer State | 14460-14575 | Undo/redo, auto-save, keyboard shortcuts |
| - Drawer V12 | 14574-14970 | V12 drawer features, floating toolbar |
| - Drawer Auto-Save | 14970-15420 | drawerAutoSave, drawerExtractDataFromDOM |
| - Report Photo Add | 15420-15700 | Add photos to report |
| - Extraction | 15700-16030 | triggerExtraction() via webhook |
| - Thought Process | 16029-16100 | ThoughtProcessManager class |
| - sendMsg | 16100-16500 | THE MAIN FUNCTION - send message to AI |
| - AI Response | 16500-16600 | [REPORT_DATA] parsing, merge, save |
| - Report DB | 16596-16670 | Report generation tracking |
| - Voice Recording | 16670-16840 | Start/stop recording, waveform |
| - ElevenLabs STT | 16840-16960 | transcribeWithElevenLabs() |
| - Voice Utilities | 16960-17100 | Timer, waveform animation |
| - Voice Transcription | 17100-17220 | processTranscription() |
| - Photo OCR | 17220-17400 | OCR processing via webhook |
| - Photo Capture | 17400-17835 | Camera, file upload, photo management |
| - Signature | 17835-18100 | Canvas-based signature capture |
| - Diagrams | 18100-18350 | Mermaid diagram rendering |
| - Hotline/ElevenLabs | 18350-18547 | Conversational AI hotline |
| - Split View | 18547-18620 | Divider dragging, split layout |
| - Scroll/Touch | 18620-18665 | Touch handling, scroll buttons |
| - Freemium | 18665-19200 | Usage tracking, paywall, upgrade modal |
| - Payment Polling | 19200-19320 | Stripe payment detection |
| - Referral | 19320-19570 | Referral code, sharing, tracking |
| - Gamification | 19570-19960 | Stats, confetti, celebrations |
| - Calendar | 19960-20700 | Full calendar implementation |
| - Connect | 20696-20780 | Connect feature (placeholder) |
| - ThoughtProcess UI | 20780-21415 | Thought process rendering |
| - Global Helpers | 21406-21489 | showThoughtProcess, etc. |

---

## Critical Functions - Detailed Analysis

### Function: sendMsg(panel)
**Line:** ~16100
**Purpose:** Send user message to n8n AI webhook and process response
**Parameters:** `panel` - 'copilot' or 'assistant'
**Async:** Yes
**Complexity:** Very High

**Flow:**
1. Read text from input
2. Check freemium limits (`canSendChat()`)
3. Track chat usage (`trackChatUsage()`)
4. Add user message to UI (`addMsg()`)
5. Save message to Supabase (`saveMessage()`)
6. Build chat history (last 19 messages + 1 system)
7. If assistant mode: call `triggerExtraction()` in parallel
8. Call n8n webhook with full payload
9. Parse response for `[REPORT_DATA]` tags
10. Merge extracted data into `lastReportData`
11. Update drawer preview
12. Save to Supabase
13. Display AI response in chat

**Dependencies:** ensureProject(), saveMessage(), getWebhookUrl(), triggerExtraction(), mergeReportData(), updateDrawerPreview()

### Function: mergeReportData(target, source)
**Line:** 13704
**Purpose:** Deep merge incoming AI data into existing report data
**Strategy:**
- Primitives: LAST-WRITE-WINS (R5 fix)
- Arrays in REPLACE_ARRAYS set: Replace entirely
- Other arrays: Deduplicate and merge
- Objects: Recursive merge
- Null/empty: Skip

### Function: unifiedMerge(target, source) → object
**Line:** 13552
**Purpose:** Immutable version of merge (returns new object)
**Used by:** buildPartialReport and extraction flows

### Function: buildPartialReport()
**Line:** 12897
**Purpose:** Construct complete report from lastReportData + drawer DOM
**Returns:** Complete report data object

### Function: drawerExtractDataFromDOM()
**Line:** ~15000-15400
**Purpose:** Read all contenteditable fields from the drawer DOM and construct a data object
**Returns:** Extracted report data

### Function: loadProject(projectId)
**Line:** 10320
**Purpose:** Load a project from Supabase, restore chat history, update UI
**Complexity:** Very High - ~340 lines

### Function: generateWord(data)
**Line:** 11282
**Purpose:** Generate a .docx Word document from report data
**Dependencies:** docx library, FileSaver.js
**Length:** ~900 lines

### Function: renderReportPreview(data, completionStatus)
**Line:** 13730
**Purpose:** Render the report drawer HTML template
**Length:** ~730 lines of HTML template generation

---

## Supabase Calls Summary

| Operation | Count | Tables |
|-----------|-------|--------|
| SELECT | 28 | users, projects, chats, messages, app_settings, reports, user_actions, calendar_events |
| INSERT | 12 | projects, chats, messages, reports, user_actions, calendar_events |
| UPDATE | 18 | users, projects, reports, calendar_events |
| DELETE | 6 | projects, chats, messages, calendar_events |

---

## Key Data Structures

### lastReportData (the central state object)
```javascript
{
  brand: 'mitsubishi',
  brand_key: 'mitsubishi',
  status: 'en_cours',
  date_intervention: '2026-04-07',
  type_intervention: 'Maintenance préventive',
  client: {
    societe: 'ACME Corp',
    contact: 'Jean Dupont',
    telephone: '0612345678'
  },
  site: {
    adresse: '12 rue de Paris',
    ville: 'Lyon',
    numero_affaire: 'AF-2026-001'
  },
  systeme: {
    type: 'Climatisation',
    modele: 'MSZ-AP35VGK',
    serie: 'SN12345',
    puissance: '3.5 kW'
  },
  fluide: {
    type: 'R32',
    charge_totale: '1.2 kg'
  },
  codes_defaut: [{ code: 'E01', description: 'Capteur température' }],
  adressage: [{ ref_usine: 'UI01', serie: 'SN123', adresse: '1', designation: 'Intérieur', commentaire: '' }],
  travaux_effectues: [{ texte: 'Nettoyage filtres' }],
  mesures: [{ label: 'HP', valeur: '25', unite: 'bar' }],
  technicien: {
    nom: 'Pierre Martin',
    heure_arrivee: '08:00',
    heure_depart: '12:00'
  },
  resultat: {
    status: 'OK',
    description: 'Installation fonctionnelle'
  },
  reserves: [{ texte: 'Filtre à remplacer dans 3 mois' }],
  travaux_prevoir: [{ texte: 'Remplacement compresseur' }],
  pieces: [{ reference: 'FLT-001', designation: 'Filtre CVC', quantite: 2 }]
}
```

### FREEMIUM_CONFIG
```javascript
{
  freeCopilotChats: 20,
  freeReports: 3,
  softLimitWarning: 0.8,
  bufferQueriesOnInvite: 5,
  bufferHoursOnInvite: 24,
  weekFreeDaysOnConvert: 7,
  sprintTarget: 3,
  sprintRewardDays: 60,
  sprintShowAfterDays: 3,
  monthlyPrice: 49,
  storageKey: 'fixair_freemium_usage',
  upgradeUrl: 'https://pay.fixair.ai/b/dRm7sKa3MbPAgxdfgR2VG00',
  proFeatures: ['export_pdf', 'export_word', 'share_report', 'diagrams_advanced']
}
```

---

## Feature Inventory

| # | Feature | Status | Lines (approx) |
|---|---------|--------|----------------|
| 1 | Login/Auth | Complete | 500 |
| 2 | Onboarding | Complete | 400 |
| 3 | Brand Selection | Complete | 300 |
| 4 | Chat (Copilot) | Complete | 800 |
| 5 | Chat (Assistant) | Complete | 800 |
| 6 | Voice Input | Complete | 600 |
| 7 | Report Drawer | Complete | 1200 |
| 8 | Auto-Save | Complete | 300 |
| 9 | Word Export | Complete | 900 |
| 10 | PDF Export | Complete | 500 |
| 11 | Photo Capture | Complete | 400 |
| 12 | OCR | Complete | 200 |
| 13 | Signature | Complete | 300 |
| 14 | Calendar | Complete | 700 |
| 15 | Freemium | Complete | 600 |
| 16 | Referral | Complete | 300 |
| 17 | Gamification | Complete | 400 |
| 18 | Profile | Complete | 200 |
| 19 | Projects List | Complete | 400 |
| 20 | Diagrams | Complete | 250 |
| 21 | Hotline | Partial | 200 |
| 22 | Connect | Placeholder | 100 |
| 23 | Split View | Complete | 100 |
| 24 | Theme (Dark/Light) | Complete | 100 |
| 25 | i18n (FR/EN) | Complete | 200 |
| 26 | Live Status | Complete | 100 |
| 27 | Thought Process | Complete | 300 |
