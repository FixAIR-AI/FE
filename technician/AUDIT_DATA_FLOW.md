# FixAIR - Data Flow Documentation

## Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA FLOW DIAGRAM                               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  1. USER INPUT                                                         │
│  ┌──────────┐                                                          │
│  │ Voice/   │──── Chat message ────▶ n8n Backend                      │
│  │ Text/    │                           │                              │
│  │ Photos   │                           │ AI Extraction                │
│  └──────────┘                           │                              │
│                                         ▼                              │
│  2. AI RESPONSE                                                        │
│  ┌─────────────────────────────────────────┐                          │
│  │ Chat message with embedded:              │                          │
│  │ [REPORT_DATA]{...json...}[/REPORT_DATA] │                          │
│  └─────────────────────────┬───────────────┘                          │
│                            │                                           │
│                            ▼                                           │
│  3. DATA EXTRACTION (line ~9480)                                       │
│  ┌─────────────────────────────────────────┐                          │
│  │ Parse JSON from [REPORT_DATA] markers   │                          │
│  │ normalizeReportData(extracted)           │                          │
│  │ unifiedMerge(lastReportData, normalized) │                          │
│  └─────────────────────────┬───────────────┘                          │
│                            │                                           │
│                            ▼                                           │
│  4. STATE UPDATE                                                       │
│  ┌─────────────────────────────────────────┐                          │
│  │ lastReportData = merged result           │                          │
│  │ Save to Supabase projects.extracted_data │                          │
│  │ updateDrawerPreview(lastReportData)      │                          │
│  └─────────────────────────┬───────────────┘                          │
│                            │                                           │
│              ┌─────────────┴─────────────┐                            │
│              ▼                           ▼                             │
│  5A. DRAWER PREVIEW              5B. WORD EXPORT                      │
│  ┌──────────────────┐            ┌──────────────────┐                 │
│  │ renderReportPre-  │            │ generateWord()    │                 │
│  │ viewV12()         │            │                   │                 │
│  │                   │            │ Uses data from:   │                 │
│  │ Editable blocks:  │            │ - lastReportData  │                 │
│  │ b-h1, b-h2, b-p,│            │ - currentUser     │                 │
│  │ b-bullet, b-arrow│            │   (for company    │                 │
│  │ b-table           │            │    logo/name)     │                 │
│  │                   │            │                   │                 │
│  │ Auto-save on blur │            │ Output: .docx     │                 │
│  │ Undo/Redo support │            │ via Packer.toBlob │                 │
│  └──────────────────┘            └──────────────────┘                 │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## Detailed Flow

### 1. Data Ingestion

**Source A: Chat message parsing (line ~9480)**
- AI responses contain `[REPORT_DATA]...[/REPORT_DATA]` markers
- JSON extracted and parsed
- `normalizeReportData()` called to standardize field names
- `unifiedMerge()` merges with existing `lastReportData`
- Drawer updated immediately

**Source B: Project load from Supabase (line ~10403)**
- When opening an existing project
- `project.extracted_data` loaded from `projects` table
- `normalizeReportData()` called
- Assigned to `lastReportData`
- Drawer updated

### 2. Data Normalization (line ~13289)

The `normalizeReportData()` function handles:
- 3-way fluid field sync (`fluide` ↔ `fluide_global` ↔ root)
- Equipment/system bidirectional sync
- Field alias resolution (e.g., `contenu` ↔ `texte`)
- Address normalization (UI01 → UI1)
- Measurement label normalization (30+ mappings)
- Result status normalization

### 3. Data Merge (line ~13552)

`unifiedMerge(target, source)`:
- Some arrays fully replaced (travaux_effectues, travaux_prevoir, recommandations)
- Other arrays deduplicated via smart key functions
- Primitives: last-write-wins (empty values skipped)
- Objects: recursive merge

### 4. Drawer Rendering (line ~14574)

`renderReportPreviewV12()` creates editable HTML blocks:
- Each block is a `<div class="b b-{type}">` with drag handle
- Content is `contenteditable="true"`
- Auto-saves on blur via `drawerAutoSave()`
- Supports undo/redo via `drawerSaveState()`

### 5. Word Export (line ~11282)

`generateWord()`:
- Uses `window.docx` (docx.js library)
- Creates two-section document:
  - Section 1: Cover page with title, brand, customer info, company logo
  - Section 2: Content pages with all report sections
- Headers: FixAIR logo + brand/reference info
- Footers: Tech name, company, page numbers
- Downloads as `.docx` via `saveAs(blob, filename)`

### 6. Company Logo Flow (NEW)

```
Upload → processLogoFile() → validate → setLogoPreview()
                                              │
Save ← saveCompanySettings() ← saveProfile() │
  │                                           │
  ▼                                           ▼
Supabase users.company_logo     UI preview in profile
  │
  ▼
generateWord() → reads currentUser.company_logo
  │
  ▼
Cover page: company logo centered above title
Data mapping: company_name fallback from user settings
```
