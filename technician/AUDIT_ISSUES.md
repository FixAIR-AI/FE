# FixAIR - Audit Issues & Recommendations

## Issues Found

### 1. Drawer ↔ Word Export Gaps

| Issue | Severity | Details |
|-------|----------|---------|
| Drawer has "Observation(s) Client" block | LOW | Rendered in drawer (line ~14819) but may not always export to Word if `observation_client` field is empty |
| Word export has more sections than drawer | MEDIUM | Word generates Sécurité, Fonctionnement, Tests, Tuyauteries, Électrique, Relevés UE sections that don't have corresponding editable drawer blocks |
| Photo handling differs | MEDIUM | Drawer renders photo thumbnails with captions; Word export needs base64/URL conversion that may fail silently |

### 2. Data Normalization Issues

| Issue | Severity | Details |
|-------|----------|---------|
| Multiple field aliases for same data | MEDIUM | e.g., `contenu` vs `texte` in travaux_effectues - normalization syncs them but code inconsistently reads one or the other |
| Fluid data triple-sync | LOW | `fluide`, `fluide_global`, and root-level fluid fields all synced. Risk of circular overwrites |
| Intervention type from 5+ sources | MEDIUM | `type_intervention`, `intervention.type`, `intervention.type_label`, `type_operation`, `nature_intervention` - "longest wins" strategy may pick wrong value |

### 3. Word Export Issues

| Issue | Severity | Details |
|-------|----------|---------|
| Company name fallback chain | LOW | Now includes `currentUser?.company_name` as fallback (added in this update) |
| Hardcoded FixAIR logo only in headers | INFO | Headers always show FixAIR logo, not company logo. Consider making configurable |
| No error handling for large photos | MEDIUM | Large base64 photos in Word export could cause memory issues or corrupt documents |
| Signature images may be missing | LOW | Signatures block renders even without image data, creating empty space |

### 4. Profile/Settings Issues

| Issue | Severity | Details |
|-------|----------|---------|
| No company_name/company_logo columns yet | HIGH | Supabase `users` table needs ALTER TABLE to add these columns |
| Logo stored as base64 in DB | MEDIUM | Large logos (up to 2MB base64) stored directly in users table. Consider Supabase Storage bucket instead for production scale |
| No SVG sanitization | LOW | SVG uploads accepted without XSS sanitization |

### 5. General Architecture

| Issue | Severity | Details |
|-------|----------|---------|
| Single-file architecture | INFO | ~21,500 lines in one HTML file makes maintenance difficult |
| Global state management | MEDIUM | `lastReportData`, `currentUser`, `companyLogoData` all global variables |
| No offline support | LOW | Logo upload requires network for Supabase save |

## Recommendations

### Immediate Actions (Before Go-Live)

1. **Run Supabase migration** to add `company_name` and `company_logo` columns to `users` table:
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name TEXT;
   ALTER TABLE users ADD COLUMN IF NOT EXISTS company_logo TEXT;
   ```

2. **Test logo upload** with various formats (PNG, JPG, SVG) and sizes

3. **Test Word export** with and without company logo to verify document renders correctly

### Short-Term Improvements

4. **Add SVG sanitization** - Strip `<script>` tags and event handlers from SVG uploads
5. **Add loading indicator** during logo upload/save
6. **Consider Supabase Storage** for logo files instead of base64 in DB column

### Medium-Term Improvements

7. **Add missing drawer blocks** for Word-only sections (sécurité, fonctionnement, etc.)
8. **Improve photo handling** - Add size limits and compression before Word export
9. **Add company logo to Word headers** as option (alongside or replacing FixAIR logo)

### Long-Term Architecture

10. **Modularize codebase** - Extract Word export, drawer rendering, profile management into separate files
11. **Move to component-based architecture** if the app grows further
12. **Add proper state management** instead of global variables
