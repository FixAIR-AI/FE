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
