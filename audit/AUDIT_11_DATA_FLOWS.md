# AUDIT_11 - Data Flows

## Overview

The FixAIR system has several critical data flows. This document maps how data moves through the system.

---

## Flow 1: Technician Chat → AI → Report Data

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Technician   │     │   n8n        │     │   AI Model   │     │  Supabase    │
│  (Browser)    │────▶│  Webhook     │────▶│  (LLM)       │────▶│  (projects)  │
│              │     │              │     │              │     │              │
│ sendMsg()     │     │ fixair-      │     │ Returns JSON │     │ extracted_   │
│              │     │ assistant    │     │ in [REPORT_  │     │ data column  │
│              │     │              │     │  DATA] tags  │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                                         │                      │
       │                                         │                      │
       ▼                                         ▼                      ▼
┌──────────────┐                        ┌──────────────┐     ┌──────────────┐
│ Voice Input   │                        │ mergeReport  │     │ Report       │
│ (ElevenLabs)  │                        │ Data()       │     │ Drawer       │
│ → text       │                        │ (deep merge) │     │ (real-time   │
│ → sendMsg()  │                        │              │     │  preview)    │
└──────────────┘                        └──────────────┘     └──────────────┘
```

### Detailed Steps:
1. **User speaks** → Browser MediaRecorder captures audio
2. **Audio blob** → Sent to ElevenLabs `/v1/speech-to-text` → Returns transcribed text
3. **Text** → Inserted into chat input → `sendMsg('assistant')` called
4. **sendMsg()** constructs payload with:
   - Message text
   - Chat history (last 19 messages + 1 system message)
   - Project context (project_id, brand, etc.)
   - Extraction instructions (JSON schema for report data)
5. **n8n webhook** (`fixair-assistant` or `fixair-assistant-dev`) processes request
6. **n8n** calls AI model, returns response with `[REPORT_DATA]...[/REPORT_DATA]` tags
7. **Frontend** parses response:
   - Extracts JSON from `[REPORT_DATA]` tags via regex
   - Calls `mergeReportData()` to deep-merge with existing data
   - Calls `updateDrawerPreview()` to update the UI
8. **Auto-save** → `drawerAutoSave()` saves to Supabase `projects.extracted_data`

### Parallel Extraction Flow:
- `triggerExtraction()` is called BEFORE the chat webhook response
- Sends to `fixair-extraction-dev` webhook
- Returns additional structured data to merge
- Runs in parallel (non-blocking)

---

## Flow 2: Report Drawer → Supabase (Auto-Save)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Drawer DOM   │     │ drawerAuto   │     │  Supabase    │
│  (editable)   │────▶│ Save()       │────▶│  (projects)  │
│              │     │ (800ms       │     │              │
│ contenteditable│    │  debounce)   │     │ extracted_   │
│ elements     │     │              │     │ data column  │
└──────────────┘     └──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│ drawerExtract │
│ DataFromDOM() │
│ (reads all   │
│  fields)     │
└──────────────┘
```

### Detailed Steps:
1. User edits a `contenteditable` element in the report drawer
2. `input` or `blur` event fires → triggers debounced `drawerAutoSave()`
3. After 800ms debounce → `drawerExtractDataFromDOM()` reads all DOM values
4. Extracted data saved to Supabase: `projects.update({ extracted_data })`

---

## Flow 3: Photo Capture → Storage

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Camera/     │     │  Canvas      │     │  Supabase    │
│  File Input   │────▶│  Resize/     │────▶│  (projects   │
│              │     │  Compress    │     │  .photos     │
│              │     │  → base64    │     │  column)     │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  OCR         │
                     │  (n8n webhook│
                     │  fixair-ocr) │
                     └──────────────┘
```

### Detailed Steps:
1. User captures photo via camera or selects from file
2. Image resized/compressed on canvas → converted to base64
3. Base64 stored in `projects.photos` jsonb column
4. Optional: OCR triggered via `fixair-ocr` webhook for text extraction from photos

---

## Flow 4: Word/PDF Export

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  extracted_   │     │  buildPartial│     │  docx library│
│  data (JSON)  │────▶│  Report()    │────▶│  (Word gen)  │
│              │     │              │     │              │
│  from drawer │     │ Maps JSON    │     │ Creates .docx│
│  or Supabase │     │ to document  │     │ file         │
└──────────────┘     │ structure    │     └──────┬───────┘
                     └──────────────┘            │
                                                 ▼
                                          ┌──────────────┐
                                          │  FileSaver   │
                                          │  (download)  │
                                          └──────────────┘

                     ┌──────────────┐     ┌──────────────┐
                     │  jsPDF       │     │  PDF blob    │
                     │  (PDF gen)   │────▶│  download    │
                     └──────────────┘     └──────────────┘
```

---

## Flow 5: Authentication

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Login Form   │     │  Supabase    │     │  Users Table │
│  (email/pwd)  │────▶│  Auth        │────▶│  (profile    │
│              │     │              │     │   lookup)    │
│              │     │ signInWith   │     │              │
│              │     │ Password()   │     │ Check role,  │
│              │     │              │     │ status, etc. │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                      │
       │                    ▼                      ▼
       │             ┌──────────────┐     ┌──────────────┐
       │             │  Session     │     │  Route to    │
       │             │  Token       │     │  correct app │
       │             │  (JWT)       │     │  based on    │
       │             │              │     │  user role   │
       │             └──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│  Magic Link   │
│  (via n8n     │
│  webhook for │
│  support)    │
└──────────────┘
```

### Auth Routes by Role:
| Role | Primary App | URL |
|------|------------|-----|
| technician | /technician | go.fixair.ai/technician |
| admin | /admin | go.fixair.ai/admin |
| manager | /manager | go.fixair.ai/manager |
| master | /master | go.fixair.ai/master |
| operations | /operations | go.fixair.ai/operations |

---

## Flow 6: Referral Program

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Existing    │     │  /r/:code    │     │  New User    │
│  User shares  │────▶│  Referral    │────▶│  Signs up    │
│  link        │     │  Landing     │     │  with ref    │
│              │     │  Page        │     │  code        │
└──────────────┘     └──────────────┘     └──────────────┘
                            │                      │
                            ▼                      ▼
                     ┌──────────────┐     ┌──────────────┐
                     │ Track click  │     │ referrals    │
                     │ (referrals   │     │ table INSERT │
                     │  .link_clicks│     │              │
                     │  increment)  │     │ users.       │
                     └──────────────┘     │ referred_by  │
                                          └──────────────┘
```

---

## Flow 7: Realtime Updates (Admin/Manager)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Supabase    │     │  Realtime    │     │  Admin/      │
│  Database    │────▶│  Channels    │────▶│  Manager UI  │
│  (INSERT/    │     │              │     │              │
│   UPDATE)    │     │ team-status  │     │ Auto-refresh │
│              │     │ project-     │     │ dashboard    │
│              │     │ updates      │     │              │
│              │     │ team-messages│     │              │
│              │     │ availability │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Realtime Channels:
1. **team-status**: Listens for user status changes (online/offline)
2. **project-updates**: Listens for new/updated projects by team members
3. **team-messages**: Listens for new team messages
4. **availability-shares**: Listens for calendar availability changes

---

## Flow 8: Master Admin Operations

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Master App   │     │  Supabase    │     │  n8n         │
│  Dashboard    │────▶│  REST API    │────▶│  Webhooks    │
│              │     │  (any table) │     │              │
│ - View all   │     │              │     │ - approval   │
│   users      │     │ - Users      │     │ - email-send │
│ - Approve    │     │ - Messages   │     │ - support-   │
│ - Send email │     │ - Emails     │     │   login      │
│ - View chats │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Cross-App Data Sharing

| Data | Created By | Read By | Updated By |
|------|-----------|---------|-----------|
| User Profile | auth/invite/r | ALL apps | technician, auth, admin, manager |
| Projects | technician/index/docs | ALL apps | technician/index/docs |
| Chat Messages | technician/index/docs | master | technician/index/docs |
| Calendar Events | technician/index/docs | admin, manager | technician/index/docs |
| Availability | technician | admin, manager, operations | admin, manager |
| Team Messages | admin, manager | admin, manager, operations | admin, manager |
| Invitations | admin, manager | invite | admin, manager |
| Referrals | r/ page | r/ page | r/ page |
| App Settings | (Supabase dashboard) | technician, index, docs | (Supabase dashboard) |
