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
