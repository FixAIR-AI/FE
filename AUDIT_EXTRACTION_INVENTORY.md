# AUDIT_EXTRACTION_INVENTORY

**Scope:** read-only audit of `technician/index.html` (20 994 lines) on branch `claude/audit-fixair-data-fields-yaset` (the requested `dev` branch does not exist on the remote — see "Branch note" below).
**Subject:** the **filling-the-report logic** that lives in the HTML, not the N8N extraction prompts.
**Goal:** complete inventory of fields the front-end expects, ahead of the Cube (QBE) port.

> Branch note — the user asked to audit `dev`. `git fetch origin dev` returns *fatal: couldn't find remote ref dev*. The audit was carried out on `claude/audit-fixair-data-fields-yaset`, which contains the latest commits referenced in the audit notes (`refactor(technician): Remove all diagnostic logic — pivot to reporting-only`, `fbbf8dd`).

---

## Q1. Data state shape — `lastReportData`

The single global is declared at `technician/index.html:10801`:

```js
let lastReportData = null;
```

It is hydrated from Supabase `projects.extracted_data` (`L10110`), then mutated in-place by `unifiedMerge` (`L9257`, `L10260`, `L13022`), `mergeReportData` (`L12725`, `L12737`), `buildPartialReport` (`L12704`–`L13024`), drawer auto-save (`L14977`), and `setNestedValue` (`L7402`).

`collectReportData()` (`L10940`) clones it, calls `normalizeReportData()`, then attaches photos and signatures from the DOM before export.

### Top-level keys

| Key | Type | Description | Read by | Written by |
|---|---|---|---|---|
| `brand` | string | Display brand label, e.g. "Mitsubishi Electric" | `generateWord` (L11036), drawer header, persisted | `buildPartialReport` (L12705), Supabase load |
| `brand_key` | string | Lowercase brand key, e.g. "mitsubishi" | `renderReportPreview` (L13516) | `buildPartialReport` (L12706) |
| `status` | string | Lifecycle status: `en_cours` \| `complet` | drawer footer (L12565), Supabase | `buildPartialReport` (L12707), `generateWord` post-export (L12482) |
| `exported_at` | string (ISO) | Timestamp of last Word export | persisted only | `generateWord` post-export (L12483) |
| `date` | string | Intervention date, FR locale | Word cover (L11040) | `buildPartialReport` (L12708) |
| `reference` | string | Report reference number | Word cover (L11039) | N8N + chat |
| `numero_rapport` | string | Alias for `reference` | Word cover fallback (L11039) | N8N + chat |
| `resume` | string | Executive summary narrative | Word §2 (L11345), drawer §"Résumé" (L14374) | N8N AI |
| `type_intervention` | string | Top-level intervention type label | Word title (L11035), normalize (L13183) | `buildPartialReport` (L12767), normalize (L13197) |
| `type_operation` | string | Alternate alias of `type_intervention` | normalize (L13187) | normalize (L13201) |
| `nature_intervention` | string | Alternate alias of `type_intervention` | normalize (L13188) | normalize (L13202) |
| `intervention` | object | Nested type detail — see schema below | drawer (L14368), normalize | normalize (L13197–L13199) |
| `client` | object | Customer block — see schema below | Word cover + §3, drawer §"Client" | N8N + chat |
| `site` | object | Site block — see schema below | Word cover + §3, drawer §"Site" | N8N + chat |
| `equipements` | array | Equipment list — see schema below | drawer §"Équipements" (L14406), normalize (L13132) | N8N + normalize (L13144) |
| `systeme` | object | Outdoor-unit summary — see schema below | Word §5 (L11384–L11388), normalize (L13133) | N8N + normalize (L13144) |
| `fluide` | object | Refrigerant block — see schema below | Word §5 (L11391–L11394), normalize | N8N + chat + `buildPartialReport` (L12975, L12984, L12989) |
| `fluide_global` | object | Numeric mirror of `fluide` — see schema below | drawer fluide block (L14465) | normalize (L13082–L13095) |
| `charge_totale` / `charge_usine` / `charge_appoint` | string (root mirrors) | Backward-compat root copies | `generateWord`? No (only via `fluide`) | normalize (L13127–L13129) |
| `adressage` | array | Indoor-unit table — see schema below | Word §6 (L11400), drawer §"Adressage" (L14436) | N8N + `buildPartialReport` (L12915, L12961) |
| `mesures` | array | Measurement table — see schema below | Word §9 (L11456), drawer §"Mesures" (L14483) | N8N |
| `codes_defaut` | array | Fault codes — see schema below | Word §7 (L11427) | N8N + `buildPartialReport` (L12832) |
| `travaux_effectues` | array | Completed work — see schema below | Word §11 (L11475), drawer (L14506), normalize (L13156) | N8N (REPLACE) |
| `travaux_prevoir` | array | Planned work — see schema below | Word §12 (L11515) | N8N (REPLACE) |
| `pieces` | array | Spare parts — see schema below | Word §13 (L11534) | N8N |
| `reserves` | array | Reservations / outstanding items — see schema below | Word §22 sub-réserves (L11670), drawer §"Réserves" (L14515), normalize (L13164) | N8N + chat |
| `recommandations` | array | Recommendations — see schema below | Word §22 sub-recos (L11704), drawer (L14524), normalize (L13237) | N8N (REPLACE) |
| `prochaine_visite` | string | Next-visit narrative | Word §22 sub-block (L11690) | N8N |
| `resultat` | object | Result/status block — see schema below | Word §22 (L11645), drawer §"Résultat" (L14541), normalize (L13252–L13297) | N8N + chat + `buildPartialReport` (L13007–L13013) + normalize |
| `resultat_intervention` | string | Free-text alias of `resultat.description` | normalize (L13267) | N8N |
| `status_intervention` | string | Alias of `resultat.status` | normalize (L13256) | N8N |
| `conclusion` | string | Free-text mirror of `resultat.conclusion` | normalize (L13252, L13300) | normalize |
| `securite` | object | Safety block — see schema below | Word §8 (L11437) | N8N |
| `tests` | object | MES pressure/vacuum tests — see schema below | Word §16 (L11555) | N8N |
| `tuyauteries` | object | Pipework — see schema below | Word §17 (L11569) | N8N |
| `electrique` | object | Electrical — see schema below | Word §18 (L11583) | N8N |
| `releves_ue` | object | Outdoor-unit operating data — see schema below | Word §19 (L11592) | N8N |
| `releves_ui` | array | Indoor-unit operating data — see schema below | Word §20 (L11607) | N8N |
| `cerfa` | object | CERFA fluid summary — see schema below | Word §21 (L11616) | N8N |
| `fonctionnement` | object | Compressor running data — see schema below | Word §10 (L11466) | N8N |
| `technicien` | object | Technician identity + hours — see schema below | Word §23 (L11724), drawer §"Intervenant" (L14396), normalize (L13304) | N8N + chat + `buildPartialReport` (L12996, L13000) |
| `nom_technicien` / `technician_name` | string | Backward-compat aliases | Word cover fallback (L11041) | N8N |
| `entreprise` / `company_name` | string | Backward-compat aliases | Word cover fallback (L11043) | N8N |
| `signatures` | object | Signatures + signer names — see schema below | Word §26 (L11831), drawer §"Signatures" (L14595) | `collectReportData` (L10960) |
| `signature_client` / `signature_technicien` | string | Legacy flat-signature fields (data URI) | drawer fallback (L14595) | legacy data |
| `nom_client` | string | Backward-compat customer name | Word cover fallback (L11037) | N8N |
| `adresse` | string | Backward-compat root address | Word cover fallback (L11038) | N8N |
| `marque` | string | Backward-compat brand label | Word cover fallback (L11036) | N8N |
| `equipement` | object | Backward-compat single-equipment with `.marque` | Word cover fallback (L11036) | N8N |
| `observation_client` | string | Free-text client observation | Word §24 (L11739), drawer §"Observation Client" (L14590) | drawer |
| `dates` | object | Start/end date+heure — see schema below | Word §4 (L11367) | N8N |
| `photos` | array | Intervention photos — see schema below | Word §25 (L11750) | `collectReportData` (L10947), `window.reportPhotos` |
| `rapport_technicien` | string | Free narrative | Word §14 (L11543) | N8N |
| `remarques` | string | Free remarks | Word §15 (L11549) | N8N |

### Nested schemas

```text
intervention { type, type_label, type_detail }
client { nom, societe, contact, telephone, email, reference, adresse }
site { adresse, ville, numero_affaire, postal, country }
equipements [{ id, marque, modele, role, type_ui, numero_serie, puissance }]
systeme { type, modele, serie, puissance, garantie }
fluide { type, charge_totale, charge_initiale, charge_appoint, type_huile }
fluide_global { type, charge_totale_site_kg, charge_usine_kg, charge_appoint_kg }
adressage [{ adresse, equipement_id, ref_usine, modele/model, zone/designation, numero_serie/serie, commentaire }]
mesures [{ label/type, valeur/valeur_texte, unite, status, sous_type, equipement_id, note, _normalizedLabel, _normalizedType }]
codes_defaut [{ code, description, resolution }]
travaux_effectues [{ titre, texte/contenu, status }]   // status: 'done' | 'error' | 'pending'
travaux_prevoir [{ titre, texte, priorite }]            // priorite: 'urgent' | 'normal' | 'optionnel'
pieces [{ reference, designation, quantite }]
reserves [{ titre, description, texte, type }]          // strings auto-wrapped at L13170
recommandations [{ titre, description, texte }]
resultat { status, label, description, conclusion }     // status: 'resolu' | 'en_cours' | 'non_resolu' | 'en_attente_pieces' | 'partiellement' | 'intervention_requise'
securite { etat, risques }                              // etat: 'OK' | 'À surveiller' | 'Critique'
tests { pression_test_bar, duree_test_heures, valeur_vacuometre_mbar }
tuyauteries { longueur_totale_m, denivele_oc_ui_m, appoint_calcule_kg }
electrique { calibre_disjoncteur, section_cable }
releves_ue { pd1_bar, ps_bar, ta_celsius, freq_inv1_hz }
releves_ui [{ nom, temp_soufflage, temp_reprise, delta }]
cerfa { fluide_total_charge_kg, fluide_total_recupere_kg, attestation_capacite }
fonctionnement { heures_compresseur, nb_demarrages }
technicien { nom, entreprise, adresse, email, heure_arrivee, heure_depart, autres }
signatures { client (string|{ image, nom }), technicien (string|{ image, nom }), nom_client, nom_technicien }
dates { debut_date, debut_heure, fin_date, fin_heure }
photos [{ url, data, caption, name, originalData }]
```

**Distinct top-level keys observed: 51** (counting strict aliases like `marque`/`brand` separately).
**Distinct *unique-shape* fields (collapsing aliases): ~38.**

---

## Q2. Extraction triggers — `buildPartialReport()` pattern map

Function span: `L12667`–`L13025`. The function does two passes: (1) parse fenced ```json``` and `[REPORT_DATA]…[/REPORT_DATA]` blocks from the AI replies and feed them through `mergeReportData`, then (2) regex-scan the *user* messages as a fallback. Only the regex pass is true "extraction" performed in the HTML — the JSON pass is just a transport.

> **R5_PATCH_B-1** is applied: line 12704 reads `JSON.parse(JSON.stringify(lastReportData))` (deep copy). Without it, `mergeReportData(partialData, …)` would mutate the shared arrays of `lastReportData` directly.

| # | Field populated | Detection logic (verbatim) | Strategy | Type | Bug refs |
|---|---|---|---|---|---|
| 2.1 | `parsed.report_data \| parsed.extraction` (whole tree) | <code>aiMsg.match(/\`\`\`json\s*([\s\S]*?)\s*\`\`\`/g)</code> then `JSON.parse` | merge via `mergeReportData` | object | — |
| 2.2 | Same | `aiMsg.match(/\[REPORT_DATA\]([\s\S]*?)\[\/REPORT_DATA\]/)` | merge via `mergeReportData` | object | — |
| 2.3 | `type_intervention` (correction-priority) | `(?:en fait\|correction\|plutôt\|non c'?est)[^.]{0,50}?(maintenance préventive avec dépannage\|maintenance préventive\|dépannage\|mise en service\|installation)` | If matched, **always overwrites** (`partialData.type_intervention = …`) — last-write-wins inside this pass | primitive | **R5_PATCH_B-2** applied (L12748–L12768) |
| 2.4 | `type_intervention` (compound first) | `allText.includes('maintenance préventive') && (includes('dépannage') \|\| includes('panne'))` → `'Maintenance préventive avec dépannage'` | overwrite | primitive | R5_PATCH_B-2 |
| 2.5 | `type_intervention` (preventive) | `allText.includes('maintenance préventive')` → `'Maintenance préventive'` | overwrite | primitive | R5_PATCH_B-2 |
| 2.6 | `type_intervention` (MES) | `allText.includes('mise en service') \|\| allText.match(/\bmes\b/)` → `'Mise en service'` | overwrite | primitive | R5_PATCH_B-2 |
| 2.7 | `type_intervention` (maintenance) | `allText.includes('maintenance') \|\| allText.includes('entretien')` → `'Maintenance'` | overwrite | primitive | R5_PATCH_B-2 |
| 2.8 | `type_intervention` (SAV) | `allText.includes('dépannage') \|\| allText.includes('sav') \|\| allText.includes('panne')` → `'SAV / Dépannage'` | overwrite | primitive | R5_PATCH_B-2 |
| 2.9 | `type_intervention` (install) | `allText.includes('installation')` → `'Installation'` | overwrite | primitive | R5_PATCH_B-2 |
| 2.10 | `client.societe` | `/(?:chez\|client\|société\|pour)\s+([A-ZÀ-Ÿ][a-zà-ÿA-ZÀ-Ÿ\s]{2,40})/i` and `/(?:client\|société)\s*:\s*([^\n,]+)/i` | **first-write-wins** (`if (!partialData.client?.societe)`) | primitive | — |
| 2.11 | `site.adresse` | `/(\d{1,4}[\s,]+(?:rue\|avenue\|boulevard\|bd\|av\|allée\|place\|chemin)[\s\w\-'']+)/i` | first-write-wins | primitive | — |
| 2.12 | `site.ville` | `/(\d{5})\s*([A-ZÀ-Ÿa-zà-ÿ\s\-]+)/` | first-write-wins | primitive | — |
| 2.13 | `codes_defaut[].code` | Six patterns (`/(?:code\|erreur\|défaut\|fault\|error)\s*(?:code)?\s*:?\s*([A-Z]?\d{2,5}[A-Z]?)/gi`, `/\b([7][0-9]{3})\b/g`, `/\b([EAUFPH]\d{1,3})\b/gi`, `/\b(U\d{1,2})\b/gi`, `/\b([AUELJ][0-9]{1,3})\b/gi`, `/(?:affiche\|indique\|montre)\s+(?:le\s+)?(?:code\s+)?([A-Z0-9]{2,6})/gi`). False-positive filter: `!/^(2024\|2025\|0[1-9]\|1[0-2])$/.test(code)` | **incremental append** — adds each new code that isn't in `existingCodes` Set | array | **R5_PATCH_B-3** applied (L12804–L12840). Hard-coded year filter is brittle past 2025. |
| 2.14 | `systeme.modele` + `systeme.type` | Four manufacturer patterns: `/(PUHY\|PURY\|PUMY\|PEFY\|PLFY\|PKFY\|MSZ\|MUZ\|FDC\|FDCA)[\s\-]?([A-Z0-9\-]{3,20})/gi` (Mitsubishi), `/(FXMQ\|FXAQ\|FXZQ\|FDXM\|RXM\|RXYQ\|RXYSQ)[\s\-]?([A-Z0-9]{2,15})/gi` (Daikin), `/(38VT\|30RB\|30XA\|42N)[\s\-]?([A-Z0-9]{3,15})/gi` (Carrier), `/(VRV\|VRF\|DVM\|MULTI[\s\-]?V)[\s\-]?([A-Z0-9\-]{0,15})/gi`. Type derived from prefix. | first-write-wins (`if (!partialData.systeme?.modele)`) | primitive | — |
| 2.15 | `adressage[]` (structured) | Two patterns: `/(?:UI\|UE\|BC\|SC)\s*(\d{1,2})\s*:?\s*([A-Z0-9\-]+)\s*[-–]\s*(?:série\|serial\|s\/n)\s*:?\s*([A-Z0-9]+)\s*[-–]\s*(?:adr(?:esse)?\|@)\s*:?\s*(\d{1,3})\s*(?:[-–]\s*(.+?))?(?:\n\|$)/gi` and a `/`-pipe variant. Plus a generic line-split heuristic (line with ≥3 `/`/`\|` parts and ≥1 part matching `/[A-Z]{2,}[\-]?\d/`). | first-write-wins (`if (!partialData.adressage \|\| length === 0)`) | array | **Bug:** the line-split heuristic over-extracts on any chat that contains slashes. Capture indices are also off — `units.push({ ref_usine: match[1] \|\| match[2] \|\| '' … })` mixes the *capture group of the first pattern* with that of the second, producing wrong field assignments. |
| 2.16 | `adressage[]` (malformed-fix) | Detection: `equipId.length > 50 \|\| /adressage\|SW1\|Soft:\|Code \d{3}\|verif electrique/i.test(equipId)`. Extraction: `/UI(\d{1,2})\s+([A-Z]{2,4}Y?-[A-Z0-9\-]+)\s+(?:serie\|série\|n°\|s\/n)?\s*([A-Z0-9]+)\s*[-–]?\s*(.+?)(?=UI\d\|$)/gi` and a simpler positional fallback. | replaces malformed | array | — |
| 2.17 | `fluide.type` | `/(r410a\|r32\|r134a\|r407c\|r290\|r744)/i` | first-write-wins | primitive | — |
| 2.18 | `fluide.charge_totale` | `/charge\s+totale\s*(?:de\s+\|:\s*\|(?:c'?est\|cest)\s+)?(\d+[\.,]?\d*)\s*kg/gi` (loop, keep last) | **last-write-wins** (last regex match in transcript) | primitive | **R5_PATCH_B-4** applied (L12979–L12985) |
| 2.19 | `fluide.charge_initiale` | `/charge\s+(?:usine\|initiale)\s*(?:de\s+\|:\s*)?(\d+[\.,]?\d*)\s*kg/i` | first-write-wins (`if (!partialData.fluide.charge_initiale)`) | primitive | R5_PATCH_B-4 |
| 2.20 | `technicien.heure_arrivee`+`heure_depart` (range) | `/(?:intervention\|arriv[ée]e?\|de)\s+(?:[àa]\s+)?(\d{1,2})\s*[h:]\s*(\d{0,2})\s*(?:[àa]\|-)\s*(\d{1,2})\s*[h:]\s*(\d{0,2})/i` | overwrite both | primitive | R5_PATCH_B-4. **Bug:** `(?:de)` is too generic — false positives on "de 18 à 20 collègues". |
| 2.21 | `technicien.heure_depart` (lone) | `/(?:fini\|termin[ée]\|parti\|d[ée]part)\s+(?:[àa]\s+)?(\d{1,2})\s*[h:]\s*(\d{0,2})/i` | overwrite | primitive | R5_PATCH_B-4 |
| 2.22 | `resultat.description` + `resultat.status` | `/r[ée]sultat\s*:\s*(.+?)(?:\.\s\|$)/im` then status sub-classification: `/r[ée]solu\|corrig[ée]/i.test(rt) && !/non\|persiste/i.test(rt)` → `'resolu'` ; `/persiste\|partiel\|attente\|reprise/i.test(rt)` → `'en_attente_pieces'` ; `/non.*r[ée]solu\|impossible/i.test(rt)` → `'non_resolu'` | first-match-wins (`/im` flag, only first occurrence) | primitive | **R4_FIX5_RESULTAT** addressed downstream (in `normalizeReportData`), see Q4. The status "en_attente_pieces" diverges from drawer enum (drawer also accepts "partiellement", "en_cours", "intervention_requise"). |

After regex pass, `partialData` is merged into `lastReportData` via `unifiedMerge` only when `lastReportData` already has more than 4 keys (`L13017`); otherwise it replaces wholesale.

### Known bugs / cross-references

| Patch ref | Status in current code | Where |
|---|---|---|
| `R5_PATCH_A` (mergeReportData last-write-wins + dedup) | **APPLIED** | L13473–L13496 |
| `R5_PATCH_B-1` (deep copy partialData) | **APPLIED** | L12703–L12704 |
| `R5_PATCH_B-2` (correction-priority type_intervention) | **APPLIED** | L12748–L12768 |
| `R5_PATCH_B-3` (incremental codes_defaut) | **APPLIED** | L12804–L12840 |
| `R5_PATCH_B-4` (charge / heures / resultat extraction) | **APPLIED** | L12979–L13014 |
| `R5_PATCH_C-1` (underscore→space + ç in `normalizeMesureLabel`) | **APPLIED** | L13050–L13052 |
| `R5_PATCH_C-2` (alias map additions) | **APPLIED** | L13034–L13044 |
| `R5_PATCH_C-3` (reserves dedup with article-strip) | **APPLIED** | L13400–L13410 |
| `R4_FIX5_RESULTAT` (status sync + conclusion fallback) | **APPLIED** | L13247–L13297, plus drawer cleanup at L12540–L12547 and `collectReportData` cleanup at L10968–L10975 |
| `FIX_ROUND_3` BUG 1 (REPLACE only if non-empty) | **APPLIED** | L13337 (`sourceVal.length > 0 && sourceVal.some(item => item != null)`) |
| `FIX_ROUND_3` BUG 2 (double "Statut :" prefix) | **APPLIED** | L12540–L12547 + L10968–L10975 |
| `FIX_ROUND_3` BUG 3 (fluide ↔ fluide_global sync) | **APPLIED** | L13080–L13129 |
| `FIX_ROUND_3` BUG 4 (type_intervention bidirectional) | **PARTIAL** — replaced with "longest wins" at L13177–L13203, not the prescribed bidirectional sync. Risk: a verbose extraction string ("Maintenance préventive trimestrielle générale du système VRF") will outweigh a corrected user value ("Maintenance"). |
| `FIX_ROUND_3` BUG 5 (codes 6607 backend) | front-end side OK — `codes_defaut` is **not** in REPLACE_ARRAYS, dedup by uppercase code is in place (L13386–L13391). |
| `FIX_ROUND_3` BUG 6 (HH:MM placeholder cleanup) | **APPLIED** | L13303–L13310 |
| **Open bug #A** | hard-coded year filter `/^(2024\|2025\|0[1-9]\|1[0-2])$/` will let 2026/2027 codes through as false positives. | L12826 |
| **Open bug #B** | `adressage` capture-group reuse (`match[1] \|\| match[2]` etc.) misaligns fields when patterns are tried in sequence. | L12889–L12896 |
| **Open bug #C** | `mesures.equipement_id` is referenced for dedup (L13382) but no pattern in `buildPartialReport` populates `mesures` — they only arrive via JSON. The HTML therefore has **zero text-fallback for measurements**. | L12667+ |
| **Open bug #D** | `resultat.status='en_attente_pieces'` does not match the drawer's mapping table (drawer expects `'partiellement'` for partially resolved). | L13011 vs L14541 |

---

## Q3. Merge semantics

### `unifiedMerge(target, source)` — `L13322`–`L13353`

| Aspect | Behaviour |
|---|---|
| Copy depth | **Shallow** — `const result = { ...target }`. Nested objects keep their identity until they enter the recursive branch. `buildPartialReport` deep-copies `lastReportData` upstream to compensate. |
| Primitives | **Last-write-wins.** `if (sourceVal !== '' && sourceVal !== null && sourceVal !== undefined) result[key] = sourceVal;` (L13347–L13348). Empty strings, `null`, `undefined` are skipped. |
| Empty source | Whole `sourceVal` skipped if `sourceVal == null` (L13332). For arrays, also skipped if `sourceVal.length === 0` (L13336). |
| Special key | `_metadata` is always skipped (L13333). |
| Nested objects | Recursive `unifiedMerge` (L13346) **only when both sides are objects.** A primitive target replaced by an object source is overwritten via the primitive branch — but a primitive with a non-object source falls through to the last-write-wins branch. |
| `REPLACE_ARRAYS` | `new Set(['travaux_effectues', 'travaux_prevoir', 'recommandations'])` (L13320). When the source array is non-empty AND has at least one non-null item, full replacement: `result[key] = [...sourceVal]` (L13337–L13339). |
| Other arrays | If existing target array is empty/missing → copy source. Otherwise → `deduplicateArray(key, target, source)` (L13340–L13344). |

### `mergeReportData(target, source)` — `L13473`–`L13496` (post R5_PATCH_A)

| Aspect | Behaviour |
|---|---|
| Mutation | **In-place** mutation of `target` (no return value, callers chain). |
| Primitives | **Last-write-wins** (L13493). Skips `null`/`undefined`/`''`. |
| Arrays | `REPLACE_ARRAYS` → full replacement when non-empty. Otherwise `deduplicateArray`. |
| Nested objects | Recursive call **only if** target is an existing non-array object. |

### `deduplicateArray(fieldName, existing, incoming)` — `L13355`–`L13428`

`combined = [...existing, ...incoming]`, then a `Map` keyed by `keyFn(item)` keeps the **last** occurrence per key (so last-write-wins also applies to whole array entries).

| Field | Dedup key | Notes |
|---|---|---|
| `equipements` | `${(modele).toUpperCase().replace(/-[A-Z]\d*$/, '')}\|${role || ''}` | Strips trailing variant suffix (e.g. `RXYQ-P` collapses to `RXYQ`). |
| `adressage` | normalized `equipement_id \|\| ref_usine \|\| adresse` (uppercase, `UI01`→`UI1`); falls back to `modele.toUpperCase()` | Per FIX-A. |
| `mesures` | `${normalizeMesureLabel(label\|type)}\|${equipement_id (uppercase + UI01→UI1)}` | Uses cached `_normalizedLabel`/`_normalizedType` if present. |
| `codes_defaut` | `code.toUpperCase()` | |
| `travaux_effectues`, `travaux_prevoir` | `(texte \|\| contenu \|\| titre).substring(0, 50).toLowerCase()` | These are also in `REPLACE_ARRAYS`, so dedup only fires when target had data and source array is empty (i.e., never in practice). |
| `reserves` | accent-stripped + French-article-stripped + non-alphanumeric-stripped, first 60 chars | R5_PATCH_C-3. |
| `recommandations` | `(titre \|\| texte \|\| description).substring(0, 50).toLowerCase()` | Also in `REPLACE_ARRAYS` (replaces wholesale when extraction is non-empty). |
| `default` | `JSON.stringify(item)` | strict equality only. |

### Strategy summary

| Strategy | Fields |
|---|---|
| Replace-wholesale (when source non-empty + has at least one non-null item) | `travaux_effectues`, `travaux_prevoir`, `recommandations` |
| Dedup-merge | `equipements`, `adressage`, `mesures`, `codes_defaut`, `reserves`, `photos` (default JSON.stringify) |
| Last-write-wins primitive overwrite | every scalar field, every nested object scalar |
| Skip on empty/null | every type |

---

## Q4. Normalization

### `normalizeMesureLabel(label)` — `L13047`–`L13054`

```js
const lower = label.toLowerCase().trim()
    .replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/[ùû]/g, 'u')
    .replace(/[ôö]/g, 'o').replace(/[ïî]/g, 'i').replace(/[ç]/g, 'c')
    .replace(/[_]/g, ' ')        // R5_PATCH_C-1
    .replace(/\s+/g, ' ');
return MESURE_ALIAS_MAP[lower] || lower;
```

### `MESURE_ALIAS_MAP` — `L13030`–`L13045`

| Alias (input → canonical) | Canonical key |
|---|---|
| `température`, `temperature`, `temp`, `temp.` | `temperature` |
| `pression hp`, `hp`, `haute pression`, `high pressure`, `pression haute` | `pression_hp` |
| `pression bp`, `bp`, `basse pression`, `low pressure`, `pression basse` | `pression_bp` |
| `surchauffe`, `sh`, `superheat`, `surchauffe compresseur` | `surchauffe` |
| `sous-refroidissement`, `sous refroidissement`, `sr`, `subcooling` | `sous_refroidissement` |
| `intensité`, `intensite`, `ampérage`, `amperage`, `courant` | `intensite` |
| `tension`, `voltage` | `tension` |
| `delta t`, `δt`, `deltat`, `ecart`, `écart` | `delta_t` |
| `débit`, `debit`, `flow` | `debit` |
| `hygrométrie`, `hygrometrie`, `humidité`, `humidite`, `humidity` | `hygrometrie` |
| `température soufflage`, `temp soufflage`, `temperature soufflage`, `soufflage` | `temp_soufflage` |
| `température reprise`, `temp reprise`, `temperature reprise`, `reprise` | `temp_reprise` |
| `température extérieure`, `temp ext`, `temp extérieure`, `temp. ext.`, `temperature exterieure` | `temp_ext` |
| `température ambiante`, `temp ambiante`, `temperature ambiante`, `ambiance` | `temp_ambiante` |
| `frequence compresseur`, `frequency compresseur`, `freq compresseur` | `frequence_compresseur` |

> Note: the accented map keys (`'température'`, `'pression haute'`, etc.) are **dead** under the current normalizer because input is de-accented before the lookup. Only the unaccented variants in the map actually fire. R5_PATCH_C-2 papered over the most-used four labels but the rest of the accented map keys remain unreachable.

### `normalizeReportData(data)` — `L13059`–`L13313`

The 10 sections, in order:

1. **FLUIDE 3-way sync** (L13062–L13129).
   - Containers ensured: `data.fluide`, `data.fluide_global`.
   - Root → `fluide` (fill-gaps): `charge_totale`, `charge_usine` → `charge_initiale`, `charge_appoint`.
   - `fluide` → `fluide_global` (chat wins, R3-Fix3): `type`, `charge_totale_site_kg = parseKg(charge_totale)`, `charge_usine_kg = parseKg(charge_initiale)`, `charge_appoint_kg = parseKg(charge_appoint)`.
   - `fluide_global` → `fluide` (fill-gaps only): same fields reverse direction, only when `fluide` field is missing.
   - `cleanKg(v) = String(v).replace(/\s*kg\s*kg/gi, ' kg').replace(/\s*kg$/i, '').trim()` strips the duplicated "kg kg" defect introduced by repeated normalizations.
   - Final back-sync to root for backward compat.
   - Validation: `isValidFluide(v) = v != null && v !== '' && v !== 'non_precise' && v !== 'Non précisé' && v !== 'non précisé'`.

2. **SYSTEME ↔ EQUIPEMENTS bidirectional** (L13131–L13152).
   - If `equipements` exists and `systeme.modele` empty → pick the `role==='ue'` entry (or first), copy `modele`, `type_ui||role`, `numero_serie` into `systeme`.
   - Reverse: if only `systeme` is present, fabricate one synthetic `equipements[0]` with `role:'ue'`.

3. **TRAVAUX_EFFECTUES `contenu` ↔ `texte`** (L13154–L13160). Bidirectional fill-gaps.

4. **RESERVES `description` ↔ `texte`** (L13162–L13175). Bidirectional fill-gaps; bare strings auto-wrapped: `{ titre: r.substring(0, 60), texte: r, description: r, type: 'reserve' }`.

5. **TYPE_INTERVENTION "longest wins"** (L13177–L13203). Candidates collected from `data.type_intervention`, `intervention.type_label`, `intervention.type_detail`, `intervention.type`, `data.type_operation`, `data.nature_intervention`. The longest non-empty value wins and is propagated back to all six fields. *This is the only "longest wins" rule in normalize.*

6. **MESURES `type` ↔ `label`** (L13205–L13214). Fill-gaps both directions; cache `_normalizedLabel`/`_normalizedType` for downstream dedup.

7. **ADRESSAGE field aliases** (L13216–L13233). Bidirectional fill-gaps:
   - `equipement_id` ↔ `ref_usine` ↔ `adresse` (the latter is filled from either of the first two when missing).
   - `numero_serie` ↔ `serie`.
   - `zone` ↔ `designation`.
   - `model` ↔ `modele`.

8. **RECOMMANDATIONS string→object** (L13235–L13245). Bare strings wrapped as `{ titre, description, texte }`; bidirectional `description` ↔ `texte`.

9. **RESULTAT sync** (L13247–L13301).
   - `data.conclusion` (string) → `resultat.conclusion` and `resultat.description` (only if missing).
   - `data.status_intervention` → `resultat.status`, mapped through:
     ```js
     'résolu'/'resolu'/'resolved' → 'resolu'
     'non résolu'/'non_resolu'/'unresolved' → 'non_resolu'
     'en cours'/'en_cours'/'in_progress' → 'en_cours'
     'en attente'/'en_attente_pieces' → 'en_attente_pieces'
     ```
   - `data.resultat_intervention` → `resultat.description` and `resultat.conclusion` (only if missing).
   - Bidirectional `description` ↔ `conclusion` fill-gaps.
   - Strip `^Conclusion: / ^Statut: / ^Description:` prefixes (greedy `+`) on `description`, `conclusion`, `status`.
   - Back-sync `data.conclusion = resultat.conclusion`, `data.status_intervention = resultat.status`.

10. **TECHNICIEN placeholder cleanup** (L13303–L13310). `delete data.technicien.heure_arrivee` (and `heure_depart`) when value is `'HH:MM'`, `'hh:mm'`, or `''`.

### Bidirectional sync summary

| Pair | Direction | Priority |
|---|---|---|
| `fluide` ↔ `fluide_global` | both | `fluide` is source of truth (chat wins) |
| `fluide` ↔ root (`charge_totale`, `charge_usine`, `charge_appoint`) | both | `fluide` wins; root is a back-compat mirror |
| `systeme` ↔ `equipements` | both | fill-gaps only |
| `travaux_effectues.contenu` ↔ `.texte` | both | fill-gaps |
| `reserves.description` ↔ `.texte` | both | fill-gaps |
| `type_intervention` ↔ `intervention.type` ↔ `.type_label` ↔ `.type_detail` ↔ `type_operation` ↔ `nature_intervention` | all | **longest wins** |
| `mesures.type` ↔ `.label` | both | fill-gaps |
| `adressage.equipement_id` ↔ `.ref_usine` ↔ `.adresse` | three-way fill-gaps | first-write-wins |
| `adressage.numero_serie` ↔ `.serie` | both | fill-gaps |
| `adressage.zone` ↔ `.designation` | both | fill-gaps |
| `adressage.model` ↔ `.modele` | both | fill-gaps |
| `recommandations.description` ↔ `.texte` | both | fill-gaps |
| `resultat.description` ↔ `.conclusion` | both | fill-gaps |
| `data.conclusion` → `resultat.conclusion`/`.description` | one-way | fill-gaps |
| `data.status_intervention` → `resultat.status` | one-way | mapped |
| `data.resultat_intervention` → `resultat.description`/`.conclusion` | one-way | fill-gaps |
| Back-sync `resultat.conclusion` → `data.conclusion`, `resultat.status` → `data.status_intervention` | one-way | last-step copy |

---

## Q5. Word export field mapping (`generateWord`, `L10987`–`L11980`)

The Word document is rendered by docx.js and is composed of 26 sections. The full per-section breakdown (with line numbers) is documented in `technician/AUDIT_WORD_TEMPLATE.md` and reproduced below in compressed form.

| § | Section | Source keys | Conditional |
|---|---|---|---|
| 1 | Cover page (L11185–L11295) | `type_intervention`, `marque\|equipement.marque\|brand`, `client.nom\|nom_client\|client.societe`, `client.adresse\|adresse\|site.adresse,site.ville`, `reference\|numero_rapport`, `date`, `technicien.nom\|nom_technicien\|technician_name`, `technicien.entreprise\|entreprise\|company_name\|currentUser.company_name`, `technicien.adresse\|adresse`, `currentUser.company_logo`, `site.numero_affaire` | always |
| 2 | Résumé | `resume` | `resume` truthy |
| 3 | Site & Client | `site.numero_affaire`, `site.adresse`, `site.ville`, `client.societe`, `client.contact`, `client.telephone`, `client.reference` | always |
| 4 | Dates intervention | `dates.debut_date`, `dates.fin_date`, `dates.debut_heure`, `dates.fin_heure` | `dates && (debut_date \|\| fin_date)` |
| 5 | Équipement | `systeme.{type, modele, serie, puissance, garantie}`, `fluide.{type, charge_initiale, charge_totale, type_huile}` | either populated |
| 6 | Adressage Unités | `adressage[].{adresse\|equipement_id\|ref_usine, modele\|model, zone\|designation, numero_serie\|serie}` | length>0 + filter (≤20 chars, no garbage keywords) |
| 7 | Codes Défaut | `codes_defaut[].{code, description, resolution}` | non-empty after stripping `'A2'` codes |
| 8 | Sécurité | `securite.etat`, `securite.risques` | `etat` or `risques` truthy |
| 9 | Mesures | `mesures[].{label, valeur, unite, note}` | length>0 |
| 10 | Fonctionnement | `fonctionnement.{heures_compresseur, nb_demarrages}` | either populated |
| 11 | Travaux Effectués | `travaux_effectues[].{titre, texte, status}` | non-empty |
| 12 | Travaux à Prévoir | `travaux_prevoir[].{texte, priorite}` | non-empty |
| 13 | Pièces | `pieces[].{reference, designation, quantite}` | length>0 |
| 14 | Rapport Technicien | `rapport_technicien` | truthy |
| 15 | Remarques | `remarques` | truthy |
| 16 | Tests MES | `tests.{pression_test_bar, duree_test_heures, valeur_vacuometre_mbar}` | any populated |
| 17 | Tuyauteries | `tuyauteries.{longueur_totale_m, denivele_oc_ui_m, appoint_calcule_kg}` | any populated |
| 18 | Électrique | `electrique.{calibre_disjoncteur, section_cable}` | any populated |
| 19 | Relevés UE | `releves_ue.{pd1_bar, ps_bar, ta_celsius, freq_inv1_hz}` | any populated |
| 20 | Relevés UI | `releves_ui[].{nom, temp_soufflage, temp_reprise, delta}` | length>0 |
| 21 | CERFA | `cerfa.{fluide_total_charge_kg, fluide_total_recupere_kg, attestation_capacite}` | any populated |
| 22 | Résultat (+ réserves + prochaine_visite + recommandations) | `resultat.{status, label, description, conclusion}`; `reserves[].{type, titre, texte}`; `prochaine_visite`; `recommandations[].{texte\|description\|titre}` | resultat presence |
| 23 | Technicien | `technicien.{nom, entreprise, heure_arrivee, heure_depart, autres}` | `nom` or `entreprise` truthy |
| 24 | Observation Client | `observation_client` | not "Observations du client..." |
| 25 | Photos | `photos[].{data, caption}` (must start with `data:image`) | non-empty after filter |
| 26 | Signatures | `signatures.{client (str\|{image,nom}), technicien (str\|{image,nom}), nom_client, nom_technicien}` | any populated |

### Fallback chains (verbatim)

```js
data.type_intervention                                                                       || 'RAPPORT'                              // L11035
data.marque || data.equipement?.marque || data.brand                                          || ''                                     // L11036
data.client?.nom || data.nom_client || data.client?.societe                                   || ''                                     // L11037
data.client?.adresse || data.adresse || [data.site?.adresse, data.site?.ville].filter(Boolean).join(', ') || ''                          // L11038
data.reference || data.numero_rapport                                                         || ''                                     // L11039
data.date                                                                                     || new Date().toLocaleDateString('fr-FR') // L11040
data.technicien?.nom || data.nom_technicien || data.technician_name                           || ''                                     // L11041
data.technicien?.entreprise || data.entreprise || data.company_name || currentUser?.company_name || ''                                   // L11043
data.resultat.description || data.resultat.conclusion                                                                                    // L11655
data.signatures.nom_client || data.signatures.client?.nom || data.client?.contact             || '________________'                     // L11861-L11864
data.signatures.nom_technicien || data.signatures.technicien?.nom || data.technicien?.nom    || '________________'                     // L11904-L11907
```

**Distinct field-paths read by `generateWord`: 131. Conditional sections: 21. Arrays iterated: 9. Fallback chains: 8.**

---

## Q6. Drawer rendering field mapping

### `updateDrawerPreview(data)` — `L12504`–`L12569`

Reads:
- `reportData.resultat.{status, label, description, conclusion}` — strips duplicate `^(Statut\|Status\|Conclusion\|Description)\s*:\s*` prefixes (FIX_ROUND_3 BUG 2). Lines L12540–L12547.
- `reportData.status` — drawer footer (L12565).
- `completionStatus.percentage` — progress bar (L12529–L12537, L12565–L12566).

Then delegates to `renderReportPreviewV12(reportData, completionStatus)` at L12550.

### `renderReportPreviewV12(data, completionStatus)` — `L14344`–`L14623`

Helper `createBlockHTML(type, content, fieldId, dataAttrs)` at L14353–L14358 — pure HTML formatter, no data reads.

| # | Editable block | Source keys | Conditional |
|---|---|---|---|
| 1 | Title | `intervention.type_label \|\| intervention.type` (mapped through `typeLabels` lookup) | always |
| 2 | Résumé | `resume` | `resume` truthy |
| 3 | Client | `client.{societe, contact, telephone}` | `client && (societe \|\| contact)` |
| 4 | Site | `site.{adresse, ville, numero_affaire}` | `site && (adresse \|\| ville)` |
| 5 | Intervenant | `technicien.{entreprise, nom}` | `technicien && (entreprise \|\| nom)` |
| 6 | Équipements | `equipements[].{modele, marque, type_ui, role}` | length>0 |
| 7 | Adressage | `adressage[].{adresse\|equipement_id\|ref_usine, modele\|model, zone\|designation, numero_serie\|serie}` | length>0 |
| 8 | Fluide Frigorigène | `fluide_global.{type, charge_usine_kg, charge_totale_site_kg}` | `type \|\| charge_totale_site_kg` |
| 9 | Mesures | `mesures[].{label\|type, valeur\|valeur_texte, unite, status}` (status=`'conforme'` flagged) | length>0 |
| 10 | Travaux Effectués | `travaux_effectues[].{contenu\|texte\|titre}` | length>0 |
| 11 | Réserves | `reserves[].{titre\|description}` | length>0 |
| 12 | Recommandations | `recommandations[].{titre\|description\|texte}` | length>0 |
| 13 | Résultat | `resultat.status` (mapped) `\|\| resultat.label \|\| 'À définir'` ; `resultat.description \|\| resultat.conclusion` | always |
| 14 | Photos | `window.reportPhotos[].{url\|data\|originalData, caption\|name}` | always (renders empty grid) |
| 15 | Technicien | `technicien.{nom, entreprise, heure_arrivee, heure_depart, autres}` | always |
| 16 | Observation Client | `observation_client` | always |
| 17 | Signatures | `client.contact\|client.societe`; `technicien.nom`; `signatures.client.image\|signatures.client\|signature_client`; `signatures.technicien.image\|signatures.technicien\|signature_technicien` | always |

### Fallback chains (verbatim)

```js
entry.adresse || entry.equipement_id || entry.ref_usine || ''                              // L14438
entry.modele || entry.model || ''                                                          // L14439
entry.zone || entry.designation || ''                                                      // L14440
entry.numero_serie || entry.serie || ''                                                    // L14441
m.label || m.type || ''                                                                    // L14485
m.valeur || m.valeur_texte || ''                                                           // L14486
t.contenu || t.texte || t.titre || ''                                                      // L14507
r.titre || r.description || ''                                                             // L14516
r.titre || r.description || r.texte || ''                                                  // L14525
statusLabels[data.resultat?.status] || data.resultat?.label || 'À définir'                 // L14541
data.resultat?.description || data.resultat?.conclusion || ''                              // L14545
p.url || p.data || p.originalData || ''                                                    // L14559
p.caption || p.name || 'Photo ' + (i+1)                                                    // L14560
data.client?.contact || data.client?.societe || ''                                         // L14593
data.technicien?.nom || ''                                                                 // L14594
data.signatures?.client?.image || data.signatures?.client || data.signature_client || ''   // L14595
data.signatures?.technicien?.image || data.signatures?.technicien || data.signature_technicien || ''  // L14596
```

### Drawer-vs-Word divergences

| Block | Drawer reads | Word reads | Risk |
|---|---|---|---|
| Fluide | `fluide_global.{type, charge_usine_kg, charge_totale_site_kg}` | `fluide.{type, charge_initiale, charge_totale, type_huile}` | Drawer never shows `type_huile`. Word never shows `charge_appoint_kg`. |
| Résultat | `statusLabels[resultat.status]` mapping | raw `resultat.status` + color mapping | "en_attente_pieces" status from `buildPartialReport` (L13011) doesn't appear in either's enum. |
| Equipements | block 6 (model/brand/type_ui/role) | only `systeme.*` (block 5) | Word never reuses the `equipements` array detail. |
| `observation_client` | always renders block | section skipped if value === "Observations du client..." | Drawer placeholder leaks into Word. |

---

**Total distinct top-level keys observed in current FixAIR data state: 51 (≈38 unique-shape after collapsing aliases).**
