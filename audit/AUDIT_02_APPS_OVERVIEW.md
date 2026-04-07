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

### Security Note
This is the most privileged app - has direct REST API access to any table. [SECURITY - HIGH]

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
