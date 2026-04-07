# FixAIR Complete System Audit

**Generated:** 2026-04-07
**Branch:** claude/fixair-codebase-audit-xeIFv
**Total Codebase:** 76,520 lines across 18 source files

---

# TABLE OF CONTENTS

- [AUDIT_00 - Master Index](#audit_00_index)
- [AUDIT_01 - Repository Structure](#audit_01_repository_structure)
- [AUDIT_02 - Apps Overview](#audit_02_apps_overview)
- [AUDIT_03 - Technician App Detailed Audit](#audit_03_technician_detailed)
- [AUDIT_04 - Complete Functions List](#audit_04_functions_complete)
- [AUDIT_05 - Global Variables](#audit_05_global_variables)
- [AUDIT_06 - DOM Elements](#audit_06_dom_elements)
- [AUDIT_07 - Event Handlers](#audit_07_event_handlers)
- [AUDIT_08 - Supabase Tables](#audit_08_supabase_tables)
- [AUDIT_09 - Supabase Functions](#audit_09_supabase_functions)
- [AUDIT_10 - Supabase RLS Policies](#audit_10_supabase_policies)
- [AUDIT_11 - Data Flows](#audit_11_data_flows)
- [AUDIT_12 - External Dependencies & APIs](#audit_12_dependencies)
- [AUDIT_13 - Security Issues](#audit_13_security)
- [AUDIT_14 - Dead Code Analysis](#audit_14_dead_code)
- [AUDIT_15 - Issues, Bugs & Technical Debt](#audit_15_issues)
- [AUDIT_16 - Technician App Extraction Plan](#audit_16_extraction_plan)
- [AUDIT_17 - Architecture Proposal](#audit_17_architecture_proposal)

---


<a id="audit_00_index"></a>

# AUDIT_00 - Master Index

## FixAIR Complete System Audit
**Date:** 2026-04-07
**Repository:** fixair-ai/fe
**Branch audited:** main
**Total lines of code:** 76,520 (across 18 source files)
**Production URL:** https://go.fixair.ai
**Dev URL:** https://lab.gomove.ai
**Supabase Project:** fwuhzraxqrvmpqxnzpqm

---

## Audit Documents

| # | Document | Description |
|---|----------|-------------|
| 00 | [AUDIT_00_INDEX.md](AUDIT_00_INDEX.md) | This file - Master index |
| 01 | [AUDIT_01_REPOSITORY_STRUCTURE.md](AUDIT_01_REPOSITORY_STRUCTURE.md) | Complete file/folder structure |
| 02 | [AUDIT_02_APPS_OVERVIEW.md](AUDIT_02_APPS_OVERVIEW.md) | All apps identified with boundaries |
| 03 | [AUDIT_03_TECHNICIAN_DETAILED.md](AUDIT_03_TECHNICIAN_DETAILED.md) | Deep dive into Technician app |
| 04 | [AUDIT_04_FUNCTIONS_COMPLETE.md](AUDIT_04_FUNCTIONS_COMPLETE.md) | Every function in the codebase |
| 05 | [AUDIT_05_GLOBAL_VARIABLES.md](AUDIT_05_GLOBAL_VARIABLES.md) | Every global variable |
| 06 | [AUDIT_06_DOM_ELEMENTS.md](AUDIT_06_DOM_ELEMENTS.md) | Every important DOM element |
| 07 | [AUDIT_07_EVENT_HANDLERS.md](AUDIT_07_EVENT_HANDLERS.md) | Every event handler |
| 08 | [AUDIT_08_SUPABASE_TABLES.md](AUDIT_08_SUPABASE_TABLES.md) | Database tables schema |
| 09 | [AUDIT_09_SUPABASE_FUNCTIONS.md](AUDIT_09_SUPABASE_FUNCTIONS.md) | RPC functions |
| 10 | [AUDIT_10_SUPABASE_POLICIES.md](AUDIT_10_SUPABASE_POLICIES.md) | RLS policies |
| 11 | [AUDIT_11_DATA_FLOWS.md](AUDIT_11_DATA_FLOWS.md) | Data flow diagrams |
| 12 | [AUDIT_12_DEPENDENCIES.md](AUDIT_12_DEPENDENCIES.md) | External libraries and APIs |
| 13 | [AUDIT_13_SECURITY.md](AUDIT_13_SECURITY.md) | Security issues |
| 14 | [AUDIT_14_DEAD_CODE.md](AUDIT_14_DEAD_CODE.md) | Unused code |
| 15 | [AUDIT_15_ISSUES.md](AUDIT_15_ISSUES.md) | Bugs and technical debt |
| 16 | [AUDIT_16_EXTRACTION_PLAN.md](AUDIT_16_EXTRACTION_PLAN.md) | Technician app extraction plan |
| 17 | [AUDIT_17_ARCHITECTURE_PROPOSAL.md](AUDIT_17_ARCHITECTURE_PROPOSAL.md) | New multi-repo architecture |

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Total source files | 18 |
| Total lines of code | 76,520 |
| Largest file | technician/index.html (21,489 lines) |
| Number of apps | 6 (Technician, Operations, Master, Manager, Admin, Landing) |
| Support pages | 5 (Auth, Invite, Referral, Debug, Docs) |
| Hosting | Cloudflare Pages |
| Database | Supabase (PostgreSQL) |
| Domain | go.fixair.ai |

## Architecture Summary

FixAIR is a **monolithic multi-app frontend** deployed as a static site on Cloudflare Pages. Each "app" is a self-contained `index.html` file in its own directory, containing all HTML, CSS, and JavaScript inline. There is no build system, no bundler, no framework - pure vanilla HTML/CSS/JS with Supabase as the backend.

### Apps by Size
| App | File | Lines | Purpose |
|-----|------|-------|---------|
| Technician | technician/index.html | 21,489 | HVAC intervention reports |
| Docs | docs/index.html | 15,570 | Documentation/knowledge base |
| Landing | index.html | 15,137 | Marketing landing page |
| Operations | operations/index.html | 5,614 | Operations management |
| Master | master/index.html | 4,123 | Internal admin (founders) |
| Manager | manager/index.html | 3,808 | Company manager dashboard |
| Admin | admin/index.html | 3,618 | Company admin panel |
| Auth | auth/index.html | 1,799 | Login/signup |
| Debug | debug/index.html | 966 | Debug tools |
| Referral | r/index.html | 807 | Referral program |
| Invite | invite/index.html | 704 | Team invitations |
| 404 | 404.html | 118 | Error page |


---


<a id="audit_01_repository_structure"></a>

# AUDIT_01 - Repository Structure

## Complete File Tree

```
FE/                                    # Root - Cloudflare Pages deployment
├── .DS_Store                          # macOS metadata (should be gitignored)
├── 404.html                           # 118 lines - Custom 404 error page
├── CNAME                              # Domain: go.fixair.ai
├── FRONTEND_AUDIT_RESULTS.md          # Previous audit results
├── _redirects                         # Cloudflare Pages redirect rules
├── _routes.json                       # Cloudflare Pages routing config
├── favicon.svg                        # SVG favicon
├── index.html                         # 15,137 lines - Landing/marketing page
│
├── admin/                             # Company Admin App
│   └── index.html                     # 3,618 lines
│
├── assets/                            # Shared static assets
│   ├── README.md                      # Assets documentation
│   ├── css/
│   │   └── fixair-diagrams.css        # 529 lines - Diagram component styles
│   ├── js/
│   │   └── fixair-diagrams.js         # 545 lines - Diagram component logic
│   ├── logo-email-white.png           # Email logo (white variant)
│   ├── logo-email.png                 # Email logo (standard)
│   └── logo-generator.html            # 218 lines - Logo generation tool
│
├── auth/                              # Authentication Page
│   └── index.html                     # 1,799 lines - Login/signup/magic link
│
├── debug/                             # Debug Tools
│   └── index.html                     # 966 lines - Development debug page
│
├── docs/                              # Documentation
│   ├── AUDIT_RLS_PREPARATION.md       # RLS policy audit prep
│   ├── EXTRACTION_SYSTEM_AUDIT.md     # Previous extraction audit
│   ├── PRODUCTION_CODE_AUDIT.md       # Previous production audit
│   ├── REFERRAL-DATABASE-SCHEMA.sql   # Referral system DB schema
│   ├── REFERRAL-PR-SUMMARY.md         # Referral PR summary
│   ├── REPORT_JSON_AUDIT.md           # Report JSON structure audit
│   └── index.html                     # 15,570 lines - Docs/knowledge page
│
├── invite/                            # Invitation Page
│   └── index.html                     # 704 lines - Team invitation flow
│
├── manager/                           # Company Manager App
│   └── index.html                     # 3,808 lines
│
├── master/                            # Internal Master App (Founders)
│   └── index.html                     # 4,123 lines
│
├── operations/                        # Operations App
│   └── index.html                     # 5,614 lines
│
├── r/                                 # Referral Program
│   └── index.html                     # 807 lines - Referral landing page
│
├── samples/                           # Sample Report Generation
│   ├── .gitignore                     # Ignores generated files
│   ├── SAMPLE_Enterprise_*.docx       # Sample enterprise report
│   ├── SAMPLE_Rapport_*.docx          # Sample standard report
│   ├── generate-enterprise.js         # 498 lines - Enterprise doc generator
│   ├── generate-sample.html           # 568 lines - Browser-based generator
│   ├── generate.js                    # 409 lines - Standard doc generator
│   ├── node_modules/                  # Dependencies (docx, jszip, file-saver)
│   ├── package-lock.json
│   └── package.json                   # Dependencies: docx, file-saver, jszip
│
├── technician/                        # Technician App (MAIN APP)
│   ├── ADDENDUM-STRIPE-AUDIT-PROTECTION.md  # Stripe payment audit
│   ├── CLAUDE-CODE-VIRAL-GROWTH-SPEC.md     # Viral growth feature spec
│   ├── DEFINITIVE_FIX_PLAN.md               # Fix plan documentation
│   ├── FIX_ROUND_3.md                       # Round 3 fixes
│   ├── R4_FIX5_RESULTAT.md                  # Round 4 fix 5 results
│   ├── R5_PATCH_A.md                        # Round 5 patch A
│   ├── R5_PATCH_B.md                        # Round 5 patch B
│   ├── R5_PATCH_C.md                        # Round 5 patch C
│   └── index.html                     # 21,489 lines - THE MONOLITH
│
└── audit/                             # THIS AUDIT (created now)
    └── *.md                           # Audit deliverables
```

## Routing Configuration

### _redirects (Cloudflare Pages)
```
/  /technician  301                    # Root redirects to technician app
/technician/*  /technician/index.html  200   # SPA routing
/admin/*       /admin/index.html       200   # SPA routing
/manager/*     /manager/index.html     200   # SPA routing
/master/*      /master/index.html      200   # SPA routing
/r/:code       /r/index.html           200   # Referral dynamic routes
/r/:code/      /r/index.html           200   # Referral dynamic routes
```

**Key observation:** The root `/` redirects to `/technician` - meaning the technician app is the primary/default app.

### _routes.json
Standard Cloudflare Pages config that includes all routes but excludes static assets.

## Git Information

### Branches
- `main` - Production branch (audited)
- `claude/fixair-codebase-audit-xeIFv` - This audit branch

### Recent Activity
The codebase has been actively developed with features including:
- Freemium report tracking
- Unified paywall/upgrade modals
- Referral system integration
- Multiple rounds of bug fixes (Rounds 2-5) for report data handling
- Sprint challenges and re-entry checks

## Deployment

- **Platform:** Cloudflare Pages
- **Domain:** go.fixair.ai (via CNAME)
- **Architecture:** Static site - no server-side rendering, no build step
- **Each app:** Self-contained index.html with inline CSS and JS


---


<a id="audit_02_apps_overview"></a>

# AUDIT_02 - Apps Overview

## System Architecture

FixAIR is a **multi-app SaaS platform for HVAC technicians**. It consists of 6 distinct applications, each served as a self-contained `index.html` file with inline CSS and JavaScript. There is no build system, framework, or shared module system - each app is completely standalone.

**Domain:** go.fixair.ai
**Hosting:** Cloudflare Pages (static)
**Backend:** Supabase (PostgreSQL + Auth + Realtime)
**AI Processing:** n8n webhooks → LLM
**Voice:** ElevenLabs speech-to-text
**Payment:** Stripe (pay.fixair.ai)

---

## App 1: Technician App (PRIMARY)

- **URL:** /technician (default route from /)
- **File:** technician/index.html
- **Lines:** 21,489
- **Title:** "FixAIR Technician"
- **Purpose:** AI-powered HVAC intervention report creation tool
- **Users:** Field technicians
- **Theme:** Dark (#0D1117 background)

### Key Features
1. **Chat Interface** - Dual-panel: "Assistant" (report builder) + "Copilot" (knowledge base)
2. **Voice Input** - ElevenLabs speech-to-text for hands-free dictation
3. **Report Drawer** - Live-preview report panel with contenteditable fields
4. **Auto-Save** - 800ms debounced save to Supabase
5. **Word Export** - Generate .docx reports via docx library
6. **PDF Export** - Generate PDF reports via jsPDF
7. **Photo Capture** - Camera integration with OCR (Tesseract + n8n)
8. **Signature Capture** - Canvas-based signature drawing
9. **AI Copilot** - RAG-based knowledge queries via n8n
10. **Hotline** - ElevenLabs conversational AI for brand-specific hotlines
11. **Connect** - Team communication features
12. **Freemium System** - Usage tracking, upgrade prompts, Stripe checkout
13. **Referral System** - Invite-based growth with bonus credits
14. **Diagrams** - Mermaid-based technical diagrams
15. **Calendar** - Event scheduling
16. **Project Management** - Create, list, archive, delete projects

### Code Structure (approximate)
| Section | Lines | Content |
|---------|-------|---------|
| HTML `<head>` + CSS | 1-5650 | Styles, themes (dark/light) |
| HTML `<body>` | ~5650-7060 | DOM structure, modals, screens |
| CDN Scripts | 5651-5660 | External library loading |
| Supabase Init | 7060-7240 | DB client setup, auth config |
| Login/Auth | 7240-8500 | Authentication flow |
| Brand/UI Init | 8500-9200 | Brand selection, UI setup |
| Chat System | 9200-10500 | Project loading, chat, messages |
| Sidebar/Navigation | 10500-11000 | Sidebar, panels, navigation |
| Report Preview | 11000-13500 | Drawer rendering, data display |
| Data Merge | 13250-14000 | mergeReportData, buildPartialReport |
| Auto-Save | 14000-15500 | drawerAutoSave, extraction |
| Send Message | 15500-16700 | sendMsg, webhook calls, AI response parsing |
| Word Export | 16700-17200 | generateWord document |
| Photo/OCR | 17200-17800 | Photo capture, OCR processing |
| Signature | 17800-18200 | Canvas signature |
| Calendar | 18200-18600 | Calendar events |
| Freemium | 18600-19600 | Usage tracking, paywall, referral |
| Calendar Extended | 19600-20200 | Calendar CRUD |
| Copilot/Connect | 20200-21489 | Additional features |

### External Dependencies
- Supabase JS @2, Tesseract.js @5, jsPDF 2.5.1, docx 8.5.0, FileSaver.js 2.0.5, Mermaid @10

---

## App 2: Operations App

- **URL:** /operations
- **File:** operations/index.html
- **Lines:** 5,614
- **Title:** "FixAIR Operations V7"
- **Purpose:** Operations management with map-based technician tracking
- **Users:** Operations managers / dispatchers
- **Theme:** Dark navy (#0d0f14)

### Key Features
1. **Map View** - Mapbox GL map showing technician locations
2. **Team Dashboard** - View all technicians and their status
3. **Project Tracking** - View team projects and reports
4. **Availability Management** - Track technician availability
5. **Team Messaging** - Internal communication
6. **Login/Auth** - Email/password with password reset

### External Dependencies
- Supabase JS @2, Mapbox GL JS 2.15.0

### Unique: Uses Mapbox with access token for map rendering (only app with maps)

---

## App 3: Master App (INTERNAL)

- **URL:** /master
- **File:** master/index.html
- **Lines:** 4,123
- **Title:** "FixAIR Master" (inferred)
- **Purpose:** Super-admin dashboard for FixAIR founders
- **Users:** Internal team only
- **Theme:** Dark

### Key Features
1. **User Management** - View/approve/reject all users across all companies
2. **Direct REST API Access** - Can query any Supabase table
3. **Chat Viewer** - Read all chat messages across users
4. **Email System** - Send emails via n8n webhook, view sent emails and link clicks
5. **Approval Workflow** - Approve/reject user signups via webhook
6. **Support Login** - Send magic links to users for support
7. **Mermaid Diagrams** - Visual diagrams
8. **n8n Integration** - Webhooks for approval, email, support

### External Dependencies
- Supabase JS @2, Mermaid @10

### Security Notes
- This is the most privileged app - has direct REST API access to any table. [SECURITY - HIGH]
- **[SECURITY - CRITICAL]** Hardcoded master key `FixAIR_Houssam_2026!` in SUPPORT_CONFIG (line 2550) - used to generate magic links for any user. Must be rotated and moved server-side.
- No CSRF protection on webhook calls

### Dead Code Found
- `enterpriseData` object (lines 1288-1294): Mock data defined but never referenced
- Mermaid sanitization code in `renderMermaidDiagrams`: Complex but possibly never integrated

---

## App 4: Manager App

- **URL:** /manager
- **File:** manager/index.html
- **Lines:** 3,808
- **Title:** "FixAIR Manager" (inferred)
- **Purpose:** Company-level management dashboard
- **Users:** Company managers

### Key Features
1. **Team Dashboard** - View team members and status
2. **Project Overview** - View all team projects
3. **Availability Calendar** - View team availability
4. **Team Messaging** - Internal messaging
5. **Realtime Updates** - Live dashboard updates via Supabase channels
6. **Invite System** - Invite new team members via Supabase Edge Function
7. **Voice Input** - ElevenLabs STT for messaging
8. **Login/Auth** - Email/password

### External Dependencies
- Supabase JS @2

---

## App 5: Admin App

- **URL:** /admin
- **File:** admin/index.html
- **Lines:** 3,618
- **Title:** "FixAIR Admin" (inferred)
- **Purpose:** Company admin panel (similar to Manager with more permissions)
- **Users:** Company administrators

### Key Features
1. **Team Management** - View/manage team members
2. **Project Overview** - View all team projects
3. **Availability Calendar** - View/manage team availability
4. **Team Messaging** - Internal messaging
5. **Realtime Updates** - Live updates via Supabase channels
6. **Invite System** - Invite new team members
7. **Voice Input** - ElevenLabs STT
8. **Login/Auth** - Email/password

### External Dependencies
- Supabase JS @2

### Note: Admin and Manager apps share very similar functionality. Potential for consolidation.

---

## App 6: Landing Page / Full Technician App (Root)

- **URL:** / (redirects to /technician, but index.html serves as both landing and app)
- **File:** index.html (root)
- **Lines:** 15,137
- **Purpose:** Marketing landing page + FULL technician app (production version)
- **Users:** Public (landing) + Technicians (app)

### Key Features
- Marketing sections (hero, features, pricing, testimonials)
- Login/signup flow
- **Full technician app functionality** (chat, reports, drawer, export, etc.)
- Calendar, user actions tracking

### IMPORTANT OBSERVATION
The root `index.html` (15,137 lines) contains a NEAR-COMPLETE COPY of the technician app functionality. This appears to be the **production** version, while `technician/index.html` (21,489 lines) is the **dev** version with additional features (freemium, referral, enhanced features).

Evidence:
- Root uses production webhooks: `fixair-assistant`
- Technician uses dev webhooks: `fixair-assistant-dev`
- Technician has 6,352 more lines (freemium, referral, etc.)

---

## Support Pages

### Auth Page
- **URL:** /auth
- **File:** auth/index.html (1,799 lines)
- **Purpose:** Standalone authentication page (login, signup, magic link, password reset)
- **Used by:** Manager, Admin, Operations apps redirect here

### Invite Page
- **URL:** /invite?token=XXX
- **File:** invite/index.html (704 lines)
- **Purpose:** Accept team invitations, create account
- **Features:** Token validation, signup form, i18n (FR/EN)

### Referral Page
- **URL:** /r/:code
- **File:** r/index.html (807 lines)
- **Purpose:** Referral landing page
- **Features:** Referral code tracking, link click counting, signup with referral

### Debug Page
- **URL:** /debug
- **File:** debug/index.html (966 lines)
- **Purpose:** Development debugging tools
- **Features:** Connection testing, auth testing, user lookup, session management

### Docs Page
- **URL:** /docs
- **File:** docs/index.html (15,570 lines)
- **Purpose:** Documentation / knowledge base app
- **Features:** Near-complete copy of technician app + ElevenLabs conversational AI
- **NOTE:** This is another near-full copy of the technician app with docs-specific features

### 404 Page
- **URL:** (any invalid path)
- **File:** 404.html (118 lines)
- **Purpose:** Custom error page

---

## Code Duplication Analysis

### Critical Finding: Massive Code Duplication

| Feature | technician/ | index.html | docs/ | Duplicated? |
|---------|------------|------------|-------|-------------|
| Chat system | x | x | x | YES - 3 copies |
| Project CRUD | x | x | x | YES - 3 copies |
| Report drawer | x | x | x | YES - 3 copies |
| Calendar | x | x | x | YES - 3 copies |
| User actions | x | x | x | YES - 3 copies |
| Word export | x | | | NO - 1 copy |
| Freemium | x | | | NO - 1 copy |
| Referral | x | | | NO - 1 copy |
| Photo/OCR | x | x | x | YES - 3 copies |
| Login flow | x | x | x | YES - 3 copies |

**At minimum 3 nearly-identical copies** of the core technician functionality exist across:
1. `technician/index.html` (21,489 lines) - DEV version
2. `index.html` (15,137 lines) - PRODUCTION version
3. `docs/index.html` (15,570 lines) - DOCS version

Similarly, `admin/` and `manager/` share ~80% of their code, and both share ~60% with `operations/`.

### Estimated Unique Code
| Unique Feature | Approximate Lines |
|---------------|-------------------|
| Core technician (shared across 3) | ~12,000 |
| Freemium/Referral (technician only) | ~3,000 |
| Landing page (index.html only) | ~4,700 |
| Docs-specific (ElevenLabs AI, etc.) | ~2,000 |
| Manager/Admin/Operations shared | ~2,500 |
| Operations-specific (Mapbox) | ~2,000 |
| Master-specific | ~3,000 |
| Auth/Invite/Referral/Debug | ~4,000 |
| **Total unique code** | **~33,200** |
| **Total duplicated code** | **~43,300 (57%)** |


---


<a id="audit_03_technician_detailed"></a>

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


---


<a id="audit_04_functions_complete"></a>

# AUDIT_04 - Complete Functions List

## Summary

| File | Function Count |
|------|---------------|
| technician/index.html | 371 |
| index.html | 256 |
| docs/index.html | 268 |
| operations/index.html | 106 |
| master/index.html | 91 |
| manager/index.html | 119 |
| admin/index.html | 112 |
| auth/index.html | 24 |
| r/index.html | 7 |
| invite/index.html | 8 |
| debug/index.html | 19 |
| **TOTAL** | **1381** |

---

## technician/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `getVisibleHeight()` | 6613 |  |
| 2 | `setViewportHeight()` | 6620 |  |
| 3 | `handleKeyboardChange()` | 6646 |  |
| 4 | `applyTheme()` | 6876 |  |
| 5 | `toggleTheme()` | 6889 |  |
| 6 | `setLanguage()` | 6895 |  |
| 7 | `t()` | 6911 |  |
| 8 | `applyTranslations()` | 6922 |  |
| 9 | `initSettings()` | 6942 |  |
| 10 | `getErrorExample()` | 7017 |  |
| 11 | `setupChatInputTracking()` | 7025 |  |
| 12 | `onBrandChangeUpdateExample()` | 7048 |  |
| 13 | `initMermaid()` | 7079 |  |
| 14 | `renderMermaidDiagrams()` | 7119 | Yes |
| 15 | `parseHashParams()` | 7245 |  |
| 16 | `handleMagicLinkCallback()` | 7259 | Yes |
| 17 | `waitForSupabase()` | 7319 | Yes |
| 18 | `toast()` | 7331 |  |
| 19 | `lockReportFields()` | 7359 |  |
| 20 | `unlockReportFields()` | 7377 |  |
| 21 | `onLockedFieldClick()` | 7394 |  |
| 22 | `showSubtleToast()` | 7403 |  |
| 23 | `showCompletionPopup()` | 7444 |  |
| 24 | `closeCompletionPopup()` | 7545 |  |
| 25 | `confirmReportCompletion()` | 7549 | Yes |
| 26 | `modifyReport()` | 7576 | Yes |
| 27 | `updateReportFooterButtons()` | 7605 |  |
| 28 | `showNewInfoNotification()` | 7628 |  |
| 29 | `dismissNewInfoNotification()` | 7695 |  |
| 30 | `acceptNewInfo()` | 7704 | Yes |
| 31 | `setNestedValue()` | 7728 |  |
| 32 | `getNestedValue()` | 7739 |  |
| 33 | `detectNewFieldsFromExtraction()` | 7744 |  |
| 34 | `getApiKey()` | 7785 | Yes |
| 35 | `prefetchApiKeys()` | 7807 | Yes |
| 36 | `init()` | 7969 | Yes |
| 37 | `showLoginScreen()` | 8026 |  |
| 38 | `setLoginStatus()` | 8038 |  |
| 39 | `clearLoginStatus()` | 8049 |  |
| 40 | `updateLoginUI()` | 8057 |  |
| 41 | `prevLoginStep()` | 8063 |  |
| 42 | `nextLoginStep()` | 8071 | Yes |
| 43 | `resetPassword()` | 8216 | Yes |
| 44 | `setLoginStatusWithResend()` | 8237 |  |
| 45 | `resendConfirmation()` | 8250 | Yes |
| 46 | `loadUserDashboard()` | 8266 | Yes |
| 47 | `showMainApp()` | 8332 |  |
| 48 | `logout()` | 8348 | Yes |
| 49 | `updateLiveStatus()` | 8368 | Yes |
| 50 | `resetIdleTimer()` | 8386 |  |
| 51 | `initLiveStatusTracking()` | 8403 |  |
| 52 | `stopLiveStatusTracking()` | 8445 |  |
| 53 | `openProfile()` | 8454 |  |
| 54 | `closeProfile()` | 8458 |  |
| 55 | `saveProfile()` | 8476 | Yes |
| 56 | `toggleBrandSelect()` | 8608 |  |
| 57 | `selectBrandInline()` | 8613 |  |
| 58 | `completeBrandStep()` | 8646 |  |
| 59 | `handleStep1Click()` | 8665 |  |
| 60 | `handleStep3Click()` | 8687 |  |
| 61 | `handleStep4Click()` | 8720 |  |
| 62 | `showAssistantOnboardingFlow()` | 8736 |  |
| 63 | `handleOnboardingAddPhotos()` | 8824 |  |
| 64 | `handleOnboardingSkipPhotos()` | 8847 |  |
| 65 | `showOnboardingPhotosPreview()` | 8868 |  |
| 66 | `generateOnboardingReportPreview()` | 8892 |  |
| 67 | `viewOnboardingFullReport()` | 8967 |  |
| 68 | `completeStep()` | 8973 |  |
| 69 | `updateOnboardingProgress()` | 8983 |  |
| 70 | `showCongrats()` | 8994 | Yes |
| 71 | `closeCongrats()` | 9015 |  |
| 72 | `goToHome()` | 9022 |  |
| 73 | `showPage()` | 9035 |  |
| 74 | `toggleBrandDropdown()` | 9045 |  |
| 75 | `closeBrandDropdown()` | 9052 |  |
| 76 | `setBrand()` | 9059 |  |
| 77 | `updateBrandContextInHistory()` | 9076 |  |
| 78 | `toggleChatBrandDropdown()` | 9112 |  |
| 79 | `closeChatBrandDropdowns()` | 9131 |  |
| 80 | `closeChatBrandDropdownsOnClick()` | 9138 |  |
| 81 | `updateChatBrandDropdownSelection()` | 9145 |  |
| 82 | `changeChatBrand()` | 9155 | Yes |
| 83 | `openChat()` | 9244 |  |
| 84 | `closeChat()` | 9351 |  |
| 85 | `updateModeToggle()` | 9401 |  |
| 86 | `switchMode()` | 9414 | Yes |
| 87 | `toggleSplit()` | 9548 |  |
| 88 | `openReport()` | 9594 |  |
| 89 | `closeReport()` | 9605 |  |
| 90 | `stripReportDataFromDisplay()` | 9611 |  |
| 91 | `addMsg()` | 9620 |  |
| 92 | `handleChatInput()` | 9670 |  |
| 93 | `handleKeydown()` | 9708 |  |
| 94 | `resetTextarea()` | 9722 |  |
| 95 | `handleSend()` | 9732 |  |
| 96 | `handleAction()` | 9740 |  |
| 97 | `getWebhookUrl()` | 9764 |  |
| 98 | `updateSessionIds()` | 9776 |  |
| 99 | `getCurrentUserId()` | 9806 | Yes |
| 100 | `ensureProject()` | 9842 | Yes |
| 101 | `saveMessage()` | 9898 | Yes |
| 102 | `autoNameProject()` | 9930 | Yes |
| 103 | `loadProjectsListAndCheckOnboarding()` | 9967 | Yes |
| 104 | `loadProjectsList()` | 9994 | Yes |
| 105 | `generateProjectCardHtml()` | 10041 |  |
| 106 | `renderProjectsList()` | 10091 |  |
| 107 | `renderRecentProjects()` | 10109 |  |
| 108 | `showProjectContextMenu()` | 10126 |  |
| 109 | `startLongPress()` | 10163 |  |
| 110 | `cancelLongPress()` | 10174 |  |
| 111 | `closeContextMenu()` | 10190 |  |
| 112 | `renameProject()` | 10200 |  |
| 113 | `closeRenameModal()` | 10209 |  |
| 114 | `saveProjectRename()` | 10213 | Yes |
| 115 | `deleteProject()` | 10245 | Yes |
| 116 | `formatTimeAgo()` | 10284 |  |
| 117 | `escapeHtml()` | 10300 |  |
| 118 | `escapeForJs()` | 10306 |  |
| 119 | `loadProject()` | 10320 | Yes |
| 120 | `updateChatHeader()` | 10657 |  |
| 121 | `startNewProject()` | 10680 |  |
| 122 | `updateBrandUI()` | 10733 |  |
| 123 | `renderReport()` | 10757 |  |
| 124 | `shareReport()` | 11114 |  |
| 125 | `generateReportText()` | 11119 |  |
| 126 | `exportReportPDF()` | 11178 |  |
| 127 | `showExportMenu()` | 11183 |  |
| 128 | `exportReport()` | 11220 | Yes |
| 129 | `collectReportData()` | 11235 |  |
| 130 | `generateWord()` | 11282 | Yes |
| 131 | `generatePDF()` | 12218 | Yes |
| 132 | `updateDrawerPreview()` | 12739 |  |
| 133 | `calculateReportCompletion()` | 12802 |  |
| 134 | `buildPartialReport()` | 12897 |  |
| 135 | `normalizeMesureLabel()` | 13277 |  |
| 136 | `normalizeReportData()` | 13289 |  |
| 137 | `unifiedMerge()` | 13552 |  |
| 138 | `deduplicateArray()` | 13585 |  |
| 139 | `debouncedSaveExtractedData()` | 13666 |  |
| 140 | `mergeReportData()` | 13704 |  |
| 141 | `renderReportPreview()` | 13730 |  |
| 142 | `drawerSaveState()` | 14472 |  |
| 143 | `drawerUndo()` | 14495 |  |
| 144 | `drawerRedo()` | 14522 |  |
| 145 | `initDrawerKeyboardShortcuts()` | 14549 |  |
| 146 | `renderReportPreviewV12()` | 14574 |  |
| 147 | `initDrawerV12Features()` | 14856 |  |
| 148 | `initDrawerFloatingToolbar()` | 14919 |  |
| 149 | `showDrawerFontToolbar()` | 14958 |  |
| 150 | `hideDrawerFontToolbar()` | 14967 |  |
| 151 | `drawerStartDrag()` | 14973 |  |
| 152 | `drawerOnDrag()` | 14987 |  |
| 153 | `drawerEndDrag()` | 14999 |  |
| 154 | `drawerHandleBlockKey()` | 15019 |  |
| 155 | `drawerCreateBlock()` | 15046 |  |
| 156 | `drawerAddTableRow()` | 15074 |  |
| 157 | `drawerAddTableCol()` | 15094 |  |
| 158 | `drawerRemoveTableRow()` | 15117 |  |
| 159 | `drawerRemoveTableCol()` | 15128 |  |
| 160 | `drawerAutoSave()` | 15146 |  |
| 161 | `drawerExtractDataFromDOM()` | 15194 |  |
| 162 | `updateTechField()` | 15327 |  |
| 163 | `updateObservationClient()` | 15334 |  |
| 164 | `updateResultatStatus()` | 15340 |  |
| 165 | `updateResultatConclusion()` | 15356 |  |
| 166 | `updatePhotoCaption()` | 15364 |  |
| 167 | `triggerPhotoUpload()` | 15373 |  |
| 168 | `showNotification()` | 15380 |  |
| 169 | `completeReportV12()` | 15398 | Yes |
| 170 | `updateReportFooterButtonsV12()` | 15436 |  |
| 171 | `exportReportWordV12()` | 15455 | Yes |
| 172 | `updateReportField()` | 15485 |  |
| 173 | `addReportListItem()` | 15526 |  |
| 174 | `removeReportListItem()` | 15568 |  |
| 175 | `refreshReportPreview()` | 15582 |  |
| 176 | `attachEditableListeners()` | 15602 |  |
| 177 | `updateReportProgress()` | 15639 |  |
| 178 | `showAutoSaveIndicator()` | 15658 |  |
| 179 | `initEditableReport()` | 15664 |  |
| 180 | `parseMarkdown()` | 15671 |  |
| 181 | `restoreMermaid()` | 15694 |  |
| 182 | `parseTable()` | 15816 |  |
| 183 | `processMarkdown()` | 15843 |  |
| 184 | `clearChatBody()` | 15954 |  |
| 185 | `addLoadingMsg()` | 15969 |  |
| 186 | `removeLoadingMsg()` | 15983 |  |
| 187 | `triggerExtraction()` | 16136 | Yes |
| 188 | `handleExtractionResult()` | 16186 |  |
| 189 | `smartMergeExtraction()` | 16220 |  |
| 190 | `deduplicateBy()` | 16258 |  |
| 191 | `sendMsg()` | 16269 | Yes |
| 192 | `saveReport()` | 16591 | Yes |
| 193 | `saveReportData()` | 16622 | Yes |
| 194 | `getVoiceIntensity()` | 16680 |  |
| 195 | `getSimulatedIntensity()` | 16698 |  |
| 196 | `updateWaveform()` | 16715 |  |
| 197 | `startRecording()` | 16736 | Yes |
| 198 | `transcribeWithElevenLabs()` | 16812 | Yes |
| 199 | `updateVoiceTimer()` | 16886 |  |
| 200 | `stopRecording()` | 16898 |  |
| 201 | `voiceInput()` | 16968 |  |
| 202 | `copyTxt()` | 16973 |  |
| 203 | `toggleReportMenu()` | 16979 |  |
| 204 | `copyReportContent()` | 16992 |  |
| 205 | `shareReportCard()` | 17002 |  |
| 206 | `exportReportPDFMenu()` | 17009 |  |
| 207 | `shareReportMenu()` | 17016 |  |
| 208 | `toggleAttach()` | 17029 |  |
| 209 | `closeAllAttach()` | 17035 |  |
| 210 | `attachAction()` | 17043 |  |
| 211 | `handleFileSelect()` | 17054 |  |
| 212 | `addFileToChat()` | 17087 |  |
| 213 | `scrollToBottom()` | 17109 |  |
| 214 | `initScrollDetection()` | 17120 |  |
| 215 | `updateScrollButton()` | 17130 |  |
| 216 | `addPhotoToChat()` | 17142 | Yes |
| 217 | `createPhotoMessageHTML()` | 17180 |  |
| 218 | `deletePhotoMsg()` | 17209 |  |
| 219 | `extractFromPhoto()` | 17222 | Yes |
| 220 | `addOCRQuoteMessage()` | 17459 |  |
| 221 | `updateOCRQuoteWithResults()` | 17492 |  |
| 222 | `formatOCRResponse()` | 17503 |  |
| 223 | `renderOCRMessage()` | 17549 |  |
| 224 | `findSourceImage()` | 17581 |  |
| 225 | `cleanOCRText()` | 17594 |  |
| 226 | `parseOCRForStructuredInfo()` | 17610 |  |
| 227 | `explainErrorCode()` | 17732 | Yes |
| 228 | `analyzeTextWithAI()` | 17744 | Yes |
| 229 | `toggleRawText()` | 17777 |  |
| 230 | `copyOCRText()` | 17792 |  |
| 231 | `scrollToMessage()` | 17819 |  |
| 232 | `addPhotoToReport()` | 17835 |  |
| 233 | `closePhotoNameModal()` | 17879 |  |
| 234 | `openSignatureModal()` | 17892 |  |
| 235 | `closeSignatureModal()` | 17925 |  |
| 236 | `startDrawing()` | 17942 |  |
| 237 | `draw()` | 17948 |  |
| 238 | `stopDrawing()` | 17954 |  |
| 239 | `handleTouchStart()` | 17958 |  |
| 240 | `handleTouchMove()` | 17967 |  |
| 241 | `clearSignature()` | 17976 |  |
| 242 | `saveSignature()` | 17982 |  |
| 243 | `triggerPhotoUpload()` | 18009 |  |
| 244 | `handlePhotoUpload()` | 18015 |  |
| 245 | `handlePhotoDragOver()` | 18034 |  |
| 246 | `handlePhotoDrop()` | 18040 |  |
| 247 | `addPhotoToReportDirect()` | 18060 |  |
| 248 | `removePhoto()` | 18075 |  |
| 249 | `viewPhotoFull()` | 18083 |  |
| 250 | `initPhotoDragDrop()` | 18091 |  |
| 251 | `confirmAddToReport()` | 18144 | Yes |
| 252 | `uploadPhotoToStorage()` | 18212 | Yes |
| 253 | `savePhotoToProject()` | 18250 | Yes |
| 254 | `openImageViewer()` | 18283 |  |
| 255 | `closeImageViewer()` | 18290 |  |
| 256 | `handlePhotoOption()` | 18293 |  |
| 257 | `openHotline()` | 18298 |  |
| 258 | `closeHotline()` | 18303 |  |
| 259 | `resetHotline()` | 18309 |  |
| 260 | `toggleHotline()` | 18323 |  |
| 261 | `connectHotline()` | 18355 | Yes |
| 262 | `showAISpeakingIndicator()` | 18441 |  |
| 263 | `hideAISpeakingIndicator()` | 18464 |  |
| 264 | `handleHotlineDisconnect()` | 18469 |  |
| 265 | `disconnectHotline()` | 18479 | Yes |
| 266 | `toggleChatView()` | 18512 |  |
| 267 | `addHotlineMessage()` | 18527 |  |
| 268 | `startDrag()` | 18555 |  |
| 269 | `drag()` | 18567 |  |
| 270 | `stopDrag()` | 18596 |  |
| 271 | `handleInputFocus()` | 18633 |  |
| 272 | `getFreemiumUsage()` | 18692 |  |
| 273 | `createFreshUsage()` | 18712 |  |
| 274 | `saveFreemiumUsage()` | 18729 |  |
| 275 | `getFreemiumWeekStart()` | 18737 |  |
| 276 | `checkSubscriptionStatus()` | 18748 | Yes |
| 277 | `trackChatUsage()` | 18789 |  |
| 278 | `trackReportGeneration()` | 18839 |  |
| 279 | `canSendChat()` | 18885 |  |
| 280 | `canUseProFeature()` | 18910 |  |
| 281 | `showUpgradeModal()` | 18918 |  |
| 282 | `closeUpgradeModal()` | 18930 |  |
| 283 | `handleUpgradeClick()` | 18935 |  |
| 284 | `showUpgradeBanner()` | 18958 |  |
| 285 | `initFreemium()` | 18978 | Yes |
| 286 | `handleInviteClick()` | 19004 |  |
| 287 | `shareOnWhatsAppWithVariant()` | 19014 |  |
| 288 | `grantInviteBuffer()` | 19036 |  |
| 289 | `showInviteConfirmPopup()` | 19047 |  |
| 290 | `closeInviteConfirmPopup()` | 19052 |  |
| 291 | `showPendingReferralPopup()` | 19057 |  |
| 292 | `closePendingPopup()` | 19075 |  |
| 293 | `checkSprintChallenge()` | 19080 |  |
| 294 | `injectSprintBanner()` | 19102 |  |
| 295 | `showReentryPrompt()` | 19130 |  |
| 296 | `checkWeekFreeStatus()` | 19167 | Yes |
| 297 | `startPaymentPolling()` | 19202 |  |
| 298 | `getReferralLink()` | 19319 |  |
| 299 | `getWhatsAppMessage()` | 19325 |  |
| 300 | `shareOnWhatsApp()` | 19332 |  |
| 301 | `shareOnWhatsAppFromModal()` | 19341 |  |
| 302 | `copyReferralCode()` | 19347 |  |
| 303 | `copyReferralLink()` | 19365 |  |
| 304 | `trackReferralShare()` | 19386 | Yes |
| 305 | `showReferralModal()` | 19396 |  |
| 306 | `closeReferralModal()` | 19400 |  |
| 307 | `loadReferralData()` | 19405 | Yes |
| 308 | `updateReferralUI()` | 19436 |  |
| 309 | `ensureReferralCode()` | 19456 | Yes |
| 310 | `initReferral()` | 19502 | Yes |
| 311 | `trackAction()` | 19569 | Yes |
| 312 | `getWeekStart()` | 19608 |  |
| 313 | `getWeeklyStats()` | 19619 | Yes |
| 314 | `formatTimeSaved()` | 19672 |  |
| 315 | `getUserFirstName()` | 19686 |  |
| 316 | `getMotivationalMessage()` | 19693 |  |
| 317 | `formatMotivationalMessage()` | 19721 |  |
| 318 | `calculateRingPercentage()` | 19729 |  |
| 319 | `updateStatsRing()` | 19735 |  |
| 320 | `getWeekLabel()` | 19750 |  |
| 321 | `refreshWeeklyStats()` | 19763 | Yes |
| 322 | `saveLastKnownStats()` | 19810 |  |
| 323 | `createConfetti()` | 19816 |  |
| 324 | `showPlusOne()` | 19855 |  |
| 325 | `animateStatsCountUp()` | 19867 |  |
| 326 | `triggerCelebration()` | 19924 |  |
| 327 | `shouldCelebrate()` | 19953 |  |
| 328 | `initGamification()` | 19961 | Yes |
| 329 | `onReturnToHomepage()` | 20000 |  |
| 330 | `initTechCalendar()` | 20015 | Yes |
| 331 | `saveCalendarEventsToStorage()` | 20069 | Yes |
| 332 | `saveEventToSupabase()` | 20074 | Yes |
| 333 | `deleteEventFromSupabase()` | 20127 | Yes |
| 334 | `createProjectForEvent()` | 20145 | Yes |
| 335 | `formatDateKey()` | 20188 |  |
| 336 | `getEventsForDate()` | 20192 |  |
| 337 | `setTechCalView()` | 20197 |  |
| 338 | `navTechCal()` | 20204 |  |
| 339 | `renderTechCalendar()` | 20215 |  |
| 340 | `buildTechDayView()` | 20239 |  |
| 341 | `buildTechWeekView()` | 20265 |  |
| 342 | `buildTechMonthView()` | 20304 |  |
| 343 | `goToToday()` | 20359 |  |
| 344 | `goToTechDayViewDate()` | 20367 |  |
| 345 | `openCalendarEvent()` | 20375 |  |
| 346 | `createCalendarEvent()` | 20412 |  |
| 347 | `createCalendarEventForDate()` | 20416 |  |
| 348 | `openEventDrawer()` | 20423 |  |
| 349 | `openEventDrawerForEdit()` | 20457 |  |
| 350 | `closeEventDrawer()` | 20501 |  |
| 351 | `selectEventType()` | 20507 |  |
| 352 | `toggleEventAllDay()` | 20513 |  |
| 353 | `toggleMoreOptions()` | 20519 |  |
| 354 | `saveCalendarEvent()` | 20526 | Yes |
| 355 | `showEventContextMenu()` | 20595 |  |
| 356 | `hideEventContextMenu()` | 20624 |  |
| 357 | `startEventLongPress()` | 20631 |  |
| 358 | `cancelEventLongPress()` | 20641 |  |
| 359 | `handleEventClick()` | 20649 |  |
| 360 | `modifyContextEvent()` | 20659 |  |
| 361 | `deleteContextEvent()` | 20666 | Yes |
| 362 | `openConnect()` | 20696 |  |
| 363 | `closeConnect()` | 20701 |  |
| 364 | `activateConnect()` | 20708 |  |
| 365 | `openConnectDrawer()` | 20718 |  |
| 366 | `closeConnectDrawer()` | 20774 |  |
| 367 | `acceptConnectJob()` | 20778 |  |
| 368 | `showThoughtProcess()` | 21406 |  |
| 369 | `collapseThoughtProcess()` | 21407 |  |
| 370 | `hideThoughtProcess()` | 21408 |  |
| 371 | `renderPersistedThoughtProcess()` | 21411 |  |

---

## index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `getVisibleHeight()` | 5608 |  |
| 2 | `setViewportHeight()` | 5615 |  |
| 3 | `handleKeyboardChange()` | 5641 |  |
| 4 | `applyTheme()` | 5805 |  |
| 5 | `toggleTheme()` | 5818 |  |
| 6 | `setLanguage()` | 5824 |  |
| 7 | `applyTranslations()` | 5837 |  |
| 8 | `initSettings()` | 5857 |  |
| 9 | `parseHashParams()` | 5887 |  |
| 10 | `waitForSupabase()` | 5936 | Yes |
| 11 | `safeQuery()` | 5948 | Yes |
| 12 | `toast()` | 5960 |  |
| 13 | `getApiKey()` | 5987 | Yes |
| 14 | `prefetchApiKeys()` | 6009 | Yes |
| 15 | `loadUserProfile()` | 6014 | Yes |
| 16 | `loadUserAndShowApp()` | 6035 | Yes |
| 17 | `showPasswordResetScreen()` | 6126 |  |
| 18 | `initAuth()` | 6135 | Yes |
| 19 | `setLoginStatus()` | 6316 |  |
| 20 | `clearLoginStatus()` | 6329 |  |
| 21 | `resetPassword()` | 6337 | Yes |
| 22 | `setNewPassword()` | 6362 | Yes |
| 23 | `goToLoginFromPasswordReset()` | 6442 |  |
| 24 | `cancelPasswordReset()` | 6463 |  |
| 25 | `nextLoginStep()` | 6482 | Yes |
| 26 | `updateLoginUI()` | 6659 |  |
| 27 | `prevLoginStep()` | 6665 |  |
| 28 | `completeLogin()` | 6677 | Yes |
| 29 | `showEmailConfirmScreen()` | 6744 |  |
| 30 | `showPendingScreen()` | 6753 |  |
| 31 | `resendConfirmation()` | 6762 | Yes |
| 32 | `backToLogin()` | 6779 |  |
| 33 | `logoutFromPending()` | 6793 | Yes |
| 34 | `doLogin()` | 6820 | Yes |
| 35 | `logout()` | 6831 | Yes |
| 36 | `openProfile()` | 6864 |  |
| 37 | `closeProfile()` | 6868 |  |
| 38 | `saveProfile()` | 6872 | Yes |
| 39 | `toggleBrandSelect()` | 7014 |  |
| 40 | `selectBrandInline()` | 7019 |  |
| 41 | `completeBrandStep()` | 7049 |  |
| 42 | `handleStep3Click()` | 7068 |  |
| 43 | `handleStep4Click()` | 7074 |  |
| 44 | `completeStep()` | 7080 |  |
| 45 | `updateOnboardingProgress()` | 7090 |  |
| 46 | `showCongrats()` | 7101 | Yes |
| 47 | `closeCongrats()` | 7122 |  |
| 48 | `goToHome()` | 7129 |  |
| 49 | `showPage()` | 7146 |  |
| 50 | `toggleBrandDropdown()` | 7156 |  |
| 51 | `closeBrandDropdown()` | 7163 |  |
| 52 | `setBrand()` | 7168 |  |
| 53 | `updateBrandContextInHistory()` | 7185 |  |
| 54 | `toggleChatBrandDropdown()` | 7221 |  |
| 55 | `closeChatBrandDropdowns()` | 7240 |  |
| 56 | `closeChatBrandDropdownsOnClick()` | 7247 |  |
| 57 | `updateChatBrandDropdownSelection()` | 7254 |  |
| 58 | `changeChatBrand()` | 7264 | Yes |
| 59 | `openChat()` | 7348 |  |
| 60 | `closeChat()` | 7454 |  |
| 61 | `updateModeToggle()` | 7504 |  |
| 62 | `switchMode()` | 7517 | Yes |
| 63 | `toggleSplit()` | 7631 |  |
| 64 | `openReport()` | 7677 |  |
| 65 | `closeReport()` | 7685 |  |
| 66 | `addMsg()` | 7690 |  |
| 67 | `handleChatInput()` | 7729 |  |
| 68 | `handleKeydown()` | 7767 |  |
| 69 | `resetTextarea()` | 7781 |  |
| 70 | `handleSend()` | 7791 |  |
| 71 | `handleAction()` | 7799 |  |
| 72 | `updateSessionIds()` | 7826 |  |
| 73 | `getCurrentUserId()` | 7856 | Yes |
| 74 | `ensureProject()` | 7892 | Yes |
| 75 | `saveMessage()` | 7948 | Yes |
| 76 | `autoNameProject()` | 7978 | Yes |
| 77 | `loadProjectsListAndCheckOnboarding()` | 8015 | Yes |
| 78 | `loadProjectsList()` | 8042 | Yes |
| 79 | `generateProjectCardHtml()` | 8089 |  |
| 80 | `renderProjectsList()` | 8139 |  |
| 81 | `renderRecentProjects()` | 8157 |  |
| 82 | `showProjectContextMenu()` | 8174 |  |
| 83 | `startLongPress()` | 8211 |  |
| 84 | `cancelLongPress()` | 8222 |  |
| 85 | `closeContextMenu()` | 8238 |  |
| 86 | `renameProject()` | 8248 |  |
| 87 | `closeRenameModal()` | 8257 |  |
| 88 | `saveProjectRename()` | 8261 | Yes |
| 89 | `deleteProject()` | 8293 | Yes |
| 90 | `formatTimeAgo()` | 8332 |  |
| 91 | `escapeHtml()` | 8348 |  |
| 92 | `escapeForJs()` | 8354 |  |
| 93 | `loadProject()` | 8368 | Yes |
| 94 | `updateChatHeader()` | 8648 |  |
| 95 | `startNewProject()` | 8671 |  |
| 96 | `updateBrandUI()` | 8716 |  |
| 97 | `renderReport()` | 8740 |  |
| 98 | `shareReport()` | 9096 |  |
| 99 | `generateReportText()` | 9101 |  |
| 100 | `exportReportPDF()` | 9156 |  |
| 101 | `generatePDF()` | 9161 | Yes |
| 102 | `updateDrawerPreview()` | 9682 |  |
| 103 | `calculateReportCompletion()` | 9725 |  |
| 104 | `buildPartialReport()` | 9820 |  |
| 105 | `mergeReportData()` | 10068 |  |
| 106 | `renderReportPreview()` | 10105 |  |
| 107 | `updateReportField()` | 10836 |  |
| 108 | `addReportListItem()` | 10866 |  |
| 109 | `removeReportListItem()` | 10908 |  |
| 110 | `refreshReportPreview()` | 10922 |  |
| 111 | `attachEditableListeners()` | 10938 |  |
| 112 | `updateReportProgress()` | 10975 |  |
| 113 | `showAutoSaveIndicator()` | 10994 |  |
| 114 | `initEditableReport()` | 11000 |  |
| 115 | `parseMarkdown()` | 11007 |  |
| 116 | `parseTable()` | 11118 |  |
| 117 | `processMarkdown()` | 11145 |  |
| 118 | `addLoadingMsg()` | 11255 |  |
| 119 | `removeLoadingMsg()` | 11269 |  |
| 120 | `sendMsg()` | 11281 | Yes |
| 121 | `saveReport()` | 11557 | Yes |
| 122 | `getVoiceIntensity()` | 11588 |  |
| 123 | `getSimulatedIntensity()` | 11606 |  |
| 124 | `updateWaveform()` | 11623 |  |
| 125 | `startRecording()` | 11644 | Yes |
| 126 | `transcribeWithElevenLabs()` | 11720 | Yes |
| 127 | `updateVoiceTimer()` | 11794 |  |
| 128 | `stopRecording()` | 11806 |  |
| 129 | `voiceInput()` | 11876 |  |
| 130 | `copyTxt()` | 11881 |  |
| 131 | `toggleReportMenu()` | 11887 |  |
| 132 | `copyReportContent()` | 11900 |  |
| 133 | `shareReportCard()` | 11910 |  |
| 134 | `exportReportPDFMenu()` | 11917 |  |
| 135 | `shareReportMenu()` | 11924 |  |
| 136 | `toggleAttach()` | 11937 |  |
| 137 | `closeAllAttach()` | 11943 |  |
| 138 | `attachAction()` | 11951 |  |
| 139 | `handleFileSelect()` | 11962 |  |
| 140 | `addFileToChat()` | 11995 |  |
| 141 | `scrollToBottom()` | 12017 |  |
| 142 | `initScrollDetection()` | 12028 |  |
| 143 | `updateScrollButton()` | 12038 |  |
| 144 | `addPhotoToChat()` | 12050 | Yes |
| 145 | `createPhotoMessageHTML()` | 12088 |  |
| 146 | `deletePhotoMsg()` | 12117 |  |
| 147 | `extractFromPhoto()` | 12130 | Yes |
| 148 | `addOCRQuoteMessage()` | 12367 |  |
| 149 | `updateOCRQuoteWithResults()` | 12400 |  |
| 150 | `formatOCRResponse()` | 12411 |  |
| 151 | `renderOCRMessage()` | 12457 |  |
| 152 | `findSourceImage()` | 12489 |  |
| 153 | `cleanOCRText()` | 12502 |  |
| 154 | `parseOCRForStructuredInfo()` | 12518 |  |
| 155 | `explainErrorCode()` | 12640 | Yes |
| 156 | `analyzeTextWithAI()` | 12652 | Yes |
| 157 | `toggleRawText()` | 12685 |  |
| 158 | `copyOCRText()` | 12700 |  |
| 159 | `scrollToMessage()` | 12727 |  |
| 160 | `addPhotoToReport()` | 12743 |  |
| 161 | `closePhotoNameModal()` | 12787 |  |
| 162 | `openSignatureModal()` | 12800 |  |
| 163 | `closeSignatureModal()` | 12833 |  |
| 164 | `startDrawing()` | 12850 |  |
| 165 | `draw()` | 12856 |  |
| 166 | `stopDrawing()` | 12862 |  |
| 167 | `handleTouchStart()` | 12866 |  |
| 168 | `handleTouchMove()` | 12875 |  |
| 169 | `clearSignature()` | 12884 |  |
| 170 | `saveSignature()` | 12890 |  |
| 171 | `triggerPhotoUpload()` | 12916 |  |
| 172 | `handlePhotoUpload()` | 12920 |  |
| 173 | `handlePhotoDragOver()` | 12939 |  |
| 174 | `handlePhotoDrop()` | 12945 |  |
| 175 | `addPhotoToReportDirect()` | 12965 |  |
| 176 | `removePhoto()` | 12979 |  |
| 177 | `viewPhotoFull()` | 12986 |  |
| 178 | `initPhotoDragDrop()` | 12994 |  |
| 179 | `confirmAddToReport()` | 13043 | Yes |
| 180 | `uploadPhotoToStorage()` | 13111 | Yes |
| 181 | `savePhotoToProject()` | 13149 | Yes |
| 182 | `openImageViewer()` | 13182 |  |
| 183 | `closeImageViewer()` | 13189 |  |
| 184 | `handlePhotoOption()` | 13192 |  |
| 185 | `openHotline()` | 13197 |  |
| 186 | `closeHotline()` | 13202 |  |
| 187 | `resetHotline()` | 13208 |  |
| 188 | `toggleHotline()` | 13222 |  |
| 189 | `connectHotline()` | 13254 | Yes |
| 190 | `showAISpeakingIndicator()` | 13340 |  |
| 191 | `hideAISpeakingIndicator()` | 13363 |  |
| 192 | `handleHotlineDisconnect()` | 13368 |  |
| 193 | `disconnectHotline()` | 13378 | Yes |
| 194 | `toggleChatView()` | 13411 |  |
| 195 | `addHotlineMessage()` | 13426 |  |
| 196 | `startDrag()` | 13454 |  |
| 197 | `drag()` | 13466 |  |
| 198 | `stopDrag()` | 13495 |  |
| 199 | `handleInputFocus()` | 13532 |  |
| 200 | `trackAction()` | 13597 | Yes |
| 201 | `getWeekStart()` | 13636 |  |
| 202 | `getWeeklyStats()` | 13647 | Yes |
| 203 | `formatTimeSaved()` | 13700 |  |
| 204 | `getUserFirstName()` | 13714 |  |
| 205 | `getMotivationalMessage()` | 13721 |  |
| 206 | `formatMotivationalMessage()` | 13749 |  |
| 207 | `calculateRingPercentage()` | 13757 |  |
| 208 | `updateStatsRing()` | 13763 |  |
| 209 | `getWeekLabel()` | 13778 |  |
| 210 | `refreshWeeklyStats()` | 13791 | Yes |
| 211 | `saveLastKnownStats()` | 13838 |  |
| 212 | `createConfetti()` | 13844 |  |
| 213 | `showPlusOne()` | 13883 |  |
| 214 | `animateStatsCountUp()` | 13895 |  |
| 215 | `triggerCelebration()` | 13952 |  |
| 216 | `shouldCelebrate()` | 13981 |  |
| 217 | `initGamification()` | 13989 | Yes |
| 218 | `onReturnToHomepage()` | 14028 |  |
| 219 | `initTechCalendar()` | 14043 | Yes |
| 220 | `saveCalendarEventsToStorage()` | 14097 | Yes |
| 221 | `saveEventToSupabase()` | 14102 | Yes |
| 222 | `deleteEventFromSupabase()` | 14155 | Yes |
| 223 | `createProjectForEvent()` | 14173 | Yes |
| 224 | `formatDateKey()` | 14216 |  |
| 225 | `getEventsForDate()` | 14220 |  |
| 226 | `setTechCalView()` | 14225 |  |
| 227 | `navTechCal()` | 14232 |  |
| 228 | `renderTechCalendar()` | 14243 |  |
| 229 | `buildTechDayView()` | 14267 |  |
| 230 | `buildTechWeekView()` | 14293 |  |
| 231 | `buildTechMonthView()` | 14332 |  |
| 232 | `goToToday()` | 14387 |  |
| 233 | `goToTechDayViewDate()` | 14395 |  |
| 234 | `openCalendarEvent()` | 14403 |  |
| 235 | `createCalendarEvent()` | 14440 |  |
| 236 | `createCalendarEventForDate()` | 14444 |  |
| 237 | `openEventDrawer()` | 14451 |  |
| 238 | `openEventDrawerForEdit()` | 14485 |  |
| 239 | `closeEventDrawer()` | 14529 |  |
| 240 | `selectEventType()` | 14535 |  |
| 241 | `toggleEventAllDay()` | 14541 |  |
| 242 | `toggleMoreOptions()` | 14547 |  |
| 243 | `saveCalendarEvent()` | 14554 | Yes |
| 244 | `showEventContextMenu()` | 14623 |  |
| 245 | `hideEventContextMenu()` | 14652 |  |
| 246 | `startEventLongPress()` | 14659 |  |
| 247 | `cancelEventLongPress()` | 14669 |  |
| 248 | `handleEventClick()` | 14677 |  |
| 249 | `modifyContextEvent()` | 14687 |  |
| 250 | `deleteContextEvent()` | 14694 | Yes |
| 251 | `openConnect()` | 14724 |  |
| 252 | `closeConnect()` | 14729 |  |
| 253 | `activateConnect()` | 14736 |  |
| 254 | `openConnectDrawer()` | 14746 |  |
| 255 | `closeConnectDrawer()` | 14802 |  |
| 256 | `acceptConnectJob()` | 14806 |  |

---

## docs/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `getVisibleHeight()` | 5733 |  |
| 2 | `setViewportHeight()` | 5740 |  |
| 3 | `handleKeyboardChange()` | 5766 |  |
| 4 | `applyTheme()` | 5930 |  |
| 5 | `toggleTheme()` | 5943 |  |
| 6 | `setLanguage()` | 5949 |  |
| 7 | `applyTranslations()` | 5962 |  |
| 8 | `initSettings()` | 5982 |  |
| 9 | `getErrorExample()` | 6022 |  |
| 10 | `setupChatInputTracking()` | 6028 |  |
| 11 | `onBrandChangeUpdateExample()` | 6051 |  |
| 12 | `initMermaid()` | 6082 |  |
| 13 | `renderMermaidDiagrams()` | 6122 | Yes |
| 14 | `waitForSupabase()` | 6212 | Yes |
| 15 | `toast()` | 6224 |  |
| 16 | `getApiKey()` | 6247 | Yes |
| 17 | `prefetchApiKeys()` | 6269 | Yes |
| 18 | `init()` | 6431 | Yes |
| 19 | `showLoginScreen()` | 6481 |  |
| 20 | `setLoginStatus()` | 6493 |  |
| 21 | `clearLoginStatus()` | 6504 |  |
| 22 | `updateLoginUI()` | 6512 |  |
| 23 | `prevLoginStep()` | 6518 |  |
| 24 | `nextLoginStep()` | 6526 | Yes |
| 25 | `resetPassword()` | 6671 | Yes |
| 26 | `setLoginStatusWithResend()` | 6692 |  |
| 27 | `resendConfirmation()` | 6705 | Yes |
| 28 | `loadUserDashboard()` | 6721 | Yes |
| 29 | `showMainApp()` | 6787 |  |
| 30 | `logout()` | 6801 | Yes |
| 31 | `updateLiveStatus()` | 6821 | Yes |
| 32 | `resetIdleTimer()` | 6839 |  |
| 33 | `initLiveStatusTracking()` | 6856 |  |
| 34 | `stopLiveStatusTracking()` | 6898 |  |
| 35 | `openProfile()` | 6907 |  |
| 36 | `closeProfile()` | 6911 |  |
| 37 | `saveProfile()` | 6915 | Yes |
| 38 | `toggleBrandSelect()` | 7047 |  |
| 39 | `selectBrandInline()` | 7052 |  |
| 40 | `completeBrandStep()` | 7085 |  |
| 41 | `handleStep1Click()` | 7104 |  |
| 42 | `handleStep3Click()` | 7126 |  |
| 43 | `handleStep4Click()` | 7159 |  |
| 44 | `showAssistantOnboardingFlow()` | 7175 |  |
| 45 | `handleOnboardingAddPhotos()` | 7263 |  |
| 46 | `handleOnboardingSkipPhotos()` | 7286 |  |
| 47 | `showOnboardingPhotosPreview()` | 7307 |  |
| 48 | `generateOnboardingReportPreview()` | 7331 |  |
| 49 | `viewOnboardingFullReport()` | 7406 |  |
| 50 | `completeStep()` | 7412 |  |
| 51 | `updateOnboardingProgress()` | 7422 |  |
| 52 | `showCongrats()` | 7433 | Yes |
| 53 | `closeCongrats()` | 7454 |  |
| 54 | `goToHome()` | 7461 |  |
| 55 | `showPage()` | 7474 |  |
| 56 | `toggleBrandDropdown()` | 7484 |  |
| 57 | `closeBrandDropdown()` | 7491 |  |
| 58 | `setBrand()` | 7498 |  |
| 59 | `updateBrandContextInHistory()` | 7515 |  |
| 60 | `toggleChatBrandDropdown()` | 7551 |  |
| 61 | `closeChatBrandDropdowns()` | 7570 |  |
| 62 | `closeChatBrandDropdownsOnClick()` | 7577 |  |
| 63 | `updateChatBrandDropdownSelection()` | 7584 |  |
| 64 | `changeChatBrand()` | 7594 | Yes |
| 65 | `openChat()` | 7683 |  |
| 66 | `closeChat()` | 7789 |  |
| 67 | `updateModeToggle()` | 7839 |  |
| 68 | `switchMode()` | 7852 | Yes |
| 69 | `toggleSplit()` | 7965 |  |
| 70 | `openReport()` | 8011 |  |
| 71 | `closeReport()` | 8019 |  |
| 72 | `addMsg()` | 8024 |  |
| 73 | `handleChatInput()` | 8073 |  |
| 74 | `handleKeydown()` | 8111 |  |
| 75 | `resetTextarea()` | 8125 |  |
| 76 | `handleSend()` | 8135 |  |
| 77 | `handleAction()` | 8143 |  |
| 78 | `updateSessionIds()` | 8170 |  |
| 79 | `getCurrentUserId()` | 8200 | Yes |
| 80 | `ensureProject()` | 8236 | Yes |
| 81 | `saveMessage()` | 8292 | Yes |
| 82 | `autoNameProject()` | 8322 | Yes |
| 83 | `loadProjectsListAndCheckOnboarding()` | 8359 | Yes |
| 84 | `loadProjectsList()` | 8386 | Yes |
| 85 | `generateProjectCardHtml()` | 8433 |  |
| 86 | `renderProjectsList()` | 8483 |  |
| 87 | `renderRecentProjects()` | 8501 |  |
| 88 | `showProjectContextMenu()` | 8518 |  |
| 89 | `startLongPress()` | 8555 |  |
| 90 | `cancelLongPress()` | 8566 |  |
| 91 | `closeContextMenu()` | 8582 |  |
| 92 | `renameProject()` | 8592 |  |
| 93 | `closeRenameModal()` | 8601 |  |
| 94 | `saveProjectRename()` | 8605 | Yes |
| 95 | `deleteProject()` | 8637 | Yes |
| 96 | `formatTimeAgo()` | 8676 |  |
| 97 | `escapeHtml()` | 8692 |  |
| 98 | `escapeForJs()` | 8698 |  |
| 99 | `loadProject()` | 8712 | Yes |
| 100 | `updateChatHeader()` | 8999 |  |
| 101 | `startNewProject()` | 9022 |  |
| 102 | `updateBrandUI()` | 9068 |  |
| 103 | `renderReport()` | 9092 |  |
| 104 | `shareReport()` | 9448 |  |
| 105 | `generateReportText()` | 9453 |  |
| 106 | `exportReportPDF()` | 9508 |  |
| 107 | `generatePDF()` | 9513 | Yes |
| 108 | `updateDrawerPreview()` | 10034 |  |
| 109 | `calculateReportCompletion()` | 10077 |  |
| 110 | `buildPartialReport()` | 10172 |  |
| 111 | `mergeReportData()` | 10420 |  |
| 112 | `renderReportPreview()` | 10457 |  |
| 113 | `updateReportField()` | 11188 |  |
| 114 | `addReportListItem()` | 11218 |  |
| 115 | `removeReportListItem()` | 11260 |  |
| 116 | `refreshReportPreview()` | 11274 |  |
| 117 | `attachEditableListeners()` | 11290 |  |
| 118 | `updateReportProgress()` | 11327 |  |
| 119 | `showAutoSaveIndicator()` | 11346 |  |
| 120 | `initEditableReport()` | 11352 |  |
| 121 | `parseMarkdown()` | 11359 |  |
| 122 | `restoreMermaid()` | 11375 |  |
| 123 | `parseTable()` | 11496 |  |
| 124 | `processMarkdown()` | 11523 |  |
| 125 | `clearChatBody()` | 11634 |  |
| 126 | `addLoadingMsg()` | 11648 |  |
| 127 | `removeLoadingMsg()` | 11662 |  |
| 128 | `sendMsg()` | 11674 | Yes |
| 129 | `saveReport()` | 11953 | Yes |
| 130 | `getVoiceIntensity()` | 11984 |  |
| 131 | `getSimulatedIntensity()` | 12002 |  |
| 132 | `updateWaveform()` | 12019 |  |
| 133 | `startRecording()` | 12040 | Yes |
| 134 | `transcribeWithElevenLabs()` | 12116 | Yes |
| 135 | `updateVoiceTimer()` | 12190 |  |
| 136 | `stopRecording()` | 12202 |  |
| 137 | `voiceInput()` | 12272 |  |
| 138 | `copyTxt()` | 12277 |  |
| 139 | `toggleReportMenu()` | 12283 |  |
| 140 | `copyReportContent()` | 12296 |  |
| 141 | `shareReportCard()` | 12306 |  |
| 142 | `exportReportPDFMenu()` | 12313 |  |
| 143 | `shareReportMenu()` | 12320 |  |
| 144 | `toggleAttach()` | 12333 |  |
| 145 | `closeAllAttach()` | 12339 |  |
| 146 | `attachAction()` | 12347 |  |
| 147 | `handleFileSelect()` | 12358 |  |
| 148 | `addFileToChat()` | 12391 |  |
| 149 | `scrollToBottom()` | 12413 |  |
| 150 | `initScrollDetection()` | 12424 |  |
| 151 | `updateScrollButton()` | 12434 |  |
| 152 | `addPhotoToChat()` | 12446 | Yes |
| 153 | `createPhotoMessageHTML()` | 12484 |  |
| 154 | `deletePhotoMsg()` | 12513 |  |
| 155 | `extractFromPhoto()` | 12526 | Yes |
| 156 | `addOCRQuoteMessage()` | 12763 |  |
| 157 | `updateOCRQuoteWithResults()` | 12796 |  |
| 158 | `formatOCRResponse()` | 12807 |  |
| 159 | `renderOCRMessage()` | 12853 |  |
| 160 | `findSourceImage()` | 12885 |  |
| 161 | `cleanOCRText()` | 12898 |  |
| 162 | `parseOCRForStructuredInfo()` | 12914 |  |
| 163 | `explainErrorCode()` | 13036 | Yes |
| 164 | `analyzeTextWithAI()` | 13048 | Yes |
| 165 | `toggleRawText()` | 13081 |  |
| 166 | `copyOCRText()` | 13096 |  |
| 167 | `scrollToMessage()` | 13123 |  |
| 168 | `addPhotoToReport()` | 13139 |  |
| 169 | `closePhotoNameModal()` | 13183 |  |
| 170 | `openSignatureModal()` | 13196 |  |
| 171 | `closeSignatureModal()` | 13229 |  |
| 172 | `startDrawing()` | 13246 |  |
| 173 | `draw()` | 13252 |  |
| 174 | `stopDrawing()` | 13258 |  |
| 175 | `handleTouchStart()` | 13262 |  |
| 176 | `handleTouchMove()` | 13271 |  |
| 177 | `clearSignature()` | 13280 |  |
| 178 | `saveSignature()` | 13286 |  |
| 179 | `triggerPhotoUpload()` | 13312 |  |
| 180 | `handlePhotoUpload()` | 13316 |  |
| 181 | `handlePhotoDragOver()` | 13335 |  |
| 182 | `handlePhotoDrop()` | 13341 |  |
| 183 | `addPhotoToReportDirect()` | 13361 |  |
| 184 | `removePhoto()` | 13375 |  |
| 185 | `viewPhotoFull()` | 13382 |  |
| 186 | `initPhotoDragDrop()` | 13390 |  |
| 187 | `confirmAddToReport()` | 13439 | Yes |
| 188 | `uploadPhotoToStorage()` | 13507 | Yes |
| 189 | `savePhotoToProject()` | 13545 | Yes |
| 190 | `openImageViewer()` | 13578 |  |
| 191 | `closeImageViewer()` | 13585 |  |
| 192 | `handlePhotoOption()` | 13588 |  |
| 193 | `openHotline()` | 13593 |  |
| 194 | `closeHotline()` | 13598 |  |
| 195 | `resetHotline()` | 13604 |  |
| 196 | `toggleHotline()` | 13618 |  |
| 197 | `connectHotline()` | 13650 | Yes |
| 198 | `showAISpeakingIndicator()` | 13736 |  |
| 199 | `hideAISpeakingIndicator()` | 13759 |  |
| 200 | `handleHotlineDisconnect()` | 13764 |  |
| 201 | `disconnectHotline()` | 13774 | Yes |
| 202 | `toggleChatView()` | 13807 |  |
| 203 | `addHotlineMessage()` | 13822 |  |
| 204 | `startDrag()` | 13850 |  |
| 205 | `drag()` | 13862 |  |
| 206 | `stopDrag()` | 13891 |  |
| 207 | `handleInputFocus()` | 13928 |  |
| 208 | `trackAction()` | 13993 | Yes |
| 209 | `getWeekStart()` | 14032 |  |
| 210 | `getWeeklyStats()` | 14043 | Yes |
| 211 | `formatTimeSaved()` | 14096 |  |
| 212 | `getUserFirstName()` | 14110 |  |
| 213 | `getMotivationalMessage()` | 14117 |  |
| 214 | `formatMotivationalMessage()` | 14145 |  |
| 215 | `calculateRingPercentage()` | 14153 |  |
| 216 | `updateStatsRing()` | 14159 |  |
| 217 | `getWeekLabel()` | 14174 |  |
| 218 | `refreshWeeklyStats()` | 14187 | Yes |
| 219 | `saveLastKnownStats()` | 14234 |  |
| 220 | `createConfetti()` | 14240 |  |
| 221 | `showPlusOne()` | 14279 |  |
| 222 | `animateStatsCountUp()` | 14291 |  |
| 223 | `triggerCelebration()` | 14348 |  |
| 224 | `shouldCelebrate()` | 14377 |  |
| 225 | `initGamification()` | 14385 | Yes |
| 226 | `onReturnToHomepage()` | 14424 |  |
| 227 | `initTechCalendar()` | 14439 | Yes |
| 228 | `saveCalendarEventsToStorage()` | 14493 | Yes |
| 229 | `saveEventToSupabase()` | 14498 | Yes |
| 230 | `deleteEventFromSupabase()` | 14551 | Yes |
| 231 | `createProjectForEvent()` | 14569 | Yes |
| 232 | `formatDateKey()` | 14612 |  |
| 233 | `getEventsForDate()` | 14616 |  |
| 234 | `setTechCalView()` | 14621 |  |
| 235 | `navTechCal()` | 14628 |  |
| 236 | `renderTechCalendar()` | 14639 |  |
| 237 | `buildTechDayView()` | 14663 |  |
| 238 | `buildTechWeekView()` | 14689 |  |
| 239 | `buildTechMonthView()` | 14728 |  |
| 240 | `goToToday()` | 14783 |  |
| 241 | `goToTechDayViewDate()` | 14791 |  |
| 242 | `openCalendarEvent()` | 14799 |  |
| 243 | `createCalendarEvent()` | 14836 |  |
| 244 | `createCalendarEventForDate()` | 14840 |  |
| 245 | `openEventDrawer()` | 14847 |  |
| 246 | `openEventDrawerForEdit()` | 14881 |  |
| 247 | `closeEventDrawer()` | 14925 |  |
| 248 | `selectEventType()` | 14931 |  |
| 249 | `toggleEventAllDay()` | 14937 |  |
| 250 | `toggleMoreOptions()` | 14943 |  |
| 251 | `saveCalendarEvent()` | 14950 | Yes |
| 252 | `showEventContextMenu()` | 15019 |  |
| 253 | `hideEventContextMenu()` | 15048 |  |
| 254 | `startEventLongPress()` | 15055 |  |
| 255 | `cancelEventLongPress()` | 15065 |  |
| 256 | `handleEventClick()` | 15073 |  |
| 257 | `modifyContextEvent()` | 15083 |  |
| 258 | `deleteContextEvent()` | 15090 | Yes |
| 259 | `openConnect()` | 15120 |  |
| 260 | `closeConnect()` | 15125 |  |
| 261 | `activateConnect()` | 15132 |  |
| 262 | `openConnectDrawer()` | 15142 |  |
| 263 | `closeConnectDrawer()` | 15198 |  |
| 264 | `acceptConnectJob()` | 15202 |  |
| 265 | `toggleTP()` | 15563 |  |
| 266 | `showThoughtProcess()` | 15564 |  |
| 267 | `collapseThoughtProcess()` | 15565 |  |
| 268 | `hideThoughtProcess()` | 15566 |  |

---

## operations/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `toast()` | 2247 |  |
| 2 | `initLanguage()` | 2364 |  |
| 3 | `t()` | 2376 |  |
| 4 | `applyLanguage()` | 2387 |  |
| 5 | `parseHashParams()` | 2431 |  |
| 6 | `initSupabase()` | 2457 |  |
| 7 | `setLoginStatus()` | 2480 |  |
| 8 | `clearLoginStatus()` | 2491 |  |
| 9 | `resetPassword()` | 2499 | Yes |
| 10 | `nextLoginStep()` | 2518 | Yes |
| 11 | `updateLoginUI()` | 2653 |  |
| 12 | `prevLoginStep()` | 2659 |  |
| 13 | `loadUserProfile()` | 2667 | Yes |
| 14 | `showEmailConfirmScreen()` | 2687 |  |
| 15 | `showPendingScreen()` | 2697 |  |
| 16 | `showAccessDeniedScreen()` | 2707 |  |
| 17 | `showPasswordResetScreen()` | 2752 |  |
| 18 | `redirectToTechnicianApp()` | 2761 |  |
| 19 | `checkApprovalStatus()` | 2765 | Yes |
| 20 | `resendConfirmation()` | 2805 | Yes |
| 21 | `backToLogin()` | 2819 |  |
| 22 | `logoutFromPending()` | 2834 | Yes |
| 23 | `setNewPassword()` | 2863 | Yes |
| 24 | `cancelPasswordReset()` | 2930 |  |
| 25 | `showMainApp()` | 2943 |  |
| 26 | `logout()` | 2958 | Yes |
| 27 | `initAuth()` | 2992 | Yes |
| 28 | `handleAuthenticatedUser()` | 3060 | Yes |
| 29 | `checkManagerAuth()` | 3090 | Yes |
| 30 | `managerLogout()` | 3126 | Yes |
| 31 | `cleanupSubscriptions()` | 3133 |  |
| 32 | `getInitials()` | 3147 |  |
| 33 | `getStatusBadge()` | 3153 |  |
| 34 | `formatTime()` | 3168 |  |
| 35 | `getProjectDuration()` | 3174 |  |
| 36 | `loadTeamMembers()` | 3186 | Yes |
| 37 | `loadProjects()` | 3309 | Yes |
| 38 | `loadPendingShares()` | 3460 | Yes |
| 39 | `loadAllData()` | 3491 | Yes |
| 40 | `updateV7TeamUI()` | 3503 |  |
| 41 | `updateV7ProjectsUI()` | 3573 |  |
| 42 | `updateMapMarkers()` | 3635 |  |
| 43 | `updateV7DashboardStats()` | 3661 |  |
| 44 | `openLiveProjectDrawer()` | 3691 |  |
| 45 | `calculateDuration()` | 3759 |  |
| 46 | `parseErrorCodes()` | 3776 |  |
| 47 | `calculateSectionProgress()` | 3793 |  |
| 48 | `getReportField()` | 3865 |  |
| 49 | `formatFieldValue()` | 3897 |  |
| 50 | `buildReportSection()` | 3905 |  |
| 51 | `dedupeArray()` | 3923 |  |
| 52 | `buildProgressRow()` | 3950 |  |
| 53 | `buildLiveProjectDrawerContent()` | 3966 |  |
| 54 | `initMap()` | 4630 |  |
| 55 | `renderMapProjectsList()` | 4656 |  |
| 56 | `renderProjectCards()` | 4674 |  |
| 57 | `renderTeamCards()` | 4697 |  |
| 58 | `renderTechListDropdown()` | 4731 |  |
| 59 | `flyToTechProject()` | 4751 |  |
| 60 | `openTechMapDrawer()` | 4775 |  |
| 61 | `closeTechMapDrawer()` | 4803 |  |
| 62 | `buildTechMapDrawerContent()` | 4810 |  |
| 63 | `openProjectFromTechDrawer()` | 4875 |  |
| 64 | `openTechChat()` | 4880 |  |
| 65 | `callTechnician()` | 4881 |  |
| 66 | `switchView()` | 4903 |  |
| 67 | `closeCalendar()` | 4917 |  |
| 68 | `setCalendarView()` | 4924 |  |
| 69 | `calendarPrev()` | 4938 |  |
| 70 | `calendarNext()` | 4953 |  |
| 71 | `renderCalendar()` | 4968 |  |
| 72 | `getCornerClass()` | 5018 |  |
| 73 | `openDayView()` | 5032 |  |
| 74 | `renderDayView()` | 5045 |  |
| 75 | `renderWeekView()` | 5086 |  |
| 76 | `toggleNotifications()` | 5126 |  |
| 77 | `dismissNotif()` | 5131 |  |
| 78 | `showProjectsPage()` | 5146 |  |
| 79 | `showTeamsPage()` | 5152 |  |
| 80 | `goToDashboard()` | 5158 |  |
| 81 | `showSettingsPage()` | 5165 |  |
| 82 | `openNotificationDetail()` | 5169 |  |
| 83 | `initDockTooltips()` | 5176 |  |
| 84 | `closePage()` | 5197 |  |
| 85 | `buildProjectDrawerContent()` | 5203 |  |
| 86 | `buildTechDrawerContent()` | 5248 |  |
| 87 | `openProjectDetail()` | 5313 |  |
| 88 | `openMapProjectDetail()` | 5326 |  |
| 89 | `closeMapDrawer()` | 5359 |  |
| 90 | `openTechDetail()` | 5366 |  |
| 91 | `openNestedProject()` | 5378 |  |
| 92 | `closeNestedDrawer()` | 5389 |  |
| 93 | `closeDrawer()` | 5393 |  |
| 94 | `openProfileDrawer()` | 5399 |  |
| 95 | `closeProfileDrawer()` | 5403 |  |
| 96 | `openInviteDrawer()` | 5407 |  |
| 97 | `openNewProject()` | 5427 |  |
| 98 | `selectTechForProject()` | 5497 |  |
| 99 | `setNewProjAvail()` | 5516 |  |
| 100 | `selectTimeSlot()` | 5522 |  |
| 101 | `filterProjects()` | 5534 |  |
| 102 | `filterTeams()` | 5543 |  |
| 103 | `setProjectFilter()` | 5552 |  |
| 104 | `setTeamFilter()` | 5566 |  |
| 105 | `showCalendar()` | 5591 |  |
| 106 | `initV7UI()` | 5594 |  |

---

## master/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `initMermaid()` | 1297 |  |
| 2 | `renderMermaidDiagrams()` | 1337 | Yes |
| 3 | `supabaseQuery()` | 1434 | Yes |
| 4 | `supabaseUpdate()` | 1446 | Yes |
| 5 | `setConnectionStatus()` | 1453 |  |
| 6 | `loadAllData()` | 1461 | Yes |
| 7 | `loadProjectMessages()` | 1529 | Yes |
| 8 | `getInitials()` | 1579 |  |
| 9 | `formatStatus()` | 1580 |  |
| 10 | `formatDate()` | 1581 |  |
| 11 | `formatTimeAgo()` | 1582 |  |
| 12 | `parseMarkdown()` | 1585 |  |
| 13 | `restoreMermaid()` | 1604 |  |
| 14 | `renderExtractionCard()` | 1764 |  |
| 15 | `escapeHtml()` | 1807 |  |
| 16 | `processBasicMarkdown()` | 1811 |  |
| 17 | `restoreImages()` | 1823 |  |
| 18 | `openImageViewer()` | 1830 |  |
| 19 | `renderOCRCard()` | 1835 |  |
| 20 | `renderOCRTable()` | 1908 |  |
| 21 | `parseOCRText()` | 1949 |  |
| 22 | `toggleOCRRaw()` | 2001 |  |
| 23 | `renderStructuredReport()` | 2010 |  |
| 24 | `updateDashboard()` | 2163 |  |
| 25 | `updateTechniciansListHome()` | 2178 |  |
| 26 | `renderEnterprisesHome()` | 2187 |  |
| 27 | `buildEnterpriseCard()` | 2196 |  |
| 28 | `updateSettingsPage()` | 2252 |  |
| 29 | `goHome()` | 2259 |  |
| 30 | `openPage()` | 2260 |  |
| 31 | `closePage()` | 2261 |  |
| 32 | `buildTechnicianCard()` | 2264 |  |
| 33 | `buildProjectCard()` | 2409 |  |
| 34 | `openHomeDrawer()` | 2462 |  |
| 35 | `suspendEnterprise()` | 2503 |  |
| 36 | `closeHomeDrawer()` | 2508 |  |
| 37 | `accessTechnicianAccount()` | 2517 | Yes |
| 38 | `openPageDrawer()` | 2576 |  |
| 39 | `closePageDrawer()` | 2614 |  |
| 40 | `buildTechnicianDrawerContent()` | 2616 |  |
| 41 | `buildEnterpriseDrawerContent()` | 2699 |  |
| 42 | `toggleStatusDropdown()` | 2782 |  |
| 43 | `selectStatusFromDropdown()` | 2794 |  |
| 44 | `selectStatus()` | 2818 |  |
| 45 | `toggleUserExpand()` | 2822 |  |
| 46 | `openProjectView()` | 2831 | Yes |
| 47 | `renderChatMessages()` | 2879 |  |
| 48 | `closeProjectView()` | 2941 |  |
| 49 | `toggleSplit()` | 2957 |  |
| 50 | `enableSplitView()` | 2966 |  |
| 51 | `disableSplitView()` | 2976 |  |
| 52 | `startDrag()` | 2998 |  |
| 53 | `drag()` | 3001 |  |
| 54 | `stopDrag()` | 3016 |  |
| 55 | `openReportSheet()` | 3019 |  |
| 56 | `calculateReportCompletion()` | 3032 |  |
| 57 | `renderReportPreview()` | 3054 |  |
| 58 | `closeReportSheet()` | 3201 |  |
| 59 | `populateUsersList()` | 3207 |  |
| 60 | `populateEnterprisesList()` | 3224 |  |
| 61 | `filterEnterprises()` | 3236 |  |
| 62 | `filterUsersByRole()` | 3251 |  |
| 63 | `updateUserCounts()` | 3260 |  |
| 64 | `filterUsers()` | 3271 |  |
| 65 | `quickApprove()` | 3279 | Yes |
| 66 | `quickReject()` | 3338 | Yes |
| 67 | `saveStatus()` | 3375 | Yes |
| 68 | `formatStatusExtended()` | 3498 |  |
| 69 | `loadEmailHistory()` | 3510 | Yes |
| 70 | `renderEmailItem()` | 3547 |  |
| 71 | `toggleEmailExpand()` | 3602 |  |
| 72 | `loadEmailClicks()` | 3607 | Yes |
| 73 | `toggleSignatureField()` | 3637 |  |
| 74 | `sendEmailToUser()` | 3644 | Yes |
| 75 | `showEmailToast()` | 3740 |  |
| 76 | `escapeHtmlEmail()` | 3755 |  |
| 77 | `initSupabase()` | 3774 |  |
| 78 | `initAuth()` | 3792 | Yes |
| 79 | `handleAuthenticatedUser()` | 3812 | Yes |
| 80 | `loadUserProfile()` | 3838 | Yes |
| 81 | `nextLoginStep()` | 3854 | Yes |
| 82 | `prevLoginStep()` | 3943 |  |
| 83 | `updateLoginUI()` | 3951 |  |
| 84 | `showLoginScreen()` | 3962 |  |
| 85 | `showAccessDeniedScreen()` | 3975 |  |
| 86 | `showMainApp()` | 3987 |  |
| 87 | `logout()` | 4007 | Yes |
| 88 | `accessTechnicianAccount()` | 4022 | Yes |
| 89 | `setLoginStatus()` | 4095 |  |
| 90 | `clearLoginStatus()` | 4101 |  |
| 91 | `toast()` | 4108 |  |

---

## manager/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `initLanguage()` | 1238 |  |
| 2 | `t()` | 1250 |  |
| 3 | `applyLanguage()` | 1260 |  |
| 4 | `parseHashParams()` | 1298 |  |
| 5 | `initSupabase()` | 1324 |  |
| 6 | `setLoginStatus()` | 1347 |  |
| 7 | `clearLoginStatus()` | 1358 |  |
| 8 | `resetPassword()` | 1366 | Yes |
| 9 | `nextLoginStep()` | 1385 | Yes |
| 10 | `updateLoginUI()` | 1517 |  |
| 11 | `prevLoginStep()` | 1523 |  |
| 12 | `loadUserProfile()` | 1531 | Yes |
| 13 | `showEmailConfirmScreen()` | 1551 |  |
| 14 | `showPendingScreen()` | 1561 |  |
| 15 | `showAccessDeniedScreen()` | 1571 |  |
| 16 | `showPasswordResetScreen()` | 1581 |  |
| 17 | `redirectToTechnicianApp()` | 1590 |  |
| 18 | `checkApprovalStatus()` | 1594 | Yes |
| 19 | `resendConfirmation()` | 1634 | Yes |
| 20 | `backToLogin()` | 1648 |  |
| 21 | `logoutFromPending()` | 1663 | Yes |
| 22 | `setNewPassword()` | 1688 | Yes |
| 23 | `cancelPasswordReset()` | 1755 |  |
| 24 | `showMainApp()` | 1768 |  |
| 25 | `logout()` | 1779 | Yes |
| 26 | `initAuth()` | 1808 | Yes |
| 27 | `handleAuthenticatedUser()` | 1876 | Yes |
| 28 | `checkManagerAuth()` | 1906 | Yes |
| 29 | `managerLogout()` | 1942 | Yes |
| 30 | `loadTeamMembers()` | 1949 | Yes |
| 31 | `loadProjects()` | 2068 | Yes |
| 32 | `loadPendingShares()` | 2147 | Yes |
| 33 | `showPendingSharesNotification()` | 2175 |  |
| 34 | `acceptAvailabilityShare()` | 2183 | Yes |
| 35 | `rejectAvailabilityShare()` | 2238 | Yes |
| 36 | `setupRealtimeSubscriptions()` | 2257 | Yes |
| 37 | `cleanupSubscriptions()` | 2334 |  |
| 38 | `handleNewMessage()` | 2343 |  |
| 39 | `showNewShareNotification()` | 2356 |  |
| 40 | `sendTeamMessage()` | 2363 | Yes |
| 41 | `inviteInterneTechnician()` | 2386 | Yes |
| 42 | `getInitials()` | 2453 |  |
| 43 | `getStatusBadge()` | 2459 |  |
| 44 | `formatTime()` | 2473 |  |
| 45 | `getProjectDuration()` | 2479 |  |
| 46 | `updateTeamUI()` | 2491 |  |
| 47 | `updateProjectsUI()` | 2522 |  |
| 48 | `updateDashboardStats()` | 2547 |  |
| 49 | `showAvailabilityShareModal()` | 2575 |  |
| 50 | `closeAvailabilityShareModal()` | 2620 |  |
| 51 | `loadAllData()` | 2628 | Yes |
| 52 | `initManagerApp()` | 2636 | Yes |
| 53 | `toast()` | 2687 |  |
| 54 | `setHomeCalView()` | 2695 |  |
| 55 | `navHomeCal()` | 2702 |  |
| 56 | `renderHomeCalendar()` | 2704 |  |
| 57 | `buildDayView()` | 2720 |  |
| 58 | `buildWeekView()` | 2741 |  |
| 59 | `buildMonthView()` | 2781 |  |
| 60 | `goToDayView()` | 2790 |  |
| 61 | `openProjectFromCal()` | 2800 |  |
| 62 | `openHomeDrawer()` | 2809 |  |
| 63 | `closeHomeDrawer()` | 2836 |  |
| 64 | `openHomeNestedProject()` | 2841 |  |
| 65 | `closeHomeNestedDrawer()` | 2854 |  |
| 66 | `openPage()` | 2858 |  |
| 67 | `closePage()` | 2865 |  |
| 68 | `goHome()` | 2871 |  |
| 69 | `openPageDrawer()` | 2873 |  |
| 70 | `closePageDrawer()` | 2898 |  |
| 71 | `selectProject()` | 2902 |  |
| 72 | `openReportDrawer()` | 2908 |  |
| 73 | `closeReportDrawer()` | 2918 |  |
| 74 | `buildReportPreview()` | 2923 |  |
| 75 | `selectTech()` | 2978 |  |
| 76 | `openNestedProject()` | 2994 |  |
| 77 | `closeNestedDrawer()` | 3007 |  |
| 78 | `buildProjectContent()` | 3012 |  |
| 79 | `buildTechContent()` | 3041 |  |
| 80 | `buildSmallAvailability()` | 3055 |  |
| 81 | `setAvailView()` | 3068 |  |
| 82 | `buildAvailDay()` | 3087 |  |
| 83 | `buildAvailWeek()` | 3099 |  |
| 84 | `buildAvailMonth()` | 3110 |  |
| 85 | `buildCalendarDrawerContent()` | 3123 |  |
| 86 | `setDrawerCalView()` | 3136 |  |
| 87 | `buildCreateProjectContent()` | 3146 |  |
| 88 | `selectTechForProject()` | 3156 |  |
| 89 | `onProjectDateChange()` | 3180 |  |
| 90 | `buildAddTechContent()` | 3201 |  |
| 91 | `handleInviteClick()` | 3217 | Yes |
| 92 | `showInvitationSuccessModal()` | 3243 |  |
| 93 | `copyInviteLink()` | 3297 |  |
| 94 | `closeInviteSuccessModal()` | 3304 |  |
| 95 | `buildChatInput()` | 3308 |  |
| 96 | `initChatHandlers()` | 3339 |  |
| 97 | `handleChatInput()` | 3347 |  |
| 98 | `handleKeydown()` | 3364 |  |
| 99 | `handleAction()` | 3372 |  |
| 100 | `sendMessage()` | 3387 |  |
| 101 | `toggleAttach()` | 3407 |  |
| 102 | `closeAllAttach()` | 3413 |  |
| 103 | `attachAction()` | 3417 |  |
| 104 | `handleFileSelect()` | 3429 |  |
| 105 | `addPhotoToChat()` | 3456 |  |
| 106 | `deletePhotoMsg()` | 3496 |  |
| 107 | `extractFromPhoto()` | 3504 |  |
| 108 | `addToReport()` | 3509 |  |
| 109 | `openImageViewer()` | 3519 |  |
| 110 | `closeImageViewer()` | 3526 |  |
| 111 | `startRecording()` | 3531 | Yes |
| 112 | `updateWaveform()` | 3582 |  |
| 113 | `updateVoiceTimer()` | 3607 |  |
| 114 | `stopRecording()` | 3618 |  |
| 115 | `transcribeWithElevenLabs()` | 3682 | Yes |
| 116 | `openReportSheet()` | 3744 |  |
| 117 | `closeReportSheet()` | 3755 |  |
| 118 | `buildReportPreview()` | 3760 |  |
| 119 | `approveReport()` | 3783 |  |

---

## admin/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `initLanguage()` | 1111 |  |
| 2 | `t()` | 1123 |  |
| 3 | `applyLanguage()` | 1134 |  |
| 4 | `parseHashParams()` | 1178 |  |
| 5 | `initSupabase()` | 1204 |  |
| 6 | `setLoginStatus()` | 1227 |  |
| 7 | `clearLoginStatus()` | 1238 |  |
| 8 | `resetPassword()` | 1246 | Yes |
| 9 | `nextLoginStep()` | 1265 | Yes |
| 10 | `updateLoginUI()` | 1400 |  |
| 11 | `prevLoginStep()` | 1406 |  |
| 12 | `loadUserProfile()` | 1414 | Yes |
| 13 | `showEmailConfirmScreen()` | 1434 |  |
| 14 | `showPendingScreen()` | 1444 |  |
| 15 | `showAccessDeniedScreen()` | 1454 |  |
| 16 | `showPasswordResetScreen()` | 1499 |  |
| 17 | `redirectToTechnicianApp()` | 1508 |  |
| 18 | `checkApprovalStatus()` | 1512 | Yes |
| 19 | `resendConfirmation()` | 1552 | Yes |
| 20 | `backToLogin()` | 1566 |  |
| 21 | `logoutFromPending()` | 1581 | Yes |
| 22 | `setNewPassword()` | 1610 | Yes |
| 23 | `cancelPasswordReset()` | 1677 |  |
| 24 | `showMainApp()` | 1690 |  |
| 25 | `logout()` | 1701 | Yes |
| 26 | `initAuth()` | 1735 | Yes |
| 27 | `handleAuthenticatedUser()` | 1803 | Yes |
| 28 | `checkManagerAuth()` | 1833 | Yes |
| 29 | `managerLogout()` | 1869 | Yes |
| 30 | `loadTeamMembers()` | 1876 | Yes |
| 31 | `loadProjects()` | 1995 | Yes |
| 32 | `loadPendingShares()` | 2074 | Yes |
| 33 | `showPendingSharesNotification()` | 2102 |  |
| 34 | `acceptAvailabilityShare()` | 2110 | Yes |
| 35 | `rejectAvailabilityShare()` | 2165 | Yes |
| 36 | `setupRealtimeSubscriptions()` | 2184 | Yes |
| 37 | `cleanupSubscriptions()` | 2261 |  |
| 38 | `handleNewMessage()` | 2270 |  |
| 39 | `showNewShareNotification()` | 2283 |  |
| 40 | `sendTeamMessage()` | 2290 | Yes |
| 41 | `inviteInterneTechnician()` | 2313 | Yes |
| 42 | `getInitials()` | 2380 |  |
| 43 | `getStatusBadge()` | 2386 |  |
| 44 | `formatTime()` | 2400 |  |
| 45 | `getProjectDuration()` | 2406 |  |
| 46 | `updateTeamUI()` | 2418 |  |
| 47 | `updateProjectsUI()` | 2449 |  |
| 48 | `updateDashboardStats()` | 2474 |  |
| 49 | `showAvailabilityShareModal()` | 2502 |  |
| 50 | `closeAvailabilityShareModal()` | 2547 |  |
| 51 | `loadAllData()` | 2555 | Yes |
| 52 | `initManagerApp()` | 2563 | Yes |
| 53 | `toast()` | 2616 |  |
| 54 | `setHomeCalView()` | 2624 |  |
| 55 | `navHomeCal()` | 2631 |  |
| 56 | `renderHomeCalendar()` | 2633 |  |
| 57 | `buildDayView()` | 2649 |  |
| 58 | `buildWeekView()` | 2670 |  |
| 59 | `buildMonthView()` | 2710 |  |
| 60 | `goToDayView()` | 2719 |  |
| 61 | `openProjectFromCal()` | 2729 |  |
| 62 | `openHomeDrawer()` | 2738 |  |
| 63 | `closeHomeDrawer()` | 2771 |  |
| 64 | `openHomeNestedProject()` | 2776 |  |
| 65 | `closeHomeNestedDrawer()` | 2789 |  |
| 66 | `openPage()` | 2793 |  |
| 67 | `closePage()` | 2800 |  |
| 68 | `goHome()` | 2806 |  |
| 69 | `openPageDrawer()` | 2808 |  |
| 70 | `closePageDrawer()` | 2833 |  |
| 71 | `selectProject()` | 2837 |  |
| 72 | `selectTech()` | 2850 |  |
| 73 | `openNestedProject()` | 2866 |  |
| 74 | `closeNestedDrawer()` | 2879 |  |
| 75 | `buildProjectContent()` | 2884 |  |
| 76 | `buildTechContent()` | 2913 |  |
| 77 | `buildSmallAvailability()` | 2927 |  |
| 78 | `setAvailView()` | 2940 |  |
| 79 | `buildAvailDay()` | 2959 |  |
| 80 | `buildAvailWeek()` | 2971 |  |
| 81 | `buildAvailMonth()` | 2982 |  |
| 82 | `buildCalendarDrawerContent()` | 2995 |  |
| 83 | `setDrawerCalView()` | 3008 |  |
| 84 | `buildCreateProjectContent()` | 3018 |  |
| 85 | `selectTechForProject()` | 3028 |  |
| 86 | `onProjectDateChange()` | 3052 |  |
| 87 | `buildAddTechContent()` | 3073 |  |
| 88 | `handleInviteClick()` | 3089 | Yes |
| 89 | `showInvitationSuccessModal()` | 3115 |  |
| 90 | `copyInviteLink()` | 3169 |  |
| 91 | `closeInviteSuccessModal()` | 3176 |  |
| 92 | `buildChatInput()` | 3180 |  |
| 93 | `initChatHandlers()` | 3211 |  |
| 94 | `handleChatInput()` | 3219 |  |
| 95 | `handleKeydown()` | 3236 |  |
| 96 | `handleAction()` | 3244 |  |
| 97 | `sendMessage()` | 3259 |  |
| 98 | `toggleAttach()` | 3279 |  |
| 99 | `closeAllAttach()` | 3285 |  |
| 100 | `attachAction()` | 3289 |  |
| 101 | `handleFileSelect()` | 3301 |  |
| 102 | `addPhotoToChat()` | 3328 |  |
| 103 | `deletePhotoMsg()` | 3368 |  |
| 104 | `extractFromPhoto()` | 3376 |  |
| 105 | `addToReport()` | 3381 |  |
| 106 | `openImageViewer()` | 3391 |  |
| 107 | `closeImageViewer()` | 3398 |  |
| 108 | `startRecording()` | 3403 | Yes |
| 109 | `updateWaveform()` | 3454 |  |
| 110 | `updateVoiceTimer()` | 3479 |  |
| 111 | `stopRecording()` | 3490 |  |
| 112 | `transcribeWithElevenLabs()` | 3554 | Yes |

---

## auth/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `initLanguage()` | 914 |  |
| 2 | `t()` | 931 |  |
| 3 | `applyLanguage()` | 945 |  |
| 4 | `initSupabase()` | 996 |  |
| 5 | `goToScreen()` | 1018 |  |
| 6 | `showStatus()` | 1033 |  |
| 7 | `showInlineMessage()` | 1042 |  |
| 8 | `updateLoginUI()` | 1074 |  |
| 9 | `prevLoginStep()` | 1094 |  |
| 10 | `nextLoginStep()` | 1102 | Yes |
| 11 | `login()` | 1232 | Yes |
| 12 | `redirectByRole()` | 1286 |  |
| 13 | `saveLeadEmail()` | 1313 | Yes |
| 14 | `saveLeadType()` | 1337 | Yes |
| 15 | `selectUserType()` | 1356 |  |
| 16 | `continueToSignup()` | 1367 | Yes |
| 17 | `signupTechnician()` | 1386 | Yes |
| 18 | `signupEnterprise()` | 1481 | Yes |
| 19 | `showPasswordReset()` | 1583 |  |
| 20 | `sendResetEmail()` | 1588 | Yes |
| 21 | `isValidPhoneNumber()` | 1638 |  |
| 22 | `checkApprovalStatus()` | 1643 | Yes |
| 23 | `logout()` | 1689 | Yes |
| 24 | `init()` | 1698 | Yes |

---

## r/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `showScreen()` | 517 |  |
| 2 | `showError()` | 524 |  |
| 3 | `showStatus()` | 529 |  |
| 4 | `launchConfetti()` | 538 |  |
| 5 | `animate()` | 560 |  |
| 6 | `init()` | 595 | Yes |
| 7 | `createAccount()` | 662 | Yes |

---

## invite/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `initLanguage()` | 457 |  |
| 2 | `t()` | 469 |  |
| 3 | `applyLanguage()` | 480 |  |
| 4 | `showScreen()` | 510 |  |
| 5 | `showError()` | 517 |  |
| 6 | `showStatus()` | 522 |  |
| 7 | `init()` | 528 | Yes |
| 8 | `createAccount()` | 600 | Yes |

---

## debug/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `log()` | 294 |  |
| 2 | `logData()` | 305 |  |
| 3 | `clearLogs()` | 316 |  |
| 4 | `setStatus()` | 320 |  |
| 5 | `safeQuery()` | 329 | Yes |
| 6 | `testSupabaseConnection()` | 360 | Yes |
| 7 | `testSupabaseConnectionWithLock()` | 391 | Yes |
| 8 | `testEmailExists()` | 431 | Yes |
| 9 | `testEmailExistsSimple()` | 502 | Yes |
| 10 | `testEmailExistsRaw()` | 542 | Yes |
| 11 | `testSession()` | 582 | Yes |
| 12 | `testSessionStorage()` | 621 |  |
| 13 | `testLogin()` | 661 | Yes |
| 14 | `testLogout()` | 727 | Yes |
| 15 | `simulateFullFlow()` | 744 | Yes |
| 16 | `simulateFixedFlow()` | 831 | Yes |
| 17 | `showLocalStorage()` | 910 |  |
| 18 | `clearAuthStorage()` | 940 |  |
| 19 | `clearAllStorage()` | 954 |  |

---



---


<a id="audit_05_global_variables"></a>

# AUDIT_05 - Global Variables

## Technician App (technician/index.html)

### Configuration Constants
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 1 | `PRODUCTION_MODE` | 6592 | boolean | Controls console.log suppression |
| 2 | `isSafari` | 6608 | boolean | Browser detection |
| 3 | `isIOS` | 6609 | boolean | Platform detection |
| 4 | `isMobile` | 6610 | boolean | Mobile device detection |
| 5 | `SUPABASE_URL` | 7071 | string | Supabase project URL |
| 6 | `SUPABASE_ANON_KEY` | 7072 | string | Supabase public anon key |
| 7 | `API_BASE` | 7775 | string | n8n webhook base URL |
| 8 | `colors` | 7779 | object | Brand color mapping |
| 9 | `names` | 7780 | object | Brand name mapping |
| 10 | `BRAND_ERROR_EXAMPLES` | 6977 | object | Error examples per brand |
| 11 | `translations` | 6704 | object | i18n translation strings |
| 12 | `REPORT_STATUS` | 7346 | object | Report status constants |
| 13 | `MAX_BARS` | 9655 | number | Voice waveform bars |
| 14 | `MIN_HEIGHT` | 9656 | number | Waveform min height |
| 15 | `MAX_HEIGHT` | 9657 | number | Waveform max height |
| 16 | `SILENCE_THRESHOLD` | 9658 | number | Voice silence threshold |
| 17 | `REPLACE_ARRAYS` | 13550 | Set | Array fields to replace (not merge) |
| 18 | `DRAWER_MAX_UNDO` | 14469 | number | Max undo stack depth |
| 19 | `FREEMIUM_CONFIG` | 18666 | object | Freemium system configuration |

### Webhook URLs
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 20 | `WEBHOOKS.copilot` | 9759 | string | Copilot webhook URL |
| 21 | `WEBHOOKS.assistant` | 9760 | string | Assistant webhook URL (DEV) |
| 22 | `EXTRACTION_WEBHOOK` | 9762 | string | Extraction webhook URL (DEV) |
| 23 | `OCR_WEBHOOK_URL` | 17220 | string | OCR webhook URL |

### Mutable State - Core
| # | Variable | Line | Type | Purpose | Modified By |
|---|----------|------|------|---------|-------------|
| 24 | `db` | 7074 | SupabaseClient | Supabase client instance | init() |
| 25 | `supabaseReady` | 7075 | boolean | Supabase init status | waitForSupabase() |
| 26 | `mermaidReady` | 7078 | boolean | Mermaid init status | initMermaid() |
| 27 | `currentUser` | 7776 | object | Current user profile | loadUserDashboard() |
| 28 | `supabaseUser` | 7777 | object | Supabase auth user | nextLoginStep() |
| 29 | `cachedApiKeys` | 7783 | object | Cached API keys from app_settings | getApiKey() |
| 30 | `currentUserId` | 9793 | string | Current user UUID | getCurrentUserId() |
| 31 | `currentProjectId` | 9794 | string | Active project UUID | loadProject(), ensureProject() |

### Mutable State - UI
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 32 | `brand` | 6689 | string | Current HVAC brand (default: mitsubishi) |
| 33 | `mode` | 6690 | string | Current mode (copilot/assistant) |
| 34 | `isSplit` | 6691 | boolean | Split view active |
| 35 | `isConnected` | 6692 | boolean | Connection status |
| 36 | `isConnecting` | 6693 | boolean | Connection in progress |
| 37 | `isDisconnecting` | 6694 | boolean | Disconnection in progress |
| 38 | `chatOpen` | 6695 | boolean | Chat panel open |
| 39 | `currentPhotoPanel` | 6696 | string | Which panel photo is for |
| 40 | `currentPage` | 6697 | string | Current page/screen |
| 41 | `currentTheme` | 6700 | string | Dark/light theme |
| 42 | `currentLang` | 6701 | string | FR/EN language |

### Mutable State - Onboarding
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 43 | `onboardingStep` | 6970 | number | Current onboarding step |
| 44 | `onboardingComplete` | 6971 | boolean | Onboarding finished |
| 45 | `step3Done` | 6972 | boolean | Step 3 completed |
| 46 | `step4Done` | 6973 | boolean | Step 4 completed |
| 47 | `onboardingBrand` | 6974 | string | Brand selected in onboarding |

### Mutable State - Auth/Login
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 48 | `loginStep` | 8023 | number | Login wizard step |
| 49 | `existingUserData` | 8024 | object | User data during login |
| 50 | `toastTimeout` | 7330 | timeout | Toast notification timer |

### Mutable State - Report
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 51 | `lastReportData` | 11096 | object | Current report data (THE MAIN STATE) |
| 52 | `reportCompletionState` | 7351 | object | Report completion tracking |
| 53 | `pendingNewFields` | 7626 | array | Fields waiting for user acceptance |
| 54 | `reportIsCompleted` | 14464 | boolean | Whether report is marked complete |
| 55 | `_saveTimeout` | 13663 | timeout | Debounced save timer |
| 56 | `_pendingSaveData` | 13664 | object | Data pending save |

### Mutable State - Drawer
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 57 | `drawerDraggedElement` | 14460 | element | Currently dragged element |
| 58 | `drawerActiveEditable` | 14461 | element | Currently focused editable |
| 59 | `drawerNumCounter` | 14462 | number | Counter for numbering |
| 60 | `drawerAutoSaveTimeout` | 14463 | timeout | Auto-save debounce timer |
| 61 | `drawerUndoStack` | 14467 | array | Undo history |
| 62 | `drawerRedoStack` | 14468 | array | Redo history |

### Mutable State - Voice/Audio
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 63 | `recordings` | 9660 | object | Active recordings by panel |
| 64 | `audioContexts` | 9661 | object | Audio contexts by panel |
| 65 | `analysers` | 9662 | object | Audio analysers by panel |
| 66 | `waveformIntervals` | 9663 | object | Waveform animation intervals |
| 67 | `voiceTimers` | 9664 | object | Voice recording timers |
| 68 | `simulatedSpeaking` | 9665 | object | Simulated speaking state |
| 69 | `simulatedIntensityTarget` | 9666 | object | Voice intensity targets |
| 70 | `simulatedIntensityCurrent` | 9667 | object | Current voice intensity |

### Mutable State - Projects/Chat
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 71 | `projectMessageCount` | 9799 | number | Messages in current project |
| 72 | `contextMenuProjectId` | 10037 | string | Project ID for context menu |
| 73 | `currentProjectTitle` | 10038 | string | Current project title |
| 74 | `longPressTimer` | 10160 | timeout | Long press detection timer |
| 75 | `longPressTriggered` | 10161 | boolean | Long press was triggered |
| 76 | `openingFromProject` | 9242 | boolean | Opening chat from project list |

### Mutable State - Photos/Signature
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 77 | `pendingReportPhoto` | 17833 | object | Photo waiting to be added |
| 78 | `signatureContext` | 17888 | CanvasContext | Signature canvas context |
| 79 | `isDrawing` | 17889 | boolean | Drawing on signature canvas |
| 80 | `currentSignatureType` | 17890 | string | Which signature field |

### Mutable State - Hotline/Connect
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 81 | `elevenLabsConversation` | 18347 | object | ElevenLabs conversation instance |
| 82 | `elevenLabsSDKReady` | 18348 | boolean | SDK loaded |

### Mutable State - Layout
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 83 | `divider` | 18547 | element | Split view divider |
| 84 | `pC` | 18548 | element | Copilot panel element |
| 85 | `pA` | 18549 | element | Assistant panel element |
| 86 | `isDrag` | 18550 | boolean | Divider being dragged |
| 87 | `touchX` | 18604 | number | Touch X coordinate |

### Mutable State - Freemium
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 88 | `paymentPollInterval` | 19201 | interval | Stripe payment polling timer |

### Mutable State - Live Status
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 89 | `idleTimer` | 8365 | timeout | Idle detection timer |
| 90 | `currentLiveStatus` | 8366 | string | Current online status |

---

## Critical State Dependencies

The most important state variable is `lastReportData` (line 11096). It is:
- **Read by:** updateDrawerPreview(), calculateReportCompletion(), buildPartialReport(), renderReport(), generateWord(), generatePDF(), exportReport(), drawerAutoSave(), confirmReportCompletion(), showCompletionPopup()
- **Written by:** loadProject() (from Supabase), mergeReportData() (from AI response), drawerExtractDataFromDOM() (from DOM edits)
- **Persisted to:** Supabase `projects.extracted_data` column

**This is the single source of truth for the report and the #1 cause of bugs in the system.**

---

## Total Global Variables: ~90 in technician app

### Other Apps (Summary)
| App | Approx Global Variables | Notable |
|-----|------------------------|---------|
| index.html | ~70 | Shares most with technician |
| docs/index.html | ~75 | Shares most with technician + ElevenLabs vars |
| operations/index.html | ~40 | Map markers, team data |
| master/index.html | ~30 | User list, project data |
| manager/index.html | ~35 | Team members, realtime subscriptions |
| admin/index.html | ~35 | Same as manager |
| auth/index.html | ~10 | Login state only |


---


<a id="audit_06_dom_elements"></a>

# AUDIT_06 - DOM Elements

## Technician App - Key DOM Elements by Section

### Total Static Element IDs: ~200

---

### Login Screen
| ID | Type | Purpose |
|----|------|---------|
| loginScreen | div | Login screen container |
| loginSlider | div | Login step slider |
| loginEmail | input | Email input |
| loginPassword | input | Password input |
| loginBtn | button | Login/next button |
| loginBack | button | Back button |
| loginStatus | div | Status messages |
| loginSphere | div | Animated login sphere |
| pulseSphere | div | Pulse animation sphere |

### Main App Shell
| ID | Type | Purpose |
|----|------|---------|
| mainApp | div | Main app container (hidden during login) |
| homePage | div | Home page view |
| homepageContent | div | Home page content |
| chatView | div | Chat interface view |
| chatEmpty | div | Empty chat placeholder |
| profileView | div | Profile view |
| connectView | div | Connect feature view |
| hotlineView | div | Hotline feature view |
| projectsPage | div | Projects list page |

### Navigation Bar
| ID | Type | Purpose |
|----|------|---------|
| navHome | div | Home nav button |
| navProjects | div | Projects nav button |
| navConnect | div | Connect nav button |

### Chat Panels - Copilot
| ID | Type | Purpose |
|----|------|---------|
| panelCopilot | div | Copilot panel container |
| copilotBody | div | Copilot message area |
| copilotInput | textarea | Copilot text input |
| copilotActionBtn | button | Send/voice button |
| copilotBars | div | Voice waveform bars |
| copilotWaveform | div | Voice waveform container |
| copilotTimer | div | Recording timer |
| copilotTranscriptionSphere | div | Transcription animation |
| copilotProjectName | span | Current project name |
| copilotProjectSep | span | Project name separator |
| copilotSub | span | Panel subtitle |
| copilotBrandDropdown | div | Brand selector dropdown |
| copilotBrandWrapper | div | Brand selector wrapper |
| copilotInputRow | div | Input row container |
| attachCopilot | div | Attachment menu |
| scrollBtnCopilot | button | Scroll to bottom |

### Chat Panels - Assistant
| ID | Type | Purpose |
|----|------|---------|
| panelAssistant | div | Assistant panel container |
| assistantBody | div | Assistant message area |
| assistantInput | textarea | Assistant text input |
| assistantActionBtn | button | Send/voice button |
| assistantBars | div | Voice waveform bars |
| assistantWaveform | div | Voice waveform container |
| assistantTimer | div | Recording timer |
| assistantTranscriptionSphere | div | Transcription animation |
| assistantProjectName | span | Current project name |
| assistantProjectSep | span | Project name separator |
| assistantSub | span | Panel subtitle |
| assistantBrandDropdown | div | Brand selector dropdown |
| assistantBrandWrapper | div | Brand selector wrapper |
| assistantInputRow | div | Input row container |
| attachAssistant | div | Attachment menu |
| scrollBtnAssistant | button | Scroll to bottom |

### Brand Selection
| ID | Type | Purpose |
|----|------|---------|
| brandPill | div | Brand pill button |
| brandDropdown | div | Brand dropdown menu |
| brandDot | div | Brand color dot |
| brandText | span | Brand name text |
| brandSelectInline | div | Inline brand selector (onboarding) |

### Report Drawer
| ID | Type | Purpose |
|----|------|---------|
| reportSheet | div | Report drawer sheet |
| reportBackdrop | div | Report backdrop overlay |
| reportPreviewContainer | div | Report preview scroll area |
| reportPreviewContent | div | Report content container |
| reportPreviewEmpty | div | Empty state message |
| reportFooter | div | Report action buttons |
| reportHeaderProgress | div | Progress header |
| reportProgressFill | div | Progress bar fill |
| reportProgressText | span | Progress percentage text |
| rptDoc | div | Report document content |
| autosaveIndicator | div | Auto-save status indicator |
| fontToolbar | div | Floating font toolbar |

### Report Data Sections
| ID | Type | Purpose |
|----|------|---------|
| codes-defaut-list | div | Error codes list |
| adressage-tbody | tbody | Addressing table body |
| travaux-list | div | Completed work list |
| travaux-prevoir-list | div | Planned work list |
| mesures-list | div | Measurements list |
| reserves-list | div | Reserves list |
| pieces-list | div | Parts list |

### Photos
| ID | Type | Purpose |
|----|------|---------|
| cameraInput | input | Camera capture input |
| fileInput | input | File upload input |
| photoUploadInput | input | Photo upload input |
| photoUploadInputV12 | input | V12 photo upload input |
| sortablePhotos | div | Sortable photos container |
| sortablePhotosV12 | div | V12 sortable photos |
| photoNameModal | div | Photo naming modal |
| photoNameInput | input | Photo name input |
| photoNamePreviewImg | img | Photo name preview |
| imageViewer | div | Full-screen image viewer |
| imageViewerImg | img | Image viewer image |

### Signature
| ID | Type | Purpose |
|----|------|---------|
| signatureModal | div | Signature modal overlay |
| signatureCanvas | canvas | Signature drawing canvas |
| signatureModalTitle | div | Signature modal title |
| sigAreaTech | div | Technician signature area |
| sigAreaClient | div | Client signature area |
| sigNameTech | div | Technician name display |
| sigNameClient | div | Client name display |

### Font Toolbar
| ID | Type | Purpose |
|----|------|---------|
| ftBold | button | Bold toggle |
| ftItalic | button | Italic toggle |
| ftUnderline | button | Underline toggle |
| ftAlignLeft | button | Left align |
| ftAlignCenter | button | Center align |
| ftJustify | button | Justify align |
| ftBlockType | button | Block type selector |

### Onboarding
| ID | Type | Purpose |
|----|------|---------|
| onboardingSection | div | Onboarding section container |
| onboardingCard | div | Onboarding card |
| onboardingSteps | div | Steps container |
| onboardingProgress | div | Progress indicator |
| step1-step4 | div | Individual step elements |
| step1Check-step4Check | div | Step completion checkmarks |

### Stats/Gamification
| ID | Type | Purpose |
|----|------|---------|
| statsSection | div | Stats section container |
| statsEurosSaved | span | Euros saved counter |
| statsReports | span | Reports counter |
| statsTimeValue | span | Time value |
| statsTimeUnit | span | Time unit |
| statsWeekLabel | span | Week label |
| statsMessage | div | Motivational message |
| statsRingContainer | div | Progress ring |
| statsRingProgress | circle | Ring SVG progress |
| statsRingPercent | span | Ring percentage |
| statsRingTooltip | div | Ring tooltip |

### Calendar
| ID | Type | Purpose |
|----|------|---------|
| techCalendar | div | Calendar container |
| techCalContent | div | Calendar content area |
| techCalTitle | span | Calendar title |
| eventDrawer | div | Event drawer overlay |
| eventDrawerOverlay | div | Event overlay backdrop |
| eventDrawerTitle | div | Event drawer title |
| eventDrawerSubtitle | div | Event drawer subtitle |
| eventName | input | Event name |
| eventDate | input | Event date |
| eventStartTime | input | Start time |
| eventEndTime | input | End time |
| eventClient | input | Client name |
| eventLocation | input | Location |
| eventNotes | textarea | Notes |
| eventAllDay | checkbox | All day toggle |
| eventContextMenu | div | Event context menu |

### Referral/Freemium
| ID | Type | Purpose |
|----|------|---------|
| upgradeOverlay | div | Upgrade modal overlay |
| upgradeTitle | div | Upgrade modal title |
| upgradeSubtitle | div | Upgrade modal subtitle |
| inviteConfirmPopup | div | Invite confirmation popup |
| referralPendingPopup | div | Pending referral popup |
| referralSection | div | Referral section in profile |
| referralCount | span | Referral count display |
| myReferralCode | span | User's referral code |
| bonusQueries | span | Bonus queries count |

### Profile
| ID | Type | Purpose |
|----|------|---------|
| userName | span | User name display |
| profileFirstName | input | First name input |
| profileLastName | input | Last name input |
| profileEmail | input | Email input |
| profilePhone | input | Phone input |
| langFR | button | French language button |
| langEN | button | English language button |
| themeToggle | div | Theme toggle switch |

### Connect
| ID | Type | Purpose |
|----|------|---------|
| connectActive | div | Active toggle |
| connectOnlineDot | div | Online status dot |
| connectAvailCount | span | Available count |
| connectAvailJobs | div | Available jobs list |
| connectMyJobs | div | My jobs list |
| connectMissions | span | Missions count |
| connectEarnings | span | Earnings display |
| connectRating | span | Rating display |
| connectDrawer | div | Connect drawer |
| connectPromo | div | Connect promo section |

### Hotline
| ID | Type | Purpose |
|----|------|---------|
| hotlineChat | div | Hotline chat container |
| hotlineChatMessages | div | Hotline messages area |
| hotlineWidget | div | Hotline floating widget |
| widgetLabel | span | Widget label |
| widgetSublabel | span | Widget sublabel |

### Layout
| ID | Type | Purpose |
|----|------|---------|
| divider | div | Split view divider |
| gapCover | div | Gap cover for iOS |
| messagesWrapper | div | Messages wrapper |
| toast | div | Toast notification container |
| toggleChat | div | Chat toggle button |
| toggleText | span | Toggle button text |

### SVG Icons (sprite)
All icons defined as `<symbol>` elements with IDs like `icon-*`:
`icon-air`, `icon-arrow-left`, `icon-arrow-right`, `icon-briefcase`, `icon-calendar`, `icon-camera`, `icon-check`, `icon-checklist`, `icon-clipboard`, `icon-clock`, `icon-columns`, `icon-connect`, `icon-copy`, `icon-dollar`, `icon-download`, `icon-edit`, `icon-fixair-logo`, `icon-folder`, `icon-home`, `icon-image`, `icon-map-pin`, `icon-mic`, `icon-paperclip`, `icon-phone`, `icon-plus`, `icon-search`, `icon-send`, `icon-share`, `icon-star`, `icon-trash`, `icon-user`, `icon-x`


---


<a id="audit_07_event_handlers"></a>

# AUDIT_07 - Event Handlers

## Summary

| File | Total Event References | Method |
|------|----------------------|--------|
| technician/index.html | 332 | Mostly inline onclick, some addEventListener |
| index.html | ~280 | Same pattern |
| docs/index.html | ~290 | Same pattern |
| operations/index.html | ~120 | Same pattern |
| master/index.html | ~100 | Same pattern |
| manager/index.html | ~110 | Same pattern |
| admin/index.html | ~105 | Same pattern |

## Technician App Event Handlers (Key Categories)

### Navigation Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| navHome | onclick | goToHome() | 6078 |
| navProjects | onclick | Router.navigate({page:'projects'}) | 6079 |
| navConnect | onclick | openConnect() | 6080 |
| nav-hotline | onclick | openHotline() | 6081 |
| nav-profile | onclick | openProfile() | 6091 |
| profile-back | onclick | goToHome() | 6099 |
| panel-back (copilot) | onclick | closeChat(); goToHome() | 6216 |
| panel-back (assistant) | onclick | closeChat(); goToHome() | 6327 |

### Login Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| loginEmail | onkeypress | nextLoginStep() on Enter | 5812 |
| loginPassword | onkeypress | nextLoginStep() on Enter | 5815 |
| loginBtn | onclick | nextLoginStep() | 5819 |
| loginBack | onclick | prevLoginStep() | 5807 |

### Chat Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| copilotInput | oninput | handleChatInput('copilot') | 6298 |
| copilotInput | onkeydown | handleKeydown(event,'copilot') | 6298 |
| copilotActionBtn | onclick | handleAction('copilot') | 6304 |
| assistantInput | oninput | handleChatInput('assistant') | 6409 |
| assistantInput | onkeydown | handleKeydown(event,'assistant') | 6409 |
| assistantActionBtn | onclick | handleAction('assistant') | 6415 |
| toggle-card copilot | onclick | openChat('copilot') | 5997 |
| toggle-card assistant | onclick | openChat('assistant') | 6005 |
| mode-btn copilot | onclick | switchMode('copilot') | 6272 |
| mode-btn assistant | onclick | switchMode('assistant') | 6276 |

### Brand Selection Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| brandPill | onclick | toggleBrandDropdown() | 5832 |
| brand-chip carrier | onclick | setBrand('carrier') | 6018 |
| brand-chip daikin | onclick | setBrand('daikin') | 6019 |
| brand-chip mitsubishi | onclick | setBrand('mitsubishi') | 6020 |
| panel-brand-btn (copilot) | onclick | toggleChatBrandDropdown('copilot') | 6221 |
| panel-brand-option * | onclick | changeChatBrand(brand, panel) | 6226-6262 |

### Project Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| new-chat-btn | onclick | startNewProject() | 6282 |
| split-btn | onclick | toggleSplit() | 6283 |
| context-menu rename | onclick | renameProject() | 6066 |
| context-menu delete | onclick | deleteProject() | 6070 |

### Report/Drawer Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| report-btn | onclick | openReport() | 6455 |
| report-close | onclick | closeReport() | 6459 |
| report export PDF | onclick | exportReport('pdf') | ~6470 |
| report export Word | onclick | exportReport('word') | ~6472 |
| report share | onclick | shareReport() | ~6474 |
| contenteditable elements | input | drawerAutoSave() (debounced) | via initDrawerV12Features |

### Calendar Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| calendar-tab day | onclick | setTechCalView('day', this) | 6030 |
| calendar-tab week | onclick | setTechCalView('week', this) | 6031 |
| calendar-tab month | onclick | setTechCalView('month', this) | 6032 |
| calendar-nav prev | onclick | navTechCal(-1) | 6036 |
| calendar-nav next | onclick | navTechCal(1) | 6037 |
| calendar add event | onclick | openEventDrawer(...) | 6038 |

### Photo/Media Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| attach camera | onclick | attachAction('camera', panel) | 6292 |
| attach file | onclick | attachAction('file', panel) | 6293 |
| plus-btn | onclick | toggleAttach(panel) | 6296 |

### Profile Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| langFR | onclick | setLanguage('fr') | 6137 |
| langEN | onclick | setLanguage('en') | 6138 |
| themeToggle | onclick | toggleTheme() | 6148 |
| profile-save | onclick | saveProfile() | 6153 |
| logout-btn | onclick | logout() | 6207 |

### Referral Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| copy referral code | onclick | copyReferralCode() | 6181 |
| share WhatsApp | onclick | shareOnWhatsApp() | 6190 |
| copy referral link | onclick | copyReferralLink() | 6196 |

### Freemium/Upgrade Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| upgrade overlay | onclick | closeUpgradeModal(event) | 5679 |
| upgrade referral btn | onclick | handleInviteClick() | 5695 |
| upgrade pro btn | onclick | handleUpgradeClick() | 5700 |
| upgrade later btn | onclick | closeUpgradeModal() | 5705 |

### Programmatic addEventListener Calls
| Target | Event | Handler | Line (approx) |
|--------|-------|---------|------|
| window | resize | setViewportHeight | 6613-6640 |
| window | orientationchange | setViewportHeight | 6613-6640 |
| window | focus/blur | handleKeyboardChange | 6646 |
| window | elevenlabs-ready | SDK init | 18348 |
| document | click | closeChatBrandDropdownsOnClick | 9138 |
| document | click | closeContextMenu | 10190 |
| divider | mousedown/touchstart | startDrag | ~18555 |
| document | mousemove/touchmove | drag | ~18560 |
| document | mouseup/touchend | stopDrag | ~18565 |

### Onboarding Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| step1 | onclick | handleStep1Click() | 5890 |
| step2 | onclick | toggleBrandSelect() | 5895 |
| brand options | onclick | selectBrandInline(brand) | 5901-5903 |
| step3 | onclick | handleStep3Click() | 5905 |
| step4 | onclick | handleStep4Click() | 5917 |

---

## Pattern Analysis

### Anti-Patterns Found
1. **Inline onclick everywhere** - Makes event handlers hard to trace and impossible to test
2. **No event delegation** - Each element gets its own handler instead of parent delegation
3. **Mixed patterns** - Some addEventListener, mostly inline onclick
4. **String-based event handlers** - `onclick="functionName()"` prevents minification and analysis

### Recommendation
During extraction, convert all inline onclick handlers to addEventListener calls registered in module initialization functions. This enables:
- Event delegation for lists
- Easier testing
- Better TypeScript support
- Proper cleanup on navigation


---


<a id="audit_08_supabase_tables"></a>

# AUDIT_08 - Supabase Tables

## Database Tables Referenced in Frontend Code

Based on comprehensive grep analysis of all `.from('table_name')` calls across the entire codebase.

### Tables Overview

| # | Table | Total References | Apps Using It |
|---|-------|-----------------|---------------|
| 1 | users | 66 | ALL apps |
| 2 | projects | 55 | technician, index, docs, admin, manager, operations |
| 3 | chats | 24 | technician, index, docs |
| 4 | messages | 15 | technician, index, docs, master |
| 5 | calendar_events | 14 | technician, index, docs, admin, manager |
| 6 | availability_shares | 10 | admin, manager, operations |
| 7 | user_actions | 6 | technician, index, docs |
| 8 | reports | 6 | technician, index, docs |
| 9 | team_messages | 5 | admin, manager, operations |
| 10 | invitations | 4 | admin, manager, invite |
| 11 | referrals | 3 | r/ (referral page) |
| 12 | app_settings | 3 | technician, index, docs |

**Total: 12 tables** referenced from frontend code.

---

## Table: `users`

### Purpose
Core user table storing all FixAIR users (technicians, managers, admins).

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key, matches auth.users |
| email | text | Login, user identification |
| first_name | text | Display name |
| last_name | text | Display name |
| status | text | User status (pending, approved, etc.) |
| role | text | 'technician', 'manager', 'admin', 'master' |
| company_id | uuid | FK to companies |
| brand_key | text | HVAC brand association |
| brand_name | text | Brand display name |
| subscription_status | text | Freemium/paid status |
| referral_code | text | Unique referral code |
| referred_by | uuid/text | Who referred this user |
| created_at | timestamp | Account creation |
| avatar_url | text | Profile photo URL |
| phone | text | Phone number |
| last_sign_in | timestamp | Last login tracking |

### Operations by App
| App | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| technician | x | | x | |
| index | x | x | x | |
| docs | x | | x | |
| auth | x | x | x | |
| admin | x | | x | |
| manager | x | | x | |
| operations | x | | x | |
| master | x | | x | |
| debug | x | | | |
| invite | x | | x | |
| r/ | x | | x | |

---

## Table: `projects`

### Purpose
Stores intervention reports/projects created by technicians.

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key |
| user_id | uuid | FK to users, report owner |
| company_id | uuid | FK to companies |
| title | text | Project title |
| status | text | 'en_cours', 'terminé', etc. |
| extracted_data | jsonb | Full report data (the main payload) |
| photos | jsonb | Array of photo objects |
| brand_key | text | HVAC brand |
| brand_name | text | Brand display name |
| reference | text | Report reference number (FX-YYYY-XXXXX) |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last modification |
| archived | boolean | Soft delete flag |

### Operations by App
| App | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| technician | x | x | x | x |
| index | x | x | x | x |
| docs | x | x | x | x |
| admin | x | | | |
| manager | x | | | |
| operations | x | | | |

### Key `extracted_data` JSON Structure
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
  "resultat": { "status", "description" },
  "reserves": [{ "texte" }],
  "type_intervention": "string",
  "date_intervention": "string"
}
```

---

## Table: `chats`

### Purpose
Chat sessions associated with projects. Each project can have multiple chat panels (assistant, copilot).

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key |
| project_id | uuid | FK to projects |
| user_id | uuid | FK to users |
| panel | text | 'assistant' or 'copilot' |
| title | text | Chat title |
| created_at | timestamp | Creation time |

### Operations
| App | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| technician | x | x | | x |
| index | x | x | | x |
| docs | x | x | | x |

---

## Table: `messages`

### Purpose
Individual chat messages within chat sessions.

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key |
| chat_id | uuid | FK to chats |
| role | text | 'user', 'assistant', 'system' |
| content | text | Message text |
| created_at | timestamp | Message time |

### Operations
| App | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| technician | x | x | | x |
| index | x | x | | x |
| docs | x | x | | x |
| master | x | | | |

---

## Table: `calendar_events`

### Purpose
Calendar events for technician scheduling/availability.

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| title | text | Event title |
| start_time | timestamp | Event start |
| end_time | timestamp | Event end |
| type | text | Event type |
| created_at | timestamp | Creation time |

### Operations
| App | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| technician | x | x | x | x |
| index | x | x | x | x |
| docs | x | x | x | x |
| admin | x | | | |
| manager | x | | | |

---

## Table: `availability_shares`

### Purpose
Shared availability data between technicians and their managers/admins.

### Operations
| App | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| admin | x | x | x | |
| manager | x | x | x | |
| operations | x | | | |

---

## Table: `user_actions`

### Purpose
Tracks user actions/analytics (e.g., button clicks, feature usage).

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| action | text | Action type |
| metadata | jsonb | Additional data |
| created_at | timestamp | Action time |

### Operations
| App | SELECT | INSERT |
|-----|--------|--------|
| technician | x | x |
| index | x | x |
| docs | x | x |

---

## Table: `reports`

### Purpose
Generated reports (PDF/Word exports) linked to projects.

### Operations
| App | SELECT | INSERT | UPDATE |
|-----|--------|--------|--------|
| technician | x | x | x |
| index | x | | |
| docs | x | | |

---

## Table: `team_messages`

### Purpose
Internal team messaging system for companies.

### Operations
| App | SELECT | INSERT |
|-----|--------|--------|
| admin | x | x |
| manager | x | x |
| operations | x | |

---

## Table: `invitations`

### Purpose
Team invitation tokens for onboarding new users.

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key |
| token | text | Unique invitation token |
| email | text | Invited email |
| company_id | uuid | FK to companies |
| role | text | Assigned role |
| status | text | pending, accepted, etc. |
| created_at | timestamp | Creation time |

### Operations
| App | SELECT | INSERT |
|-----|--------|--------|
| admin | x | x |
| manager | x | x |
| invite | x | x |

---

## Table: `referrals`

### Purpose
Referral tracking for viral growth / referral program.

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key |
| referrer_id | uuid | Who made the referral |
| referred_id | uuid | Who was referred |
| referral_code | text | The code used |
| status | text | pending, converted, etc. |
| link_clicks | integer | Number of link clicks |
| created_at | timestamp | Creation time |

### Operations
| App | SELECT | INSERT | UPDATE |
|-----|--------|--------|--------|
| r/ | x | x | x |

---

## Table: `app_settings`

### Purpose
Application-wide settings (API keys, feature flags).

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| key | text | Setting name (e.g., 'elevenlabs_api_key') |
| value | text | Setting value |

### Operations
| App | SELECT |
|-----|--------|
| technician | x |
| index | x |
| docs | x |

**Note:** This table stores sensitive API keys (e.g., ElevenLabs). Access should be restricted via RLS.

---

## Additional Tables (Referenced in master/index.html via REST API)

The master app uses direct REST API calls (`/rest/v1/${table}`) which means it can access ANY table. Specific additional tables referenced:

| Table | Evidence |
|-------|----------|
| sent_emails | master/index.html:3517 |
| email_link_clicks | master/index.html:3613 |

---

## Supabase RPC Functions

Only ONE RPC function call found in the frontend:

| Function | Used In | Purpose |
|----------|---------|---------|
| `increment_link_clicks` | r/index.html:648 | Atomic increment of referral link click counter |

---

## Supabase Realtime Subscriptions

| Channel | Table(s) | Used In | Events |
|---------|----------|---------|--------|
| team-status | users | admin, manager | UPDATE |
| project-updates | projects | admin, manager | INSERT, UPDATE |
| team-messages | team_messages | admin, manager | INSERT |
| availability-shares | availability_shares | admin, manager | INSERT, UPDATE, DELETE |

**Note:** Operations app declares `realtimeSubscriptions` array but no active subscriptions were found being set up. [POTENTIAL DEAD CODE]


---


<a id="audit_09_supabase_functions"></a>

# AUDIT_09 - Supabase Functions

## Edge Functions

### send-invite
**Called from:** admin/index.html:2338, manager/index.html:2411
**Endpoint:** `${SUPABASE_URL}/functions/v1/send-invite`
**Purpose:** Send team invitation emails to new users
**Authentication:** Bearer token (SUPABASE_ANON_KEY)
**Payload:**
```json
{
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "companyId": "string",
  "invitedBy": "string"
}
```

---

## Database Functions (RPC)

### increment_link_clicks
**Called from:** r/index.html:648
**Purpose:** Atomically increment the link_clicks counter on a referral record
**Usage:** `sb.rpc('increment_link_clicks')`

### generate_referral_code(user_first_name TEXT) → TEXT
**Source:** docs/REFERRAL-DATABASE-SCHEMA.sql:137-174
**Purpose:** Creates a unique referral code from user's first name + random 4 digits
**Logic:**
1. Clean first name to lowercase alpha only
2. Truncate to 10 chars max
3. Append random 4-digit number
4. Check uniqueness, retry if collision
5. Fallback to UUID-based code after 100 retries

### grant_referral_bonus(p_referral_id UUID, p_bonus_amount INTEGER = 30) → BOOLEAN
**Source:** docs/REFERRAL-DATABASE-SCHEMA.sql:181-228
**Purpose:** Grant bonus queries to both referrer and referee
**Security:** SECURITY DEFINER (runs with elevated privileges)
**Logic:**
1. Verify referral exists and is 'completed'
2. Grant bonus_queries to referrer (+30)
3. Grant bonus_queries to referee (+30)
4. Increment referrer's total_referrals
5. Check milestone achievements

### check_referral_milestones(p_user_id UUID) → VOID
**Source:** docs/REFERRAL-DATABASE-SCHEMA.sql:235-272
**Purpose:** Check and grant milestone achievements based on referral count
**Milestones:**
| Count | Milestone | Reward |
|-------|-----------|--------|
| 1+ | first_referral | Badge |
| 3+ | ambassador | is_ambassador = true |
| 5+ | super_referrer | Badge |
| 10+ | legend | Badge |

---

## Database Triggers

### auto_generate_referral_code
**Source:** docs/REFERRAL-DATABASE-SCHEMA.sql:278-293
**Table:** users
**Event:** BEFORE INSERT
**Function:** trigger_generate_user_referral_code()
**Purpose:** Auto-generate a referral code when a new user is created

---

## Note on Database Functions

The frontend code primarily interacts with Supabase through the JS client library's `.from().select()/insert()/update()/delete()` methods. Very few RPC calls are made directly. Most business logic runs either:
1. **In the browser** (mergeReportData, buildPartialReport, etc.)
2. **In n8n webhooks** (AI processing, email sending, approval workflow)
3. **In Supabase Edge Functions** (send-invite)

This means there is limited server-side validation of data. The frontend is responsible for data integrity, which is a significant architectural concern.


---


<a id="audit_10_supabase_policies"></a>

# AUDIT_10 - Supabase RLS Policies

## Important Note

RLS policies are configured in the **Supabase dashboard**, not in the frontend code. This audit documents:
1. What policies SHOULD exist based on the frontend code analysis
2. What policies are documented in existing audit files
3. Recommendations for proper RLS configuration

**To complete this audit, access to the Supabase dashboard (project fwuhzraxqrvmpqxnzpqm) is required.**

---

## Known RLS Policies (from docs/REFERRAL-DATABASE-SCHEMA.sql)

### Table: referrals
| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view own referrals | SELECT | auth.uid() IN (referrer auth_id OR referee auth_id) |
| Users can create referrals | INSERT | auth.uid() matches referrer auth_id |

### Table: referral_milestones
| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view own milestones | SELECT | auth.uid() matches user auth_id |

---

## Required RLS Policies (Based on Frontend Analysis)

### Table: users
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can read own profile | SELECT | All apps read own user data |
| Users can update own profile | UPDATE | Profile editing in technician, admin, etc. |
| Admin/Manager can read team members | SELECT | Team dashboards in admin/manager/operations |
| Master can read all users | SELECT | Master app reads all users |
| Insert own profile on signup | INSERT | Auth flow creates user profile |

**[SECURITY CONCERN]** The master app uses direct REST API calls to read/update ANY user. If RLS isn't strict, master-level access could be abused.

### Table: projects
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can CRUD own projects | ALL | Technician app creates/reads/updates/deletes |
| Admin/Manager can read team projects | SELECT | Dashboard views |
| Users can delete own projects | DELETE | Project deletion in technician app |

### Table: chats
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can CRUD own chats | ALL | Chat creation and deletion |
| Master can read all chats | SELECT | Master chat viewer |

### Table: messages
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can CRUD own messages | ALL | Message creation and deletion |
| Master can read all messages | SELECT | Master message viewer |

### Table: calendar_events
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can CRUD own events | ALL | Calendar management |
| Admin/Manager can read shared events | SELECT | Availability calendar |

### Table: availability_shares
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can read own shares | SELECT | View shared availability |
| Admin/Manager can manage shares | ALL | Accept/reject/create shares |

### Table: team_messages
| Policy | Operation | Reason |
|--------|-----------|--------|
| Company members can read team messages | SELECT | Team messaging |
| Company members can insert messages | INSERT | Send team messages |

### Table: invitations
| Policy | Operation | Reason |
|--------|-----------|--------|
| Admin/Manager can create invitations | INSERT | Invite team members |
| Anyone with token can read invitation | SELECT | /invite page validates tokens |
| Admin/Manager can read own invitations | SELECT | View sent invitations |

### Table: reports
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can CRUD own reports | ALL | Report generation |
| Admin/Manager can read team reports | SELECT | Dashboard |

### Table: user_actions
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can insert own actions | INSERT | Analytics tracking |
| Users can read own actions | SELECT | Weekly stats |

### Table: app_settings
| Policy | Operation | Reason |
|--------|-----------|--------|
| Authenticated users can read | SELECT | API key fetching |
| No write access from frontend | - | Settings managed via dashboard |

**[SECURITY CONCERN]** app_settings contains the ElevenLabs API key. Any authenticated user can read it. Consider: should this key be proxied through an Edge Function instead?

---

## Recommended RLS Audit Steps

1. **Login to Supabase Dashboard** → Authentication → Policies
2. **For each table above**, verify:
   - RLS is ENABLED
   - SELECT policies restrict to own data (or team data for admin/manager)
   - INSERT policies require auth.uid() match
   - UPDATE policies prevent cross-user modification
   - DELETE policies prevent cross-user deletion
3. **Test with different roles:**
   - Standalone technician: can only see own data
   - Internal technician: can see own data + manager can see theirs
   - Manager: can see team data
   - Admin: can see company data
   - Master: elevated access (internal only)

---

## Existing Documentation Reference

See `docs/AUDIT_RLS_PREPARATION.md` for detailed role-permission mapping created during the RLS preparation phase. That document contains:
- Complete role definitions (Admin, Manager, Technician standalone, Technician internal)
- Per-file Supabase query inventory
- Access pattern analysis


---


<a id="audit_11_data_flows"></a>

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


---


<a id="audit_12_dependencies"></a>

# AUDIT_12 - External Dependencies & APIs

## CDN Libraries

| Library | Version | CDN | Used In | Purpose |
|---------|---------|-----|---------|---------|
| Supabase JS | @2 (latest) | jsdelivr | ALL apps | Database, auth, realtime |
| Tesseract.js | @5 | jsdelivr | technician, index, docs | OCR for photo text extraction |
| jsPDF | 2.5.1 | cdnjs | technician, index, docs | PDF generation |
| docx | 8.5.0 | unpkg | technician, samples | Word document generation |
| FileSaver.js | 2.0.5 | cdnjs | technician, samples | File download trigger |
| Mermaid | @10 | jsdelivr | technician, docs, master | Diagram rendering |
| ElevenLabs Client | latest | esm.run | docs | Conversational AI SDK |
| Mapbox GL JS | 2.15.0 | api.mapbox.com | operations | Map display for technician locations |
| Inter Font | wght@300-800 | Google Fonts | ALL apps | Primary typeface |

### Library Usage by App

| App | supabase | tesseract | jspdf | docx | filesaver | mermaid | elevenlabs |
|-----|----------|-----------|-------|------|-----------|---------|------------|
| technician | x | x | x | x | x | x | |
| index (landing) | x | x | x | | | | |
| docs | x | x | x | | | x | x |
| operations | x | | | | | | |
| manager | x | | | | | | |
| admin | x | | | | | | |
| master | x | | | | | x | |
| auth | x | | | | | | |
| debug | x | | | | | | |
| invite | x | | | | | | |
| referral (r/) | x | | | | | | |

## External APIs

### n8n Webhooks (cherhabil.app.n8n.cloud)

| Webhook URL Path | Used In | Purpose |
|-----------------|---------|---------|
| `/webhook/fixair-assistant` | index, docs | AI assistant (production) |
| `/webhook/fixair-assistant-dev` | technician | AI assistant (dev) |
| `/webhook/fixair-copilot` | technician, index, docs | AI copilot chat |
| `/webhook/fixair-extraction-dev` | technician | Report data extraction (dev) |
| `/webhook/fixair-ocr` | technician, index, docs | OCR processing |
| `/webhook/fixair-approval` | master | User/company approval |
| `/webhook/support-login` | master | Support magic link login |
| `/webhook/email-send` | master | Email sending |
| `/webhook` (API_BASE) | technician, index, docs | Base webhook URL |

**[SECURITY] Note:** The technician app uses `-dev` webhook endpoints while index/docs use production endpoints. This suggests the technician app at go.fixair.ai may be hitting dev webhooks in production.

### ElevenLabs API

| Endpoint | Used In | Purpose |
|----------|---------|---------|
| `api.elevenlabs.io/v1/speech-to-text` | technician, index, docs, manager, admin | Voice transcription |

**API Key handling:** ElevenLabs API key is fetched from Supabase `app_settings` table at runtime (not hardcoded). This is the correct approach. [SECURITY OK]

### Supabase Edge Functions

| Function | Used In | Purpose |
|----------|---------|---------|
| `send-invite` | admin, manager | Send team invitation emails |

### Stripe (Payment)

| URL | Used In | Purpose |
|-----|---------|---------|
| `pay.fixair.ai/b/dRm7sKa3MbPAgxdfgR2VG00` | technician | Stripe checkout for subscription |

## Supabase Configuration

- **Project ID:** fwuhzraxqrvmpqxnzpqm
- **URL:** https://fwuhzraxqrvmpqxnzpqm.supabase.co
- **Anon Key:** Publicly embedded (expected for frontend - this is the anon/public key, NOT a secret key)
- **Auth:** Email/password, magic links, password reset
- **Realtime:** Used in admin, manager, operations for live updates
- **Storage:** No storage bucket usage found in frontend code [UNCLEAR - photos may be stored via base64 in jsonb columns]

## Shared Assets (assets/ directory)

### fixair-diagrams.css (530 lines)
Premium Mermaid diagram styling with dark theme. CSS variables with `fd-` prefix namespace. Supports flowcharts, sequence diagrams, state diagrams, ER diagrams, and Gantt charts.

### fixair-diagrams.js (546 lines)
Mermaid initialization and rendering engine. Public API via `window.FixAIRDiagrams`:
- `init()` - Initialize Mermaid with FixAIR theme
- `render(el, code)` - Render single diagram
- `renderAll()` - Auto-render all `.mermaid-placeholder` elements
- `sanitize(code)` - Fix French characters for Mermaid compatibility
- `applyStyles(el)` - Post-process SVG styling
- `restyleAll()` - Restyle existing diagrams

### logo-generator.html (219 lines)
Browser-based PNG export tool for FixAIR email logos. Creates 400x80px canvas (2x retina), renders SVG to PNG.

## Node.js Dependencies (samples/ only)

From `samples/package.json`:
```json
{
  "dependencies": {
    "docx": "^8.5.0",
    "file-saver": "^2.0.5",
    "jszip": "^3.10.1"
  }
}
```

These are only used for the offline sample report generator tool, not for the main application.


---


<a id="audit_13_security"></a>

# AUDIT_13 - Security Issues

## Severity Legend
- **CRITICAL**: Immediate exploitation risk, data breach possible
- **HIGH**: Significant security concern, should be fixed urgently
- **MEDIUM**: Security weakness, should be fixed soon
- **LOW**: Minor issue, fix when convenient
- **INFO**: Informational, best practice recommendation

---

## Issue #1: Supabase Anon Key Hardcoded in Every File
**Severity:** INFO (Expected Behavior)
**Files:** ALL 11 HTML files
**Description:** The Supabase anon key `eyJhbGci...` is hardcoded in every single HTML file. This is the **public/anon key**, which is designed to be exposed in frontend code. Security relies on RLS (Row Level Security) policies.
**Risk:** None, IF RLS policies are properly configured. If RLS is misconfigured, any authenticated user could access any data.
**Recommendation:** Audit all RLS policies thoroughly (see AUDIT_10).

---

## Issue #2: Dev Webhook Endpoints in Technician App
**Severity:** HIGH
**File:** technician/index.html:9760, 9762
**Description:** The technician app uses `-dev` webhook URLs:
```javascript
'assistant': 'https://cherhabil.app.n8n.cloud/webhook/fixair-assistant-dev'
const EXTRACTION_WEBHOOK = 'https://cherhabil.app.n8n.cloud/webhook/fixair-extraction-dev'
```
While index.html and docs/index.html use production URLs:
```javascript
'assistant': 'https://cherhabil.app.n8n.cloud/webhook/fixair-assistant'
```
**Risk:** If these dev endpoints have different security, logging, or error handling, production users may be exposed to dev-quality code paths.
**Recommendation:** Ensure technician app uses production webhook URLs, or implement environment-based configuration.

---

## Issue #3: No Content Security Policy (CSP)
**Severity:** MEDIUM
**Files:** ALL HTML files
**Description:** No CSP headers or meta tags found. The application loads scripts from multiple CDNs (jsdelivr, unpkg, cdnjs, esm.run, Google Fonts).
**Risk:** If any CDN is compromised, malicious scripts could be injected. No protection against XSS via inline scripts.
**Recommendation:** Add CSP meta tags or configure CSP headers on Cloudflare Pages.

---

## Issue #4: Extensive innerHTML Usage
**Severity:** MEDIUM
**Files:** All major files (395+ total instances)
**Breakdown:**
- technician/index.html: 79 uses
- master/index.html: 64 uses
- docs/index.html: 64 uses
- index.html: 62 uses
- admin/index.html: 47 uses
- manager/index.html: 42 uses
- operations/index.html: 32 uses
**Risk:** Potential XSS if any user-controlled data is inserted via innerHTML without sanitization. Most likely safe since data comes from Supabase (trusted source), but any user-generated content (messages, names) could be a vector.
**Recommendation:** Audit each innerHTML call for user-controlled data. Consider using textContent for plain text or DOMPurify for HTML content.

---

## Issue #5: Master App Direct REST API Access
**Severity:** HIGH
**File:** master/index.html:1435-1447
**Description:** The master app constructs direct REST API URLs to Supabase:
```javascript
let url = `${SUPABASE_URL}/rest/v1/${table}`;
const url = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`;
```
This allows accessing ANY table directly, bypassing the Supabase JS client's abstractions.
**Risk:** If the master app's authentication is compromised, arbitrary table access is possible. The `table` variable appears to come from the UI.
**Recommendation:** Whitelist allowed tables in the master app rather than accepting arbitrary table names.

---

## Issue #6: Direct REST API for User Profile Updates
**Severity:** MEDIUM
**Files:** technician/index.html:8427, docs/index.html:6880
**Description:** Some user profile updates use direct fetch to REST API instead of the Supabase client:
```javascript
fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${currentUser.id}`, {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
})
```
**Risk:** Using the anon key as the Authorization bearer token means the request runs with anon-level permissions, not the user's session token. This could bypass RLS policies that check `auth.uid()`.
**Recommendation:** Use the Supabase client or pass the user's session token.

---

## Issue #7: Freemium Enforcement via localStorage Only
**Severity:** HIGH
**File:** technician/index.html:18666-18709
**Description:** Freemium usage limits (20 copilot chats, 3 reports) are tracked in `localStorage`:
```javascript
storageKey: 'fixair_freemium_usage'
const stored = localStorage.getItem(FREEMIUM_CONFIG.storageKey);
```
**Risk:** Users can trivially bypass freemium limits by:
1. Clearing localStorage
2. Using incognito mode
3. Editing localStorage values in DevTools
**Recommendation:** Track usage server-side (Supabase) and validate limits on the backend (n8n webhooks or Supabase functions).

---

## Issue #8: No Rate Limiting on Frontend
**Severity:** MEDIUM
**Description:** No rate limiting is implemented on any API calls from the frontend. Users could rapidly call n8n webhooks, Supabase queries, or ElevenLabs API.
**Risk:** API abuse, cost escalation (ElevenLabs billing), potential DoS on n8n workflows.
**Recommendation:** Implement rate limiting in n8n webhooks and/or Supabase Edge Functions.

---

## Issue #9: .DS_Store in Repository
**Severity:** LOW
**File:** .DS_Store
**Description:** macOS metadata file committed to the repository. Can leak directory structure information.
**Recommendation:** Add `.DS_Store` to `.gitignore` and remove from repository.

---

## Issue #10: No Subresource Integrity (SRI) on CDN Scripts
**Severity:** MEDIUM
**Files:** All HTML files loading CDN scripts
**Description:** CDN script tags don't include `integrity` attributes:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```
**Risk:** If the CDN is compromised or a version is tampered with, malicious code could be loaded.
**Recommendation:** Add SRI hashes to all CDN script tags.

---

## Issue #11: Support Login Webhook Sends Magic Links
**Severity:** MEDIUM
**File:** master/index.html:4038
**Description:** The master app can trigger magic link sends via webhook for any email:
```javascript
fetch('https://cherhabil.app.n8n.cloud/webhook/support-login', {
    body: JSON.stringify({ email: targetEmail })
})
```
**Risk:** If the master app is accessible to unauthorized users, they could send magic links to any email.
**Recommendation:** Ensure master app access is strictly limited and the webhook validates the caller.

---

## Issue #12: No CORS Configuration Visible
**Severity:** INFO
**Description:** CORS is handled by Supabase and n8n, not by the frontend. However, the frontend makes cross-origin requests to:
- Supabase (fwuhzraxqrvmpqxnzpqm.supabase.co)
- n8n (cherhabil.app.n8n.cloud)
- ElevenLabs (api.elevenlabs.io)
**Risk:** Low - these services handle their own CORS.
**Recommendation:** Verify n8n webhook CORS settings allow only go.fixair.ai and lab.gomove.ai origins.

---

## Issue #13: Sensitive Data in Console Logs
**Severity:** LOW
**Description:** Multiple `console.log` statements throughout the codebase may log sensitive data (user IDs, project data, API responses).
**Example:** `console.log('📤 Webhook sent:', webhookPayload);` (master/index.html:3455)
**Recommendation:** Remove or guard console.log statements in production, or use a logging framework with log levels.

---

## Issue #14: Hardcoded Master Key in Client-Side Code
**Severity:** CRITICAL
**File:** master/index.html:2550
**Description:** A plaintext master access key is hardcoded in the SUPPORT_CONFIG object:
```javascript
const SUPPORT_CONFIG = {
    webhookUrl: 'https://cherhabil.app.n8n.cloud/webhook/support-login',
    master_key: 'FixAIR_Houssam_2026!'
};
```
This key is sent to the n8n webhook to generate magic links for ANY user account.
**Risk:** **CRITICAL** - Anyone who views the page source of /master can extract this key and use it to generate login links for any user, gaining full account access. Even though /master requires authentication, the key is in the HTML source which is downloaded before auth checks run.
**Recommendation:** 
1. **Immediately rotate this key**
2. Move to server-side only (Supabase Edge Function or n8n environment variable)
3. Never send secrets from the frontend - authenticate the master user via their Supabase session token instead

---

## Issue #15: ElevenLabs API Key Hardcoded in Manager &amp; Admin Apps
**Severity:** CRITICAL
**Files:** manager/index.html:2675, admin/index.html:2604
**Description:** The ElevenLabs secret API key is hardcoded in plaintext in both the manager and admin apps:
```javascript
const ELEVENLABS_API_KEY = 'sk_22d5...cd35c8b71';
```
This key is used for speech-to-text API calls. Meanwhile, the technician, docs, and root apps correctly fetch this key from Supabase `app_settings` table at runtime via `getApiKey('elevenlabs_api_key')`.
**Risk:** **CRITICAL** - Anyone viewing the page source can extract this key and use it to make unlimited API calls to ElevenLabs, incurring billing charges. The key is a secret API key (prefix `sk_`), not a public key.
**Recommendation:**
1. **Immediately rotate the ElevenLabs API key**
2. Remove the hardcoded key from manager and admin apps
3. Use the same `getApiKey('elevenlabs_api_key')` pattern already used in technician/docs apps
4. Consider proxying ElevenLabs calls through a Supabase Edge Function

---

## Issue #16: Auth Timeout Treated as "User Not Found"
**Severity:** HIGH
**Files:** auth/index.html, technician/index.html
**Description:** When `safeQuery()` times out checking if a user exists, it returns `{data: null, error: {...}}`. The code checks `if (publicUser && publicUser.id)` which is FALSE on timeout, so it falls through and redirects approved users to `/auth` (signup page) instead of showing a retry/error.
**Risk:** Approved users see a signup form instead of their dashboard on network hiccups.
**Documented in:** debug/index.html (entire file exists to reproduce this bug)
**Recommendation:** Check for error FIRST before checking if user exists. Only redirect when genuinely no user found (no error AND no data).

---

## Issue #15: Weak Referral Code Generation
**Severity:** MEDIUM
**File:** r/index.html:720
**Description:** Referral codes are generated client-side:
```javascript
firstName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10) + Math.floor(1000 + Math.random() * 9000);
```
Uses only first name + 4-digit random number. High collision probability.
**Risk:** Two users with same first name could get same code. `Math.random()` is not cryptographically secure.
**Recommendation:** Use server-side generation via the existing `generate_referral_code()` PostgreSQL function.

---

## Issue #16: Auth Lock Disabled
**Severity:** MEDIUM
**Files:** auth/index.html, technician/index.html, docs/index.html
**Description:** `lock: false` set in Supabase auth config to work around `AbortError`:
```javascript
auth: { lock: false }
```
**Risk:** Disabling the auth storage lock can allow concurrent auth operations to conflict, potentially causing session corruption.
**Recommendation:** Investigate the root cause of the AbortError rather than disabling the lock.

---

## Issue #17: No Rate Limiting on Auth Operations
**Severity:** MEDIUM
**File:** auth/index.html
**Description:** No rate limiting on `signUp()`, `signInWithPassword()`, or `resetPasswordForEmail()` calls.
**Risk:** Brute force login attempts, account creation spam, email flooding via password reset.
**Recommendation:** Implement rate limiting via Supabase Edge Functions or n8n middleware.

---

## Issue #18: Mapbox Token Exposure
**Severity:** LOW
**File:** operations/index.html:4635
**Description:** Mapbox public access token hardcoded in client-side code (token redacted from this document).
**Risk:** Mapbox public tokens are designed to be client-side, but abuse could generate unexpected billing. Consider restricting the token to specific URLs in the Mapbox dashboard.
**Recommendation:** Add URL restriction in Mapbox account settings.

---

## Issue #19: Exposed n8n Webhook URLs
**Severity:** MEDIUM
**Files:** All apps using webhooks
**Description:** n8n webhook URLs are publicly visible in client-side code. Anyone can send requests to these endpoints.
**Risk:** Unauthorized AI query processing, cost escalation.
**Recommendation:** Add request signing or auth token validation in n8n webhooks.

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 2 (#14, #15) |
| HIGH | 4 (#2, #5, #7, #16) |
| MEDIUM | 9 (#3, #4, #6, #8, #10, #17, #18, #19, #20) |
| LOW | 2 (#9, #13) |
| INFO | 3 (#1, #11, #12) |

### Top Priority Fixes
1. **ROTATE MASTER KEY immediately** (#14) - Plaintext secret in client-side code
2. **ROTATE ELEVENLABS API KEY immediately** (#15) - Secret key `sk_*` in manager &amp; admin source
3. **Fix auth timeout → signup redirect** (#16) - Users losing access on network issues
3. **Fix dev webhook URLs** in technician app (#2)
4. **Server-side freemium enforcement** (#7)
5. **Whitelist tables** in master app REST API calls (#5)
6. **Add request validation** on n8n webhooks (#19)
7. **Add CSP headers** (#3)


---


<a id="audit_14_dead_code"></a>

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


---


<a id="audit_15_issues"></a>

# AUDIT_15 - Issues, Bugs & Technical Debt

## Critical Issues

### ISS-001: Massive Code Duplication (~57%)
**Severity:** CRITICAL (Technical Debt)
**Description:** Three near-identical copies of the core technician app exist:
- technician/index.html (21,489 lines) - DEV
- index.html (15,137 lines) - PRODUCTION
- docs/index.html (15,570 lines) - DOCS
**Impact:** Bug fixes must be applied 3 times. Features drift between copies. Inconsistent behavior.
**Fix:** Extract shared code into modules (see AUDIT_16, AUDIT_17)

### ISS-002: Dev Webhooks in Production
**Severity:** HIGH
**File:** technician/index.html:9760-9762
**Description:** Technician app uses `-dev` webhook endpoints while other copies use production endpoints.
**Impact:** Users may experience different behavior, dev endpoints may not have same reliability.
**Fix:** Use environment-based configuration.

### ISS-003: Client-Side Freemium Enforcement
**Severity:** HIGH
**File:** technician/index.html:18666-18709
**Description:** Freemium limits tracked via localStorage only.
**Impact:** Trivially bypassed by clearing storage or using incognito.
**Fix:** Server-side enforcement in Supabase/n8n.

### ISS-004: mergeReportData First-Write-Wins Bug
**Severity:** HIGH
**File:** technician/index.html:13704 (and index.html, docs/index.html equivalents)
**Description:** Primitives use first-write-wins: `if (!target[key]) target[key] = value`. AI corrections to already-set fields are silently ignored.
**Impact:** When the AI sends corrected data for a field, the correction is IGNORED.
**Previously documented in:** FRONTEND_AUDIT_RESULTS.md
**Fix:** Allow AI corrections to overwrite existing values.

---

## Medium Issues

### ISS-005: No Error Boundaries
**Severity:** MEDIUM
**Description:** No global error handling. An unhandled exception in any function can crash the entire app.
**Fix:** Add global error handler with toast notification.

### ISS-006: No Loading States for Long Operations
**Severity:** MEDIUM
**Description:** Operations like Word export, PDF generation, and OCR processing show minimal loading feedback.
**Fix:** Add proper loading spinners/skeletons.

### ISS-007: innerHTML XSS Risk
**Severity:** MEDIUM
**Files:** 395+ innerHTML usages across all files
**Description:** User-controlled content (names, messages) may be inserted via innerHTML.
**Fix:** Audit each innerHTML call, use textContent or DOMPurify.

### ISS-008: No Offline Support
**Severity:** MEDIUM
**Description:** No service worker, no offline caching. App is completely non-functional without internet.
**Impact:** Field technicians often work in basements/areas with poor connectivity.
**Fix:** Add service worker with offline caching and queue-based syncing.

### ISS-009: Admin/Manager Code Duplication
**Severity:** MEDIUM
**Files:** admin/index.html (3,618 lines), manager/index.html (3,808 lines)
**Description:** ~80% shared code between admin and manager apps.
**Fix:** Merge into single app with role-based views.

### ISS-010: No Input Validation
**Severity:** MEDIUM
**Description:** Limited input validation on forms. Relies on Supabase RLS for security.
**Fix:** Add client-side validation for all forms.

---

## Low Issues

### ISS-011: Console.log Statements in Production
**Severity:** LOW
**Description:** Despite PRODUCTION_MODE flag, many console.log statements remain.
**Fix:** Remove or guard all console.log calls.

### ISS-012: .DS_Store in Repository
**Severity:** LOW
**File:** .DS_Store
**Fix:** Add to .gitignore, remove from repo.

### ISS-013: No CDN Version Pinning
**Severity:** LOW
**Description:** `@2` and `@10` version ranges used instead of exact versions.
**Fix:** Pin exact versions with SRI hashes.

### ISS-014: Inconsistent Variable Naming
**Severity:** LOW
**Description:** Mix of camelCase and snake_case. French and English variable names mixed.
**Examples:** `travaux_effectues`, `lastReportData`, `numero_affaire`
**Fix:** Standardize on English camelCase for JS, French for data keys.

### ISS-015: No Accessibility (a11y)
**Severity:** LOW
**Description:** No ARIA labels, no keyboard navigation, no screen reader support.
**Fix:** Add ARIA attributes and keyboard navigation.

### ISS-016: No SEO Optimization
**Severity:** LOW
**Description:** Landing page has no meta description, no Open Graph tags, no structured data.
**Fix:** Add SEO meta tags to landing page.

### ISS-017: Large Bundle Size
**Severity:** LOW
**Description:** technician/index.html is 1,081,799 bytes (1MB+). No minification, no code splitting.
**Fix:** Build system with minification and code splitting.

---

## Previously Known Issues (from existing docs)

### From FRONTEND_AUDIT_RESULTS.md:
1. mergeReportData first-write-wins bug (ISS-004)
2. Duplicate mesures entries
3. Field mismatch between AI extraction and drawer rendering
4. Charge values not syncing correctly between fluide.charge_totale and mesures

### From docs/PRODUCTION_CODE_AUDIT.md:
1. Various production bugs documented and fixed through Rounds 2-5
2. Reserves, prefix cleaning, fluide sync issues
3. Type_intervention and resultat display bugs

### From docs/EXTRACTION_SYSTEM_AUDIT.md:
1. Extraction vs merge inconsistencies
2. Data loss during merge operations

---

## Technical Debt Summary

| Category | Count | Priority |
|----------|-------|----------|
| Code duplication | 3 issues | CRITICAL |
| Security | 5 issues | HIGH-MEDIUM |
| Architecture | 4 issues | HIGH |
| Data integrity | 2 issues | HIGH |
| UX/Accessibility | 3 issues | LOW |
| DevOps | 3 issues | LOW |
| **Total** | **20 issues** | |


---


<a id="audit_16_extraction_plan"></a>

# AUDIT_16 - Technician App Extraction Plan

## Goal
Extract the technician app from a monolithic 21,489-line `index.html` into a modular, maintainable codebase.

---

## Current Structure of technician/index.html

Based on analysis, the file contains these logical modules:

| Module | Approx Lines | Dependencies |
|--------|-------------|--------------|
| CSS (dark + light themes) | ~5,600 | None |
| HTML body structure | ~1,400 | CSS classes |
| Supabase init + auth | ~1,500 | Supabase JS SDK |
| Login/profile UI | ~1,200 | Supabase auth |
| Brand selection + UI setup | ~700 | Supabase users table |
| Project/chat management | ~1,500 | Supabase projects, chats, messages |
| Chat send/receive | ~1,200 | n8n webhooks, Supabase |
| Report drawer rendering | ~2,500 | DOM manipulation |
| Data merge + extraction | ~800 | JSON operations |
| Auto-save system | ~500 | Supabase projects table |
| Word/PDF export | ~600 | docx, jsPDF, FileSaver |
| Photo/OCR | ~600 | Canvas, n8n OCR webhook |
| Signature capture | ~400 | Canvas API |
| Voice input | ~300 | ElevenLabs API |
| Freemium system | ~1,500 | localStorage, Stripe |
| Referral system | ~500 | Supabase users, referrals |
| Calendar | ~600 | Supabase calendar_events |
| Diagrams | ~200 | Mermaid, fixair-diagrams |
| Miscellaneous UI | ~500 | Various |

---

## Extraction Steps

### Step 1: Set Up Project Structure

```
fixair-technician/
├── src/
│   ├── index.html              # Minimal HTML shell
│   ├── main.ts                 # Entry point
│   ├── styles/
│   │   ├── variables.css       # CSS custom properties
│   │   ├── dark-theme.css      # Dark theme
│   │   ├── light-theme.css     # Light theme
│   │   ├── layout.css          # Layout styles
│   │   ├── chat.css            # Chat UI styles
│   │   ├── drawer.css          # Report drawer styles
│   │   ├── modals.css          # Modal styles
│   │   └── components.css      # Misc component styles
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client init
│   │   ├── config.ts           # Environment config
│   │   ├── auth.ts             # Auth flows
│   │   └── types.ts            # TypeScript interfaces
│   ├── modules/
│   │   ├── chat/
│   │   │   ├── chat.ts         # Chat core logic
│   │   │   ├── send-message.ts # sendMsg function
│   │   │   ├── webhooks.ts     # n8n webhook calls
│   │   │   └── history.ts      # Chat history management
│   │   ├── report/
│   │   │   ├── drawer.ts       # Drawer rendering
│   │   │   ├── merge.ts        # mergeReportData
│   │   │   ├── extract.ts      # drawerExtractDataFromDOM
│   │   │   ├── auto-save.ts    # drawerAutoSave
│   │   │   ├── build.ts        # buildPartialReport
│   │   │   └── types.ts        # Report data interfaces
│   │   ├── export/
│   │   │   ├── word.ts         # Word export (generateWord)
│   │   │   ├── pdf.ts          # PDF export
│   │   │   └── templates.ts    # Document templates
│   │   ├── media/
│   │   │   ├── photo.ts        # Photo capture
│   │   │   ├── ocr.ts          # OCR processing
│   │   │   ├── signature.ts    # Signature canvas
│   │   │   └── voice.ts        # ElevenLabs STT
│   │   ├── projects/
│   │   │   ├── crud.ts         # Project CRUD
│   │   │   ├── list.ts         # Project listing
│   │   │   └── sidebar.ts      # Sidebar management
│   │   ├── freemium/
│   │   │   ├── usage.ts        # Usage tracking
│   │   │   ├── paywall.ts      # Upgrade modals
│   │   │   └── config.ts       # Freemium limits
│   │   ├── referral/
│   │   │   ├── invite.ts       # Invite flows
│   │   │   └── tracking.ts     # Referral tracking
│   │   ├── calendar/
│   │   │   └── calendar.ts     # Calendar events
│   │   └── diagrams/
│   │       └── diagrams.ts     # Mermaid integration
│   └── ui/
│       ├── toast.ts            # Toast notifications
│       ├── modals.ts           # Modal management
│       ├── theme.ts            # Theme toggle
│       └── brand-selector.ts   # Brand selection UI
├── public/
│   └── favicon.svg
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

### Step 2: Extract CSS (Day 1)

1. Copy all CSS from `<style>` tags into separate files
2. Split by logical section (theme, layout, components)
3. Convert to CSS custom properties where hardcoded
4. Import in `main.ts` or `index.html`

### Step 3: Extract Configuration (Day 1)

```typescript
// src/lib/config.ts
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://fwuhzraxqrvmpqxnzpqm.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  webhooks: {
    base: import.meta.env.VITE_WEBHOOK_BASE || 'https://cherhabil.app.n8n.cloud/webhook',
    assistant: import.meta.env.VITE_WEBHOOK_ASSISTANT,
    copilot: import.meta.env.VITE_WEBHOOK_COPILOT,
    extraction: import.meta.env.VITE_WEBHOOK_EXTRACTION,
    ocr: import.meta.env.VITE_WEBHOOK_OCR,
  },
  elevenlabs: {
    sttEndpoint: 'https://api.elevenlabs.io/v1/speech-to-text',
  },
  stripe: {
    paymentUrl: import.meta.env.VITE_STRIPE_PAYMENT_URL,
  },
  freemium: {
    freeCopilotChats: 20,
    freeReports: 3,
    softLimitWarning: 0.8,
    monthlyPrice: 49,
  }
};
```

### Step 4: Extract Supabase + Auth (Day 2)

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { config } from './config';

export const db = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
});
```

### Step 5: Extract Report Engine (Day 2-3)

The most critical extraction. These functions have complex interdependencies:

**Key functions to extract:**
- `mergeReportData(target, source)` → `src/modules/report/merge.ts`
- `buildPartialReport(data)` → `src/modules/report/build.ts`
- `drawerExtractDataFromDOM()` → `src/modules/report/extract.ts`
- `updateDrawerPreview(data)` → `src/modules/report/drawer.ts`
- `drawerAutoSave()` → `src/modules/report/auto-save.ts`

**TypeScript interfaces:**
```typescript
// src/modules/report/types.ts
export interface ReportData {
  client: ClientInfo;
  site: SiteInfo;
  systeme: SystemInfo;
  fluide: FluideInfo;
  codes_defaut: CodeDefaut[];
  adressage: AdressageItem[];
  travaux_effectues: TravauxItem[];
  mesures: MesureItem[];
  technicien: TechnicienInfo;
  resultat: ResultatInfo;
  reserves: ReserveItem[];
  type_intervention: string;
  date_intervention: string;
  brand?: string;
  brand_key?: string;
  status?: string;
}
```

### Step 6: Extract Chat System (Day 3-4)

- `sendMsg(panel)` → `src/modules/chat/send-message.ts`
- Webhook handling → `src/modules/chat/webhooks.ts`
- `[REPORT_DATA]` parsing → `src/modules/chat/send-message.ts`
- Chat history → `src/modules/chat/history.ts`

### Step 7: Extract Export (Day 4)

- `generateWord()` → `src/modules/export/word.ts`
- PDF export → `src/modules/export/pdf.ts`

### Step 8: Extract Media (Day 4-5)

- Photo capture → `src/modules/media/photo.ts`
- OCR → `src/modules/media/ocr.ts`
- Signature → `src/modules/media/signature.ts`
- Voice → `src/modules/media/voice.ts`

### Step 9: Extract Freemium + Referral (Day 5)

- Move freemium logic to `src/modules/freemium/`
- Move referral logic to `src/modules/referral/`

### Step 10: Wire Everything Together (Day 5-6)

- Create `main.ts` entry point
- Set up event listeners
- Initialize modules in correct order
- Test all flows

---

## Global State to Track

The following global variables need to be managed during extraction:

| Variable | Type | Used By | Strategy |
|----------|------|---------|----------|
| db | SupabaseClient | ALL modules | Import from lib/supabase |
| currentUser | object | ALL modules | State module or context |
| currentProjectId | string | chat, report, export | State module |
| currentChatId | object | chat | Chat module state |
| lastReportData | object | report, chat | Report module state |
| currentSessionId | string | chat | Chat module state |
| currentBrand | string | UI, chat | State module |
| currentBrandName | string | UI, chat | State module |

**Recommendation:** Create a simple state module:
```typescript
// src/lib/state.ts
export const state = {
  user: null as User | null,
  projectId: null as string | null,
  chatIds: {} as Record<string, string>,
  reportData: null as ReportData | null,
  sessionId: null as string | null,
  brand: null as string | null,
  brandName: null as string | null,
};
```

---

## Testing Plan

| Module | Test Type | Priority |
|--------|-----------|----------|
| report/merge.ts | Unit tests | CRITICAL |
| report/extract.ts | Unit tests | CRITICAL |
| report/build.ts | Unit tests | CRITICAL |
| chat/send-message.ts | Integration | HIGH |
| export/word.ts | Snapshot | HIGH |
| freemium/usage.ts | Unit tests | MEDIUM |
| lib/auth.ts | Integration | MEDIUM |

---

## Estimated Timeline

| Task | Days | Risk |
|------|------|------|
| Project setup (Vite, TS, deps) | 0.5 | Low |
| CSS extraction | 1 | Low |
| Config + Supabase + Auth | 1 | Low |
| Report engine extraction | 2 | HIGH |
| Chat system extraction | 1.5 | Medium |
| Export extraction | 1 | Low |
| Media extraction | 1 | Medium |
| Freemium + Referral | 1 | Low |
| Integration + testing | 2 | HIGH |
| **Total** | **~11 days** | |

### Key Risks
1. **Report data merge logic** - Most complex and bug-prone area
2. **Global state dependencies** - Many functions share state via globals
3. **DOM manipulation** - Drawer rendering tightly coupled to HTML structure
4. **Event handler wiring** - Many implicit event handler registrations


---


<a id="audit_17_architecture_proposal"></a>

# AUDIT_17 - Architecture Proposal

## Current State

### Problems
1. **76,520 lines** in 18 monolithic HTML files
2. **~57% code duplication** across technician, index, and docs
3. **No build system** - no bundler, no minification, no tree-shaking
4. **No shared modules** - each app copies shared code
5. **No environment management** - dev webhook URLs hardcoded in production files
6. **No tests** - zero test files found
7. **No type safety** - vanilla JavaScript, no TypeScript
8. **CDN dependencies** - no version locking, no SRI hashes
9. **Inline everything** - CSS, JS, HTML all in single files
10. **No component reuse** - UI components duplicated across apps

### Pain Points
- Any bug fix must be applied to 3+ files
- Feature development requires updating multiple monoliths
- No way to test changes in isolation
- Deploys ship the entire site, no incremental updates
- New developer onboarding requires reading 21K+ lines

---

## Proposed Architecture

### Phase 1: Monorepo with Shared Packages (Recommended First Step)

```
fixair/
├── packages/
│   ├── core/                          # Shared core library
│   │   ├── src/
│   │   │   ├── supabase.ts            # Supabase client init
│   │   │   ├── auth.ts                # Authentication flows
│   │   │   ├── types.ts               # TypeScript types
│   │   │   ├── config.ts              # Environment config
│   │   │   └── utils.ts               # Shared utilities
│   │   └── package.json
│   │
│   ├── ui/                            # Shared UI components
│   │   ├── src/
│   │   │   ├── chat/                  # Chat component
│   │   │   ├── drawer/                # Report drawer
│   │   │   ├── login/                 # Login forms
│   │   │   ├── calendar/              # Calendar widget
│   │   │   ├── toast/                 # Notifications
│   │   │   └── theme/                 # Dark/light themes
│   │   └── package.json
│   │
│   └── report-engine/                 # Report generation
│       ├── src/
│       │   ├── merge.ts               # mergeReportData
│       │   ├── extract.ts             # drawerExtractDataFromDOM
│       │   ├── word-export.ts         # Word generation
│       │   ├── pdf-export.ts          # PDF generation
│       │   └── types.ts               # Report data types
│       └── package.json
│
├── apps/
│   ├── technician/                    # Main technician app
│   │   ├── src/
│   │   │   ├── index.html
│   │   │   ├── app.ts
│   │   │   ├── chat.ts
│   │   │   ├── voice.ts
│   │   │   ├── photos.ts
│   │   │   ├── signature.ts
│   │   │   ├── freemium.ts
│   │   │   └── referral.ts
│   │   └── package.json
│   │
│   ├── admin/                         # Combined Admin + Manager
│   │   ├── src/
│   │   │   ├── index.html
│   │   │   ├── app.ts
│   │   │   ├── team.ts
│   │   │   ├── projects.ts
│   │   │   ├── messaging.ts
│   │   │   ├── availability.ts
│   │   │   └── realtime.ts
│   │   └── package.json
│   │
│   ├── operations/                    # Operations dashboard
│   │   ├── src/
│   │   │   ├── index.html
│   │   │   ├── app.ts
│   │   │   └── map.ts
│   │   └── package.json
│   │
│   ├── master/                        # Internal admin
│   │   ├── src/
│   │   │   ├── index.html
│   │   │   ├── app.ts
│   │   │   ├── users.ts
│   │   │   ├── emails.ts
│   │   │   └── approval.ts
│   │   └── package.json
│   │
│   ├── docs/                          # Documentation/hotline
│   │   └── ...
│   │
│   ├── landing/                       # Marketing landing page
│   │   └── ...
│   │
│   └── auth/                          # Shared auth pages
│       ├── login/
│       ├── invite/
│       ├── referral/
│       └── password-reset/
│
├── supabase/                          # Database
│   ├── migrations/
│   ├── functions/                     # Edge functions
│   ├── seed.sql
│   └── config.toml
│
├── turbo.json                         # Turborepo config
├── package.json                       # Root package.json
└── tsconfig.json                      # Root TypeScript config
```

### Technology Stack
| Layer | Current | Proposed |
|-------|---------|----------|
| Language | JavaScript | TypeScript |
| Framework | None (vanilla) | Preact or vanilla TS (lightweight) |
| Build | None | Vite |
| Monorepo | N/A | Turborepo |
| Package Manager | N/A | pnpm |
| CSS | Inline `<style>` | CSS Modules or Tailwind |
| Testing | None | Vitest |
| Linting | None | ESLint + Prettier |
| CI/CD | Cloudflare Pages | Cloudflare Pages + GitHub Actions |

**Why Preact over React:** The app is mobile-first for technicians. Preact is 3KB vs React's 40KB. Given the current vanilla JS approach, Preact is the smallest step up that provides component architecture.

**Alternative: Stay vanilla TS.** If the team prefers no framework, TypeScript + Vite alone provides modules, bundling, and type safety without adding a framework.

---

### Phase 2: Extract Shared Packages

**Priority order:**

1. **`packages/core`** - Extract Supabase init, auth, and config
   - Currently duplicated: 11 files × ~200 lines = ~2,200 lines saved
   - Enables environment-based webhook URL configuration

2. **`packages/report-engine`** - Extract report logic
   - `mergeReportData()`, `buildPartialReport()`, `drawerExtractDataFromDOM()`
   - `generateWord()`, PDF export
   - Currently duplicated across 3 files

3. **`packages/ui`** - Extract UI components
   - Chat component, login forms, toast notifications
   - Theme system (dark/light CSS variables)

---

### Phase 3: Consolidate Apps

1. **Merge Admin + Manager** into single app with role-based views
   - ~80% shared code → single codebase with role switches
   - Reduces maintenance from 2 apps to 1

2. **Merge index.html into technician/**
   - Separate landing page from app
   - One canonical technician app instead of 2 copies

3. **Merge docs/ specifics into technician/**
   - ElevenLabs conversational AI as a feature flag
   - Removes third copy of core code

---

### Phase 4: Infrastructure

1. **Environment configuration**
   ```typescript
   // packages/core/src/config.ts
   export const config = {
     supabase: {
       url: import.meta.env.VITE_SUPABASE_URL,
       anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
     },
     webhooks: {
       assistant: import.meta.env.VITE_WEBHOOK_ASSISTANT,
       copilot: import.meta.env.VITE_WEBHOOK_COPILOT,
       extraction: import.meta.env.VITE_WEBHOOK_EXTRACTION,
       ocr: import.meta.env.VITE_WEBHOOK_OCR,
     },
     stripe: {
       paymentUrl: import.meta.env.VITE_STRIPE_PAYMENT_URL,
     }
   };
   ```

2. **Supabase migrations** - Version control database schema
3. **Edge Functions** - Move freemium enforcement server-side
4. **GitHub Actions** - CI pipeline with linting, type checking, testing

---

## Migration Strategy

### Principle: Incremental Migration

Do NOT rewrite everything at once. Migrate incrementally:

1. **Week 1-2:** Set up monorepo, Vite, TypeScript
2. **Week 2-3:** Extract `packages/core` (Supabase, auth, config)
3. **Week 3-4:** Migrate technician app to use core package
4. **Week 4-5:** Extract `packages/report-engine`
5. **Week 5-6:** Migrate remaining apps
6. **Week 6-8:** Consolidate admin/manager, remove duplicates

### Risk Mitigation
- Keep old files alongside new ones during migration
- Feature-flag new code paths
- Deploy new apps to staging (lab.gomove.ai) first
- Run old and new in parallel until verified

---

## Expected Outcomes

| Metric | Current | After Migration |
|--------|---------|----------------|
| Total lines | 76,520 | ~25,000 (estimated) |
| Duplication | ~57% | <5% |
| Files to edit for bug fix | 3-6 | 1 |
| Build time | 0 (no build) | <5s (Vite) |
| Type safety | None | Full TypeScript |
| Test coverage | 0% | Target 60%+ |
| Bundle size | ~760KB (technician) | ~150KB (estimated) |
| Deploy scope | Entire site | Per-app |


---

