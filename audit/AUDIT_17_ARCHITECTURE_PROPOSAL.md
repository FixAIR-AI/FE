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
