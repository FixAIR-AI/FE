# FixAIR - Word Export Template Structure

## Source
`generateWord()` function at line ~11282 in `/technician/index.html`

## Document Structure

### Design Constants
| Constant | Value | Usage |
|----------|-------|-------|
| CORAL | #E85D4A | Subtitle, accent highlights |
| DARK | #2D3436 | Titles, dark text |
| TEAL | #2D5F5D | Section headings, table headers |
| GRAY | #888888 | Secondary text, references |
| BODY | #333333 | Body text |
| TBL_BORDER_COLOR | #CCCCCC | Table borders |
| TBL_ALT | #F5F5F5 | Alternating table rows |

### Section 1: Cover Page

```
┌──────────────────────────────────────────────┐
│ Header: [FixAIR Logo] | [Brand|Ref|Date]     │
│──────────────────────────────────────────────│
│                                              │
│        [Company Logo - if uploaded]          │
│                                              │
│       RAPPORT D'INTERVENTION                 │
│        (28pt bold, charcoal, center)         │
│                                              │
│           DIAGNOSTIC                         │
│        (22pt bold, coral, center)            │
│                                              │
│             DAIKIN                            │
│        (14pt bold, charcoal, center)         │
│                                              │
│  ┌────────────────────────────────────┐      │
│  │     Customer Name (18pt bold)      │      │
│  │     Customer Address (12pt)        │      │
│  │     Réf: XXX | 01/01/2026 (italic) │      │
│  └────────────────────────────────────┘      │
│                                              │
│                                              │
│                                              │
│  Préparé par: Tech Name                      │
│                                              │
│──────────────────────────────────────────────│
│ Footer: Company Name, Company Address        │
└──────────────────────────────────────────────┘
```

### Section 2: Content Pages

```
┌──────────────────────────────────────────────┐
│ Header: [FixAIR Logo] | [Brand|Ref|Date]     │
│──────────────────────────────────────────────│
│                                              │
│  1. RÉSUMÉ                                   │
│  [Body text paragraph]                       │
│                                              │
│  2. SITE & CLIENT                            │
│  ┌──────────────┬──────────────┐             │
│  │ Client: XXX  │ Adresse: XXX │             │
│  │ Contact: XXX │ Ville: XXX   │             │
│  │ Tél: XXX     │ Réf: XXX     │             │
│  └──────────────┴──────────────┘             │
│                                              │
│  3. DATES D'INTERVENTION (if present)        │
│  [Date/time info]                            │
│                                              │
│  4. ÉQUIPEMENT                               │
│  4.1 Système                                 │
│  [Equipment details]                         │
│  4.2 Fluide Frigorigène                      │
│  [Fluid details]                             │
│                                              │
│  5. ADRESSAGE UNITÉS                         │
│  ┌─────┬────────┬──────┬─────────┐           │
│  │ Adr │ Modèle │ Zone │ N°Série │           │
│  ├─────┼────────┼──────┼─────────┤           │
│  │ UI1 │ FXSA50 │ Salle│ ABC123  │           │
│  └─────┴────────┴──────┴─────────┘           │
│                                              │
│  6. CODES DÉFAUT                             │
│  ┌──────┬─────────────┬────────────┐         │
│  │ Code │ Description │ Résolution │         │
│  └──────┴─────────────┴────────────┘         │
│                                              │
│  7. SÉCURITÉ (if present)                    │
│  [State + risks]                             │
│                                              │
│  8. MESURES                                  │
│  ┌───────────┬────────┬─────────────┐        │
│  │ Paramètre │ Valeur │ Observation │        │
│  └───────────┴────────┴─────────────┘        │
│                                              │
│  9. FONCTIONNEMENT (if present)              │
│                                              │
│  10. TRAVAUX EFFECTUÉS                       │
│  ✓ Task description (done)                   │
│  ✗ Task description (error)                  │
│  ○ Task description (pending)                │
│                                              │
│  11. TRAVAUX À PRÉVOIR                       │
│  [With priority colors]                      │
│                                              │
│  12. PIÈCES UTILISÉES (if present)           │
│  ┌───────────┬─────────────┬─────┐           │
│  │ Référence │ Désignation │ Qté │           │
│  └───────────┴─────────────┴─────┘           │
│                                              │
│  13+ ADDITIONAL SECTIONS (conditional):      │
│  - Rapport Technicien                        │
│  - Remarques                                 │
│  - Tests Mise en Service                     │
│  - Tuyauteries                               │
│  - Électrique                                │
│  - Relevés Unité Extérieure                  │
│  - Observation Client                        │
│  - Signatures (with images)                  │
│  - Photos (grid layout)                      │
│                                              │
│──────────────────────────────────────────────│
│ Footer: [Tech Name] | [Company] | [Page X]   │
└──────────────────────────────────────────────┘
```

## Data Source for Export

The `generateWord(data)` function receives `data` directly (typically `lastReportData`).

### Key Data Mappings (line ~11313)
```javascript
subtitle    = data.type_intervention || 'DIAGNOSTIC'
brand       = data.marque || data.equipement?.marque || data.brand
customerName = data.client?.nom || data.nom_client || data.client?.societe
customerAddr = data.client?.adresse || [data.site?.adresse, data.site?.ville]
reference   = data.reference || data.numero_rapport
dateStr     = data.date || new Date().toLocaleDateString('fr-FR')
techName    = data.technicien?.nom (filtered: 'FixAIR Assistant' → '')
companyName = data.technicien?.entreprise || data.entreprise || data.company_name || currentUser?.company_name
companyAddr = data.technicien?.adresse || data.adresse
```

## Libraries Used
- **docx.js** (`window.docx`) - Document creation
- **FileSaver** (`saveAs`) - Blob download
- **FixAIR logo** - Hardcoded base64 PNG (`FIXAIR_LOGO_BASE64`)
- **Company logo** - From `currentUser.company_logo` (base64 data URI, NEW)
