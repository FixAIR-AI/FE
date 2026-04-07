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
