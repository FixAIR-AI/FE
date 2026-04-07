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
