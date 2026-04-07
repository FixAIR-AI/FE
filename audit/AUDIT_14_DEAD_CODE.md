# AUDIT_14 - Dead Code Analysis

## Methodology
Identified potential dead code by analyzing:
1. Functions defined but never called
2. Variables defined but never read
3. CSS classes defined but never used in HTML
4. Features partially implemented
5. Commented-out code blocks

---

## Potential Dead Code

### DC-001: Operations Realtime Subscriptions Array (Unused)
**File:** operations/index.html:2416
```javascript
let realtimeSubscriptions = [];
```
**Evidence:** Array is declared and cleanup code exists (line 3133-3141), but NO subscriptions are ever pushed to it. Unlike admin/manager which actively subscribe to channels.
**Status:** [DEAD CODE] - Cleanup code without active subscriptions

### DC-002: Operations Placeholder Functions
**File:** operations/index.html:4880-4881, 5591
**Functions:**
- `openTechChat()` → `alert('Chat avec technicien')`
- `callTechnician()` → `alert('Appel technicien')`
- `showCalendar()` → `alert('Calendrier')`
**Status:** [DEAD CODE] - Completely non-functional placeholders wired to UI buttons

### DC-002b: Operations Unused Stats Fields
**File:** operations/index.html:3245
**Description:** Stats object fields `completed`, `avgTime`, `rate` are hardcoded to defaults (`0`, `'-'`, `'-'`) and never computed.
**Status:** [DEAD CODE] - Misleading UI data

### DC-002c: Operations Unfinished New Project Creation
**File:** operations/index.html:5427-5493
**Description:** `openNewProject()` opens a drawer with a form but the "Créer" button has no actual implementation.
**Status:** [PARTIAL IMPLEMENTATION]

### DC-002d: Master App Mock Enterprise Data
**File:** master/index.html:1288-1294
**Description:** `enterpriseData` object with mock data (ClimaFroid Services, ThermoFlex, etc.) defined but never referenced anywhere.
**Status:** [DEAD CODE] - Should be removed

### DC-002e: Manager/Admin Demo Data Objects
**Files:** manager/index.html:2661-2674, admin/index.html:2626-2645
**Description:** Both apps have hardcoded demo `techData` and `projectData` objects with fake technician names (Jean Dupont, Marie Leblanc, Pierre Bernard) and project titles used as fallback when live data is empty.
**Status:** [DEAD CODE in production] - Useful for demo but should be removed or clearly flagged

### DC-002f: Manager/Admin Simulated Voice Transcription
**Files:** manager/index.html:3570, admin/index.html:3510-3524
**Description:** When microphone access is denied or ElevenLabs API fails, the apps return random fake transcriptions like "Le compresseur fait un bruit anormal" instead of showing an error.
**Status:** [DEAD CODE / MISLEADING] - Users think transcription worked when it didn't

### DC-002g: Manager/Admin `extractFromPhoto()` Placeholder
**Files:** manager/index.html:3504, admin/index.html:3376
**Description:** Function shows a mock toast "Extraction en cours..." then "Texte extrait avec succès" but performs no actual OCR.
**Status:** [DEAD CODE] - Button exists in UI but does nothing real

### DC-002h: Manager/Admin `navHomeCal(dir)` Unused Parameter
**Files:** manager/index.html:2702, admin/index.html:2631
**Description:** Calendar navigation function accepts a `dir` parameter but ignores it - just calls `renderHomeCalendar()` without changing dates.
**Status:** [DEAD CODE] - Navigation buttons don't advance the calendar

### DC-003: Connect Feature (Placeholder Implementation)
**File:** technician/index.html:20696-20778
**Functions:** `openConnect()`, `closeConnect()`, `activateConnect()`, `openConnectDrawer()`, `closeConnectDrawer()`, `acceptConnectJob()`
**Evidence:** Functions exist with basic UI toggling but the feature appears to be a placeholder - no real data loading, no Supabase calls, mock data only.
**Status:** [PARTIAL IMPLEMENTATION] - UI exists but backend not connected

### DC-003: Hotline ElevenLabs in Technician (Not Loaded)
**File:** technician/index.html:18347-18348
```javascript
let elevenLabsConversation = null;
let elevenLabsSDKReady = false;
```
**Evidence:** The ElevenLabs SDK `<script type="module">` is loaded in docs/index.html (line 4934-4938) but NOT in technician/index.html. The hotline functions reference `window.ElevenLabsConversation` which would never be available.
**Status:** [DEAD CODE] - SDK not loaded, hotline feature broken in technician app

### DC-004: Onboarding Photos Preview
**File:** technician/index.html:8868-8891
**Function:** `showOnboardingPhotosPreview(files)`
**Evidence:** Creates a UI for photo preview during onboarding, but the onboarding flow appears to use `handleOnboardingAddPhotos()` which may not fully connect to this preview function.
**Status:** [UNCLEAR] - May be partially used

### DC-005: Operations Map Project Cards
**File:** operations/index.html:4656-4697
**Functions:** `renderMapProjectsList()`, `renderProjectCards()`, `renderTeamCards()`
**Evidence:** These render functions exist but may not be called in the current flow if the map view handles rendering differently.
**Status:** [UNCLEAR] - Need runtime verification

### DC-006: Master Mermaid Diagrams
**File:** master/index.html:1297-1337
**Functions:** `initMermaid()`, `renderMermaidDiagrams()`
**Evidence:** Mermaid library is loaded and init functions exist, but unclear if any content actually uses Mermaid diagrams in the master app.
**Status:** [UNCLEAR] - May be used for report rendering

### DC-007: Debug Page (Entire File)
**File:** debug/index.html (966 lines)
**Evidence:** This is a development debugging tool. All functions are test/debug utilities.
**Status:** [DEVELOPMENT ONLY] - Should not be deployed to production. No harm but unnecessary.

### DC-008: Samples Directory (Not Used by App)
**File:** samples/ (entire directory)
**Evidence:** Contains a standalone Node.js sample generator. Not referenced by any app HTML file. Used only for generating sample .docx files.
**Status:** [DEVELOPMENT TOOL] - Not dead code per se, but not part of the application.

### DC-009: gapCover Element
**File:** technician/index.html
**Element:** `<div id="gapCover">`
**Evidence:** iOS keyboard gap workaround. May be legacy if viewport handling is now working correctly.
**Status:** [UNCLEAR] - May still be needed for specific iOS versions

### DC-010: simulatedSpeaking Variables
**File:** technician/index.html:9665-9667
```javascript
let simulatedSpeaking = {};
let simulatedIntensityTarget = {};
let simulatedIntensityCurrent = {};
```
**Evidence:** These appear to be for simulating voice waveform when real audio analysis isn't available. May be legacy from before real audio implementation.
**Status:** [UNCLEAR] - May be fallback for browsers without audio analysis

---

## CSS Dead Code

### Estimated: 15-25% of CSS may be unused
Due to the monolithic nature of the files, many CSS rules may be defined for states or elements that no longer exist. A runtime CSS coverage analysis would be needed to identify specific unused rules.

### Known CSS Duplication
CSS custom properties (`:root` variables) are **completely redefined** in every app file. The same theme variables are copy-pasted across all 11 HTML files.

---

## Summary

| Status | Count | Lines (est.) |
|--------|-------|-------------|
| Confirmed Dead Code | 10 | ~550 |
| Partial Implementation | 1 | ~100 |
| Development Only | 2 | ~1,500 |
| Unclear (needs runtime testing) | 4 | ~400 |
| CSS Dead Code | Unknown | ~2,000+ (est.) |

**Conservative estimate:** ~2,000-4,000 lines of dead/unused code (3-5% of total).
This is relatively low compared to the massive code duplication issue (~43,300 lines or 57%).
