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

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 3 (#2, #5, #7) |
| MEDIUM | 5 (#3, #4, #6, #8, #10) |
| LOW | 2 (#9, #13) |
| INFO | 3 (#1, #11, #12) |

### Top Priority Fixes
1. **Fix dev webhook URLs** in technician app (#2)
2. **Server-side freemium enforcement** (#7)
3. **Whitelist tables** in master app REST API calls (#5)
4. **Add CSP headers** (#3)
5. **Audit innerHTML** for XSS vectors (#4)
