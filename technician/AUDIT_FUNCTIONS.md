# FixAIR - Function Inventory

## Source File
`/technician/index.html` (~21,500 lines)

## Core Report Functions

| Function | Line | Purpose | Input | Output |
|----------|------|---------|-------|--------|
| `normalizeReportData(data)` | ~13289 | Normalizes field names and syncs aliases | Raw report JSON | Normalized report JSON |
| `unifiedMerge(target, source)` | ~13552 | Smart merge of old + new report data | Two report objects | Merged report object |
| `updateDrawerPreview(data)` | ~12739 | Refreshes the drawer UI with report data | ReportData | void |
| `renderReportPreviewV12(data, completionStatus)` | ~14574 | Generates editable HTML blocks for drawer | ReportData, status | HTML string |
| `createBlockHTML(type, content, fieldId, dataAttrs)` | ~14583 | Creates a single draggable/editable block | Block params | HTML string |
| `generateWord(data)` | ~11282 | Creates and downloads Word document | ReportData | Blob (downloads) |
| `drawerExtractDataFromDOM()` | varies | Extracts current data from drawer DOM | void | ReportData |
| `drawerAutoSave()` | ~14880 | Saves drawer edits on blur events | void | void |
| `drawerSaveState()` | ~14876 | Saves undo state on focus events | void | void |

## Word Export Helper Functions (inside generateWord)

| Function | Line | Purpose |
|----------|------|---------|
| `sectionHeading(text)` | ~11329 | Numbered section header (teal, 14pt bold) |
| `subsectionHeading(prefix, text)` | ~11338 | Sub-section header (teal, 12pt underlined) |
| `subsubHeading(text)` | ~11344 | Sub-sub header (teal, 11pt bold) |
| `bodyText(text)` | ~11350 | Body paragraph (10.5pt, #333) |
| `bulletItem(keyword, description)` | ~11359 | Bullet with bold keyword |
| `createTable(headers, rows)` | varies | Professional table with teal headers |
| `infoBox(leftItems, rightItems)` | varies | Two-column info layout |
| `b64toU8(base64)` | ~11301 | Convert base64 to Uint8Array for images |

## Profile & User Functions

| Function | Line | Purpose |
|----------|------|---------|
| `openProfile()` | ~8454 | Opens profile view via Router |
| `closeProfile()` | ~8458 | Closes profile, checks onboarding |
| `saveProfile()` | ~8476 | Saves profile to localStorage + Supabase |
| `loadUserDashboard(userSlug)` | ~8266 | Loads user data, populates profile fields |
| `saveCompanySettings()` | NEW | Saves company name + logo to Supabase |
| `loadCompanySettings()` | NEW | Loads company settings into profile UI |
| `initLogoUpload()` | NEW | Initializes logo drag-drop and click upload |
| `processLogoFile(file)` | NEW | Validates and previews uploaded logo |
| `removeCompanyLogo()` | NEW | Clears logo from preview and data |

## Data Flow Functions

| Function | Line | Purpose |
|----------|------|---------|
| `normalizeMesureLabel()` | varies | Maps 30+ measurement name variations to standard labels |
| `exportReport(format)` | varies | Dispatch export (calls generateWord for 'word') |

## Supabase Operations

| Operation | Table | Line | Purpose |
|-----------|-------|------|---------|
| `SELECT *` | users | ~8271 | Load full user profile |
| `UPDATE` | users | ~8546 | Save profile (first_name, last_name, phone, language) |
| `UPDATE` | users | NEW | Save company_name, company_logo |
| `UPDATE` | projects | ~7558 | Update completion status |
| `SELECT` | app_settings | ~7791 | Load app configuration |
