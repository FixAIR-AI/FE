# 02 — Data shapes

The shapes that flow through FixAIR at runtime. Each shape gets: purpose, storage location, field table, known issues. Line references are against `technician/index.html` at commit `fbbf8dd` unless noted.

This file is split across two commits because of size. Part A (this commit) covers only `projects.extracted_data` — the single largest and most important shape in the system. Part B covers everything else (chats, messages, webhook shapes, settings, users, calendar, signatures, localStorage).

---

## `projects.extracted_data` (jsonb)

The full report JSON. One row per intervention lives in `public.projects` (see `audit-v2/01_supabase_schema.sql:104`). `extracted_data` is the column; the in-memory mirror is the global `lastReportData` (declared `technician/index.html:10801`).

**Writers** — three, all merged through `unifiedMerge()` (`technician/index.html:13322`) after passing through `normalizeReportData()` (`technician/index.html:13059`):

| # | Source | Code site | Produced-by |
|---|--------|-----------|-------------|
| 1 | n8n extraction webhook response (`result.extracted_data`) | `technician/index.html:16220`, via `EXTRACTION_WEBHOOK` at `:9494` | assistant |
| 2 | Chat stream partial extractions | `:9253`, `:10256`, `:16553` | assistant |
| 3 | Drawer DOM edits via `drawerExtractDataFromDOM()` | `:15063`, `:15088` | technician |

**Readers** — drawer preview (`updateDrawerPreview` at `:9258`), Word export (`:10943`), `reports` row build (`saveReportData` at `:16667`), completion calc (`calculateReportCompletion` at `:7135`). Persisted by the debounced `extracted_data` save (`debouncedSaveExtractedData` at `:16261`) and the synchronous flush (`flushDrawerAutoSave` at `:15047`). On project load: `:10109–10112`.

### Anonymized example

```json
{
  "brand": "DAIKIN",
  "brand_key": "daikin",
  "status": "en_cours",
  "date": "12/04/2026",
  "reference": "RAP-2026-0412-0001",
  "numero_rapport": "RAP-2026-0412-0001",
  "resume": "Maintenance préventive annuelle VRV — 1 UE, 4 UI. RAS.",
  "type_intervention": "MAINTENANCE PRÉVENTIVE ANNUELLE",
  "type_operation": "MAINTENANCE PRÉVENTIVE ANNUELLE",
  "nature_intervention": "MAINTENANCE PRÉVENTIVE ANNUELLE",
  "conclusion": "Installation conforme, aucune action corrective requise.",
  "status_intervention": "resolu",
  "charge_totale": "8.4",
  "charge_usine": "8.0",
  "charge_appoint": "0.4",

  "intervention": {
    "type": "MAINTENANCE PRÉVENTIVE ANNUELLE",
    "type_label": "MAINTENANCE PRÉVENTIVE ANNUELLE",
    "type_detail": "Visite annuelle contractuelle — VRV IV"
  },

  "client": {
    "nom": "[REDACTED-CLIENT]",
    "societe": "Acme SAS",
    "contact": "Jean Exemple",
    "telephone": "01 23 45 67 89",
    "email": "jean.exemple@acme.example",
    "reference": "CLI-00042",
    "adresse": "10 rue de l'Exemple, 75000 Paris"
  },

  "site": {
    "adresse": "10 rue de l'Exemple",
    "ville": "Paris",
    "numero_affaire": "AFF-2026-0042",
    "postal": "75000",
    "country": "FR"
  },

  "equipements": [
    {
      "id": "ue-1",
      "marque": "DAIKIN",
      "modele": "RXYQ10U",
      "role": "ue",
      "type_ui": "",
      "numero_serie": "SN-UE-000001",
      "puissance": "28 kW"
    },
    {
      "id": "ui-1",
      "marque": "DAIKIN",
      "modele": "FXAQ32A",
      "role": "ui",
      "type_ui": "murale",
      "numero_serie": "SN-UI-000001",
      "puissance": "3.2 kW"
    }
  ],

  "systeme": {
    "type": "VRV",
    "modele": "RXYQ10U",
    "serie": "SN-UE-000001",
    "puissance": "28 kW",
    "garantie": "hors_garantie"
  },

  "fluide": {
    "type": "R410A",
    "charge_totale": "8.4 kg",
    "charge_initiale": "8.0 kg",
    "charge_appoint": "0.4 kg",
    "type_huile": "FVC68D"
  },
  "fluide_global": {
    "type": "R410A",
    "charge_totale_site_kg": 8.4,
    "charge_usine_kg": 8.0,
    "charge_appoint_kg": 0.4
  },

  "adressage": [
    {
      "adresse": "UI1",
      "equipement_id": "UI1",
      "ref_usine": "UI1",
      "modele": "FXAQ32A",
      "zone": "Bureau RDC",
      "designation": "Bureau RDC",
      "numero_serie": "SN-UI-000001"
    }
  ],

  "mesures": [
    {
      "label": "Pression HP",
      "type": "Pression HP",
      "valeur": "28.5",
      "valeur_texte": "28.5 bar",
      "unite": "bar",
      "status": "conforme",
      "sous_type": "circuit 1",
      "equipement_id": "ue-1"
    },
    {
      "label": "Température soufflage",
      "type": "Température soufflage",
      "valeur": "14",
      "valeur_texte": "14 °C",
      "unite": "°C",
      "status": "conforme",
      "sous_type": "",
      "equipement_id": "ui-1"
    }
  ],

  "codes_defaut": [],

  "travaux_effectues": [
    {
      "titre": "Nettoyage filtres UI",
      "texte": "Dépose, soufflage et rinçage des 4 filtres UI.",
      "contenu": "Dépose, soufflage et rinçage des 4 filtres UI.",
      "status": "done"
    },
    {
      "titre": "Contrôle pressions",
      "texte": "HP/BP relevées, valeurs dans les tolérances constructeur.",
      "contenu": "HP/BP relevées, valeurs dans les tolérances constructeur.",
      "status": "done"
    }
  ],

  "travaux_prevoir": [
    {
      "titre": "Remplacement filtres UI",
      "texte": "Prévoir un jeu complet de filtres sous 6 mois.",
      "priorite": "basse"
    }
  ],

  "reserves": [
    {
      "titre": "Accès UE restreint",
      "description": "Toiture accessible uniquement avec nacelle.",
      "texte": "Toiture accessible uniquement avec nacelle.",
      "type": "acces"
    }
  ],

  "recommandations": [
    {
      "titre": "Contrat d'entretien",
      "description": "Souscrire un contrat annuel pour garantir la longévité.",
      "texte": "Souscrire un contrat annuel pour garantir la longévité."
    }
  ],

  "resultat": {
    "status": "resolu",
    "label": "Résolu",
    "description": "Installation conforme, aucune action corrective requise.",
    "conclusion": "Installation conforme, aucune action corrective requise."
  },

  "technicien": {
    "nom": "[REDACTED-TECH]",
    "entreprise": "FixAIR Démo",
    "adresse": "1 avenue du Test, 75000 Paris",
    "email": "tech@fixair.example",
    "heure_arrivee": "09:15",
    "heure_depart": "11:40",
    "autres": ""
  },

  "signatures": {
    "client": { "image": "data:image/png;base64,iVBORw0KGgo...[truncated]" },
    "technicien": { "image": "data:image/png;base64,iVBORw0KGgo...[truncated]" },
    "nom_client": "Jean Exemple",
    "nom_technicien": "[REDACTED-TECH]"
  },

  "photos": [
    {
      "url": "https://[PROJECT].supabase.co/storage/v1/object/public/project-photos/USER_ID/PROJECT_ID/photo-1.jpg",
      "data": "",
      "caption": "Vue générale UE toiture",
      "name": "photo-1.jpg"
    }
  ],

  "observation_client": "Client présent, site accessible aux heures convenues.",
  "dates":        { "debut_date": "12/04/2026", "debut_heure": "09:15", "fin_date": "12/04/2026", "fin_heure": "11:40" },
  "securite":     { "etat": "conforme", "risques": "" },
  "tests":        { "pression_test_bar": "", "duree_test_heures": "", "valeur_vacuometre_mbar": "" },
  "tuyauteries":  { "longueur_totale_m": "42", "denivele_oc_ui_m": "6", "appoint_calcule_kg": "0.4" },
  "electrique":   { "calibre_disjoncteur": "32A", "section_cable": "4 mm²" },
  "releves_ue":   { "pd1_bar": "28.5", "ps_bar": "7.1", "ta_celsius": "22", "freq_inv1_hz": "62" },
  "pieces":       [],
  "rapport_technicien": "Visite conforme au contrat. Pas de défaut constaté.",
  "remarques": ""
}
```

### Field-by-field

Produced-by legend: **A** = assistant (n8n extraction webhook or chat stream), **T** = technician (drawer DOM edits), **S** = system (constructor/defaults), **M** = mixed (multiple sources, reconciled by `normalizeReportData`).

| Path | Produced-by | Req | Mirrored to `reports.*` | Known issues / legacy |
|---|---|---|---|---|
| `brand` | M (S on create `:9255`) | yes | `equipment_brand` | Uppercase brand name; `brand_key` is lowercase slug. Both exist for historical reasons. |
| `brand_key` | S (`:9255`) | yes | `equipment_brand` | — |
| `status` | S | yes | — | Free-form; `"en_cours"` set on create. Not the same as `projects.status`. |
| `date` | S (`new Date().toLocaleDateString('fr-FR')` `:9255`) | yes | — | French locale hard-coded — breaks for non-FR verticals. |
| `reference` / `numero_rapport` | A | no | `title` (via `saveReportData :16685`) | Duplicate fields — alias only. |
| `resume` | A | no | `problem_reported` (`:16690`) | — |
| `type_intervention` | A | no | `report_type` (`:16686`) | 3-way duplicated with `intervention.type|type_label|type_detail` + `type_operation` + `nature_intervention`. `normalizeReportData` picks longest candidate (`:13182–13203`). |
| `conclusion` (root) | M | no | — | Duplicates `resultat.conclusion`; kept for "backward compat" per code comment `:13300`. |
| `status_intervention` (root) | M | no | — | Duplicates `resultat.status`; `normalizeReportData:13256` maps FR→slug. |
| `charge_totale` / `charge_usine` / `charge_appoint` (root) | M | no | — | Duplicates `fluide.*`. R4-FIX1 `:13072–13078, :13127–13129`. |
| `intervention.{type,type_label,type_detail}` | A | no | — | See `type_intervention` above. |
| `client.{nom,societe,contact,telephone,email,reference,adresse}` | A+T | no | `client_name` = `societe` (`:16695`) | `nom` rarely populated; `societe` is the de-facto client name. |
| `site.{adresse,ville,numero_affaire,postal,country}` | A+T | no | `client_address` = `adresse + ', ' + ville` (`:16696`) | — |
| `equipements[].{id,marque,modele,role,type_ui,numero_serie,puissance}` | A+T | no | — | `role` enum: `ue\|ui\|outdoor\|indoor\|unite_exterieure`. Bidirectionally synced with `systeme` (`:13131–13152`). HVAC-specific. |
| `systeme.{type,modele,serie,puissance,garantie}` | A+T | no | `equipment_model` = `.modele`, `equipment_type` = `.type` (`:16688`) | Back-filled from `equipements[0]` or injected as `id:"sys-1"`. HVAC-specific. |
| `fluide.{type,charge_totale,charge_initiale,charge_appoint,type_huile}` | A+T | no | — | String values with " kg" suffix; `cleanKg` strips double-kg (`:13065,:13108`). HVAC-refrigerant-specific — not applicable to electrical verticals. |
| `fluide_global.{type,charge_totale_site_kg,charge_usine_kg,charge_appoint_kg}` | M | no | — | Numeric mirror of `fluide` for queryability. 3-way sync `:13080–13124`. |
| `adressage[].{adresse,equipement_id,ref_usine,modele,zone,designation,numero_serie,serie,model}` | A+T | no | — | Per-indoor-unit addressing table. Every field has ≥1 alias synced in `:13217–13233`. HVAC-specific. |
| `mesures[].{label,type,valeur,valeur_texte,unite,status,sous_type,equipement_id,_normalizedLabel,_normalizedType}` | A+T | no | — | `_normalized*` are internal caches for dedup (`:13211`). Label alias map via `normalizeMesureLabel`. |
| `codes_defaut[].{code,description,resolution}` | A | no | `error_codes` (`:16693`) | **Mostly empty post-`fbbf8dd`.** Diagnostic pivot removed the extractor paths that populated this; schema kept for legacy rows. |
| `travaux_effectues[].{titre,texte,contenu,status}` | A+T | no | `actions_performed` (`:16694`) | `texte` and `contenu` kept as aliases (`:13154–13160`). Status enum: `done\|error\|pending`. |
| `travaux_prevoir[].{titre,texte,priorite}` | A+T | no | — | — |
| `reserves[].{titre,description,texte,type}` | A+T | no | — | May arrive as bare string; `:13169–13174` coerces to object. `description` ↔ `texte` synced. |
| `recommandations[].{titre,description,texte}` | A+T | no | — | Same string-coercion pattern as `reserves` (`:13236–13245`). |
| `resultat.{status,label,description,conclusion}` | M | no | `problem_identified` = `.description` (`:16691`) | 4-way reconcile with root-level `conclusion`/`status_intervention`/`resultat_intervention` (`:13247–13302`). Status enum: `resolu\|en_cours\|non_resolu\|en_attente_pieces`. Prefix-strip regex `:13283–13296`. |
| `technicien.{nom,entreprise,adresse,email,heure_arrivee,heure_depart,autres}` | T | no | — | `"HH:MM"` placeholder stripped (`:13304–13310`). |
| `signatures.{client.image,technicien.image,nom_client,nom_technicien}` | T | no | — | `image` is base64 data-URL; signatures live inline in jsonb — can push the row past 1 MB. See Part B. |
| `photos[].{url,data,caption,name}` | T | no | — | **Duplicates `projects.photos`** (separate jsonb column, `:10096`). `url` points at `project-photos` bucket; `data` is sometimes base64 for photos pending upload. Report export reads from here, not from `projects.photos`. |
| `observation_client` | T | no | — | — |
| `dates.{debut_date,debut_heure,fin_date,fin_heure}` | T | no | — | Separate from `technicien.heure_arrivee/depart`; both are populated independently. |
| `securite.{etat,risques}` | T | no | — | — |
| `tests.{pression_test_bar,duree_test_heures,valeur_vacuometre_mbar}` | T | no | — | HVAC-specific (pressure/vacuum test of refrigerant circuit). |
| `tuyauteries.{longueur_totale_m,denivele_oc_ui_m,appoint_calcule_kg}` | T | no | — | HVAC-specific (refrigerant piping). |
| `electrique.{calibre_disjoncteur,section_cable}` | T | no | — | Small — electrician vertical will expand this substantially. |
| `releves_ue.{pd1_bar,ps_bar,ta_celsius,freq_inv1_hz}` | T | no | — | HVAC-specific (outdoor unit live readings). |
| `pieces[].{reference,designation,quantite}` | T | no | — | Parts list. Integer `quantite`. |
| `rapport_technicien` | T | no | `solution_description` (`:16692`) | Free-text — the "body" of the report. |
| `remarques` | T | no | — | — |

### Known issues at the shape level

1. **No schema enforcement.** `extracted_data` is `jsonb` with no validator. All reconciliation is in `normalizeReportData`; anything that bypasses it writes arbitrary shapes. A future port should front this with Zod.
2. **Three-way fluide sync (`:13062–13129`)** carries `fluide`, `fluide_global`, and root-level `charge_*` — every writer must update all three or `normalizeReportData` will silently reconcile them. Net effect: the row often contains the same kg value 3 times in 3 formats.
3. **Array replace semantics.** `unifiedMerge` (`:13322–13346`) **replaces** `travaux_effectues`, `travaux_prevoir`, `recommandations` wholesale on every chat update — technician edits to these lists are lost the moment the assistant re-emits the array. Documented as intentional but routinely trips users.
4. **Legacy `codes_defaut`.** Diagnostic pivot (`fbbf8dd`) removed the extractor paths but not the column, the UI, or the export branch. Existing rows retain stale codes; new rows arrive empty.
5. **`photos` duplication.** `extracted_data.photos[]` and `projects.photos` (column) coexist. Word export (`:10943`) reads the jsonb copy only.
6. **Row size.** Two base64 signature PNGs plus embedded photo data-URLs routinely push one row past 500 KB. Supabase REST row limit is 1 MB; observed truncation when >3 photos are saved as `data:` URLs instead of uploaded.
7. **FR-locale coupling.** Dates (`toLocaleDateString('fr-FR')`), status slugs (`resolu`/`non_resolu`/`en_cours`/`en_attente`), and prefix-strip regexes (`Conclusion:`, `Statut:`, `Description:`) are hard-coded. i18n requires touching `normalizeReportData`.
8. **HVAC-specific top-level keys** that a non-HVAC vertical (Qbe/electricians) must drop or remodel: `equipements[].role='ue|ui'`, `systeme`, `fluide`, `fluide_global`, `adressage[]`, `tests` (pressure/vacuum), `tuyauteries`, `releves_ue`. See `08_vertical_specific_vs_agnostic.md` for the full fork map.

<!-- PART A ENDS HERE — remaining shapes added in next commit -->
