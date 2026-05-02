# AUDIT_GAP_VS_HVAC_STANDARD

Comparison of every field listed in the **industry-standard HVAC skeleton** (extracted from 11 Mitsubishi/EQWATTEUR/ThermoClim reports + the regulatory CERFA 15497*04) against the current FixAIR `technician/index.html` data state.

Legend:

| Symbol | Meaning |
|---|---|
| ✅ | Already extracted (`buildPartialReport` regex or N8N JSON path verified) |
| 🟡 | Field exists in `lastReportData` schema but only via N8N JSON — **no front-end fallback** |
| ❌ | Not extracted at all |
| 📄 | Rendered in Word (via `generateWord`) |
| 📋 | Rendered in drawer (via `renderReportPreviewV12`) |
| ⛔ | Not rendered anywhere |

> "Source HVAC template" lists which of the 11 reference reports the field is universal to (UNIV = every report; MES = Mise en service annex; ROOFTOP = roof-top/CTA annex; VC = visite constructeur annex; GTC = GTC MES annex; CERFA = regulatory CERFA n° 15497*04).

---

## A. Universal HVAC skeleton

| Industry-standard field | Source HVAC template | Currently extracted? | Currently rendered? | Action for Cube |
|---|---|---|---|---|
| **Header — N° intervention** | UNIV | 🟡 via `reference` / `numero_rapport` | 📄 cover §1 (L11039) | Keep both aliases; tighten to single `intervention_number`. |
| **Header — Type intervention** | UNIV | ✅ regex (L12748–L12768) + 6-way "longest wins" sync | 📄 cover §1, 📋 title block | Add Cerfa-aligned enum: `assemblage`, `mise_en_service`, `modification`, `maintenance`, `controle_etancheite_periodique`, `controle_etancheite_non_periodique`, `demantelement`, `autre`. |
| **Header — Marque** | UNIV | ✅ `brand` / `brand_key` set on project init; `marque`/`equipement.marque` accepted as N8N aliases | 📄 cover §1 | Single canonical `equipment_brand`. |
| **Header — Lieu** | UNIV | 🟡 via `site.adresse` + `site.ville` | 📄 cover + §3 | Promote to top-level `site.location_label`. |
| **Header — Date début** | UNIV | 🟡 via `dates.debut_date` + `dates.debut_heure` | 📄 §4 | Single ISO `intervention.start_at`. |
| **Header — Date fin** | UNIV | 🟡 via `dates.fin_date` + `dates.fin_heure` | 📄 §4 | Single ISO `intervention.end_at`. |
| **Header — Dossier suivi par** | UNIV | ❌ | ⛔ | New field `intervention.case_owner`. |
| **Site — Numéro affaire** | UNIV | 🟡 `site.numero_affaire` | 📄 §3 | Keep; rename `site.business_reference` for clarity. |
| **Site — Lieu d'intervention** | UNIV | 🟡 `site.adresse` + `site.ville` | 📄 §3, 📋 site block | Keep. |
| **Client — Référence client** | UNIV | 🟡 `client.reference` | 📄 §3 | Keep. |
| **Client — Adresse** | UNIV | 🟡 `client.adresse` | 📄 cover fallback chain | Keep. |
| **Client — Contact** | UNIV | 🟡 `client.contact` | 📄 §3, 📋 client block | Keep. |
| **Client — Téléphone** | UNIV | 🟡 `client.telephone` | 📄 §3, 📋 client block | Keep. |
| **Client — Email** | UNIV | 🟡 `client.email` (declared in schema, not rendered) | ⛔ | Add to drawer + Word. |
| **Client — Société** | UNIV | 🟡 `client.societe` | 📄 §3, 📋 client block | Keep. |
| **Dates — Date+heure début** | UNIV | 🟡 `dates.debut_date` + `dates.debut_heure` | 📄 §4 | Combine into ISO. |
| **Dates — Date+heure fin** | UNIV | 🟡 `dates.fin_date` + `dates.fin_heure` | 📄 §4 | Combine into ISO. |
| **Résultat — status** | UNIV | ✅ regex + normalize + drawer cleanup | 📄 §22, 📋 result block | Reconcile enum mismatch — `buildPartialReport` writes `'en_attente_pieces'`, drawer table maps `'partiellement'`/`'en_cours'`/`'intervention_requise'`. |
| **Résultat — label** | UNIV | 🟡 `resultat.label` | 📄 §22 | Keep, but ensure status→label deterministic mapping. |
| **Résultat — description** | UNIV | ✅ regex (L13005) | 📄 §22, 📋 result block | Keep. |
| **Résultat — conclusion** | UNIV | 🟡 `resultat.conclusion` (also synced from root `data.conclusion`) | 📄 §22 fallback (L11655) | Keep. |
| **Réserves — free text** | UNIV | 🟡 strings auto-wrapped (L13170) | 📄 §22 sub-block, 📋 réserves block | Keep. |
| **Réserves — structured (type, sévérité)** | UNIV | 🟡 `reserves[].type` (only); `severite` ❌ | 📄 §22 (type only) | Add `reserves[].severite` enum (`mineure`/`majeure`/`bloquante`). |
| **Sécurité — risques identifiés** | UNIV | 🟡 `securite.risques` | 📄 §8 | Keep. |
| **Sécurité — état** | UNIV | 🟡 `securite.etat` | 📄 §8 | Keep — already 3-color mapped. |
| **Adressage — référence usine** | UNIV | 🟡 `adressage[].ref_usine` | 📄 §6, 📋 adressage block | Keep. |
| **Adressage — numéro série** | UNIV | 🟡 `adressage[].numero_serie/serie` | 📄 §6, 📋 adressage block | Keep. |
| **Adressage — adressage** | UNIV | 🟡 `adressage[].adresse` | 📄 §6, 📋 adressage block | Keep. |
| **Adressage — désignation** | UNIV | 🟡 `adressage[].designation/zone` | 📄 §6, 📋 adressage block | Keep. |
| **Adressage — commentaire** | UNIV | 🟡 `adressage[].commentaire` (read in `buildPartialReport` L12894 but not rendered) | ⛔ | Add to Word + drawer. |
| **Adressage — espace de service** | UNIV | ❌ | ⛔ | New field `adressage[].espace_service`. |
| **Fluide — type** | UNIV | ✅ regex (L12972) | 📄 §5, 📋 fluide block | Keep. |
| **Fluide — type huile** | UNIV | 🟡 `fluide.type_huile` | 📄 §5 only | Add to drawer. |
| **Fluide — C1 charge initiale** | UNIV | ✅ regex (L12988) | 📄 §5 | Keep. |
| **Fluide — C2 appoint 1** | UNIV | 🟡 `fluide.charge_appoint` (only one slot, not C2/C3) | ⛔ | Promote to array `fluide.appoints[]` with date+kg. |
| **Fluide — C3 appoint 2** | UNIV | ❌ | ⛔ | Same — covered by `appoints[]`. |
| **Fluide — C4 charge totale** | UNIV | ✅ regex (L12982) — last-write-wins | 📄 §5, 📋 fluide block | Keep. |
| **Heures fonctionnement — type d'organe** | UNIV | ❌ (only `fonctionnement.heures_compresseur` for compressor) | ⛔ | New `fonctionnement[].organe_type`. |
| **Heures fonctionnement — désignation** | UNIV | ❌ | ⛔ | New `fonctionnement[].designation`. |
| **Heures fonctionnement — nb heures** | UNIV | 🟡 `fonctionnement.heures_compresseur` (compressor only) | 📄 §10 | Generalise to array. |
| **Heures fonctionnement — nb démarrages** | UNIV | 🟡 `fonctionnement.nb_demarrages` | 📄 §10 | Same. |
| **Heures fonctionnement — démarrages/heure (seuils)** | UNIV | ❌ | ⛔ | New computed field. |
| **Rapport technicien (free narrative)** | UNIV | 🟡 `rapport_technicien` | 📄 §14 | Keep. |
| **Remarques** | UNIV | 🟡 `remarques` | 📄 §15 | Keep. |
| **Travaux à prévoir** | UNIV | 🟡 `travaux_prevoir[].{titre,texte,priorite}` | 📄 §12 | Keep. |
| **Travaux à prévoir — priorité** | UNIV | 🟡 `priorite` (`urgent`/`normal`/`optionnel`) | 📄 §12 | Keep. |
| **Photographies — titre** | UNIV | ❌ (only `caption`) | ⛔ | Add `photos[].title`. |
| **Photographies — image** | UNIV | 🟡 `photos[].data` | 📄 §25 | Keep. |
| **Photographies — caption** | UNIV | 🟡 `photos[].caption` | 📄 §25 | Keep. |
| **Détail heures — nom** | UNIV | 🟡 `technicien.nom` (single tech only) | 📄 §23 | Promote to array `techniciens[]`. |
| **Détail heures — date+heure arrivée** | UNIV | ✅ regex (L12993) | 📄 §23 | Same. |
| **Détail heures — date+heure départ** | UNIV | ✅ regex (L12993, L12999) | 📄 §23 | Same. |
| **Signatures — client** | UNIV | 🟡 `signatures.client` (string or `{image,nom}`) | 📄 §26 | Keep. |
| **Signatures — technicien** | UNIV | 🟡 `signatures.technicien` | 📄 §26 | Keep. |
| **Signatures — observation client** | UNIV | 🟡 `observation_client` | 📄 §24, 📋 obs block | Keep. |
| **Signatures — autres techniciens présents** | UNIV | ❌ (`technicien.autres` is free string, not list) | 📄 §23 partial | Promote to array. |
| **Signatures — nom STA** | UNIV | ❌ | ⛔ | Add `signatures.sta_name`. |

---

## B. Mise en service (MES) annex

| Industry-standard field | Source | Currently extracted? | Currently rendered? | Action for Cube |
|---|---|---|---|---|
| Validation préconisations Mitsubishi (12 pts C/NC) | MES | ❌ | ⛔ | New table `mes.preconisations[]` (12 rows × `{label, status:'C'\|'NC'\|'NA'}`). |
| Conduite frigo — longueur totale | MES | 🟡 `tuyauteries.longueur_totale_m` | 📄 §17 | Keep. |
| Conduite frigo — L. OC↔UI loin | MES | ❌ | ⛔ | New. |
| Conduite frigo — L. 1er Té↔UI loin | MES | ❌ | ⛔ | New. |
| Conduite frigo — L. entre OC | MES | ❌ | ⛔ | New. |
| Conduite frigo — dénivelé OC↔UI basse | MES | 🟡 `tuyauteries.denivele_oc_ui_m` | 📄 §17 | Keep. |
| Conduite frigo — dénivelé entre UI | MES | ❌ | ⛔ | New. |
| Conduite frigo — kit jumelage | MES | ❌ | ⛔ | New. |
| Conduite frigo — type Té | MES | ❌ | ⛔ | New. |
| Conduite frigo — anomalies | MES | ❌ | ⛔ | New. |
| Hydraulique — filtre eau / vanne équilibrage / flow switch / volume eau / mesure débit / purgeur / antigel | MES | ❌ | ⛔ | New `mes.hydraulique{}` (7 fields). |
| Réglages consignes — point consigne froid/chaud/hygrométrie | MES | ❌ | ⛔ | New. |
| Réglages — anti gel évaporateur, type régulation, bande proportionnelle | MES | ❌ | ⛔ | New. |
| Charge frigo condenseur déporté — C1/C2 init/appoint, huile, longueur+section gaz/liquide | MES | ❌ (single global `fluide.*`) | ⛔ | New `mes.charge_condenseur_deporte{}`. |
| Relevé — version logiciel, air ext, tension auxiliaires, fonct, arrêt | MES | ❌ | ⛔ | New `mes.releves_general{}`. |
| Relevé température air — entrée/sortie, deltaT, hygrométrie, % ventilo | MES | ❌ | ⛔ | New (overlap with `releves_ui[]` but distinct semantics). |
| Relevé frigo C1/C2 — T° refoulement comp, T° liquide, T° aspiration, BP, HP, surchauffe, sous-refroidissement | MES | 🟡 partial via `mesures[]` (free-form) + `releves_ue.{pd1_bar, ps_bar}` | 📄 §9 + §19 | Promote to structured `mes.releves_circuit[]`. |
| Intensités compresseurs L1/L2/L3 × C1...C6 | MES | ❌ | ⛔ | New `mes.intensites_compresseurs[]`. |
| Intensités ventilateurs armoire L1/L2/L3 × V1...V4 | MES | ❌ | ⛔ | New. |
| Intensités ventilateurs dry cooler/condenseur | MES | ❌ | ⛔ | New. |
| Intensités résistances électriques | MES | ❌ | ⛔ | New. |
| Humidificateur — intensités électrodes, test remplissage/vidange | MES | ❌ | ⛔ | New. |
| Spécifications commande — T° entrée/sortie, débit, puissance, supervision Modbus/Lonworks/Trend/Bacnet, glycol % | MES | ❌ | ⛔ | New `mes.specifications_commande{}`. |

---

## C. Roof-top / CTA annex

| Industry-standard field | Source | Currently extracted? | Currently rendered? | Action for Cube |
|---|---|---|---|---|
| Inspection visuelle CTA/ROOFTOP (16 pts) | ROOFTOP | ❌ | ⛔ | New `rooftop.inspection_visuelle[]` (16 rows). |
| Vérification batterie hydraulique récup (14 pts) | ROOFTOP | ❌ | ⛔ | New `rooftop.batterie_recup[]` (14 rows). |
| Pressostats sécurité — filtre air neuf, poche, reprise [PA] | ROOFTOP | ❌ | ⛔ | New. |
| Relevé ventilateurs reprises V1, V2 (intensités, %) | ROOFTOP | ❌ | ⛔ | New. |
| Relevé ventilateurs soufflages V3, V4 (intensités, %) | ROOFTOP | ❌ | ⛔ | New. |
| Delta P ventilateurs reprise/soufflage [PA] | ROOFTOP | ❌ | ⛔ | New. |
| Pression en gaine reprise/soufflage [PA] | ROOFTOP | ❌ | ⛔ | New. |
| Débit d'air reprise/soufflage [m³/h] | ROOFTOP | ❌ | ⛔ | New. |
| Mode fonctionnement air neuf % | ROOFTOP | ❌ | ⛔ | New. |
| Relevé température aéraulique (air neuf, repris, soufflage, hygrométrie) | ROOFTOP | 🟡 `mesures[]` may carry these via aliases (`temp_soufflage`, `temp_reprise`) | 📄 §9 | Promote to dedicated `rooftop.temperatures{}`. |
| Intensités roues récupération R1, dessicante R2 | ROOFTOP | ❌ | ⛔ | New. |
| Intensités résistances R1, R2 | ROOFTOP | ❌ | ⛔ | New. |
| Intensités pompes P1, P2 | ROOFTOP | ❌ | ⛔ | New. |

---

## D. Visite constructeur (VC) annex

| Industry-standard field | Source | Currently extracted? | Currently rendered? | Action for Cube |
|---|---|---|---|---|
| Inspection environnement UE (16 pts C/NC/N/A) | VC | ❌ | ⛔ | New checklist. |
| Inspection environnement CMB (14 pts) | VC | ❌ | ⛔ | New. |
| Inspection environnement UI (12 pts) | VC | ❌ | ⛔ | New. |
| Vérification et test (24 pts) | VC | ❌ | ⛔ | New. |
| Contrôles isolements par compresseur UE1/UE2/UE3 — ohm + mégaohm matrices | VC | ❌ | ⛔ | New `vc.isolements[]` matrix. |
| Tensions alimentation L1-L2/L2-L3/L3-L1/Terre-N/BUS/L1-N/L2-N/L3-N/TB3/TB7 | VC | ❌ | ⛔ | New. |
| Relevé fonctionnement UE/CMB par mode (refoulement, désurchauffe, sous-refroidissement, surchauffe, cible, fréq inverter, lev1, PS1, SCC, SC0) | VC | 🟡 partial via `mesures[]` | 📄 §9 | Promote to structured `vc.fonctionnement_ue_cmb[]`. |
| Relevé fonctionnement UI par mode (surchauffe moy, sous-refroidissement moy, T° entrée/sortie batterie) | VC | ❌ | ⛔ | New. |
| Circuit en défaut + code alarme + 3 derniers codes alarmes | VC | 🟡 `codes_defaut[]` flat list | 📄 §7 | Add per-circuit grouping + last-3-history. |

---

## E. GTC MES annex

| Industry-standard field | Source | Currently extracted? | Currently rendered? | Action for Cube |
|---|---|---|---|---|
| Information unités intérieures (50 lignes — N° adresse, N° groupe centralisé, N° étage, Nom groupe) | GTC | ❌ | ⛔ | New. |
| Commande centralisée (modèle, série, IP, passerelle, masque, version logiciel) | GTC | ❌ | ⛔ | New `gtc.commande_centralisee{}`. |
| Fonctions activées (asservissement, virtuelle, énergétique, état groupe, archivage, WebDesign, Bacnet, Maintenance Tool) | GTC | ❌ | ⛔ | New. |
| Extensions 1, 2, 3 (mêmes champs) | GTC | ❌ | ⛔ | New. |
| Informations GTC (BACNET, MODBUS, KNX, WEBDESIGN, LMAP, PAC YG-60 — série + IP/M-net + Associé à) | GTC | ❌ | ⛔ | New. |
| Réglages d'options (asservissements, messages électroniques, limitations T°, énergie, paramètres réseaux, contrôle T° ambiance) | GTC | ❌ | ⛔ | New. |

---

## F. CERFA n° 15497*04 (regulatory)

| Industry-standard field | Source | Currently extracted? | Currently rendered? | Action for Cube |
|---|---|---|---|---|
| Opérateur — nom | CERFA | ❌ | ⛔ | New `cerfa.operateur.nom`. |
| Opérateur — adresse | CERFA | ❌ | ⛔ | New. |
| Opérateur — SIRET | CERFA | ❌ | ⛔ | New. |
| Opérateur — N° attestation capacité (cat I/II/III/IV) | CERFA | 🟡 `cerfa.attestation_capacite` (string only) | 📄 §21 | Add structured cat enum. |
| Détenteur — nom / adresse / SIRET | CERFA | ❌ | ⛔ | New `cerfa.detenteur{}`. |
| Équipement — identification | CERFA | 🟡 via `systeme.serie`/`equipements[]` | 📄 §5 | Bind `cerfa.equipement_id` to `equipements[]`. |
| Équipement — dénomination fluide R-X | CERFA | ✅ via `fluide.type` | 📄 §5 | Keep. |
| Équipement — charge totale (kg) | CERFA | ✅ via `fluide.charge_totale` | 📄 §5 | Keep. |
| Équipement — tonnage équivalent CO₂ | CERFA | ❌ | ⛔ | Compute from PRG table — new field. |
| Nature intervention — 8 cases (assemblage/MES/modification/maintenance/contrôle étanchéité périodique/non périodique/démantèlement/autre) | CERFA | 🟡 partial via `type_intervention` enum | ⛔ | Restructure into `cerfa.nature_intervention` checkbox-set. |
| Détecteur manuel fuite — identification + date contrôle | CERFA | ❌ | ⛔ | New. |
| Détection permanente — OUI/NON | CERFA | ❌ | ⛔ | New. |
| Fréquence contrôle périodique (HCFC 2/30/300, HFC-PFC 5/50/500, HFO 1/10/100 — 12/6/3 mois sans détection, 24/12/6 avec) | CERFA | ❌ | ⛔ | New computed/lookup. |
| Fuites — localisation + état (Réalisée/À faire) × 3 max | CERFA | ❌ | ⛔ | New `cerfa.fuites[]` (max 3). |
| Manipulation fluide — A=vierge / B=recyclé / C=régénéré (chargée totale) | CERFA | 🟡 `cerfa.fluide_total_charge_kg` (single number) | 📄 §21 | Split into A/B/C breakdown. |
| Manipulation fluide — D=traitement / E=réutilisation (récupérée totale) | CERFA | 🟡 `cerfa.fluide_total_recupere_kg` (single number) | 📄 §21 | Split into D/E. |
| Dénomination fluide chargé si changement | CERFA | ❌ | ⛔ | New. |
| Numéro BSFF (Trackdéchets) | CERFA | ❌ | ⛔ | New. |
| Identification contenants | CERFA | ❌ | ⛔ | New `cerfa.contenants[]`. |
| Dénomination ADR/RID — UN 1078 / UN 3161 | CERFA | ❌ | ⛔ | New. |
| Installation prévue destination fluide récupéré (nom, SIRET, adresse) | CERFA | ❌ | ⛔ | New. |
| Observations | CERFA | 🟡 overlaps `remarques`/`observation_client` | 📄 §15/§24 | Distinct `cerfa.observations`. |
| Signatures Opérateur (nom, qualité, date, signature) | CERFA | 🟡 partial via `signatures.technicien` | 📄 §26 | Add `qualite` + `date`. |
| Signatures Détenteur (nom, qualité, date, signature) | CERFA | 🟡 partial via `signatures.client` | 📄 §26 | Add `qualite` + `date`. |

---

## Coverage summary

| Bucket | Industry standard fields | ✅ Extracted (regex) | 🟡 Schema-only (JSON path) | ❌ Missing | Coverage |
|---|---|---|---|---|---|
| Universal HVAC | 53 | 7 | 30 | 16 | 70% (schema), 13% (regex) |
| MES annex | 21 | 0 | 3 | 18 | 14% |
| Roof-top / CTA | 13 | 0 | 1 | 12 | 8% |
| Visite constructeur | 9 | 0 | 2 | 7 | 22% |
| GTC MES | 6 | 0 | 0 | 6 | 0% |
| CERFA 15497*04 | 23 | 0 | 5 | 18 | 22% |
| **Total** | **125** | **7** | **41** | **77** | **38% schema, 6% regex** |

> Counts collapse aliases (e.g. `marque`/`brand`/`equipement.marque` count as 1).

**Total fields in current FixAIR data state: 51 distinct top-level keys (~38 unique-shape).**
**Total fields in industry standard: 125.**
**Gap (industry minus FixAIR): 77 missing + ~41 partially-covered = 118 fields requiring work.**

---

## Top 5 highest-priority gaps to close in Cube

1. **CERFA breakdown (A/B/C charged + D/E recovered + BSFF + UN code)** — regulatory mandate; current `cerfa.fluide_total_charge_kg` is a single scalar where the form requires 6 separate slots plus waste-tracking ID. Without this, FixAIR reports cannot legally substitute for a CERFA.
2. **MES checklist tables (12-point Mitsubishi + 16-point CTA + 24-point VC)** — no extraction or rendering exists. Cube needs a generic `checklist[]` schema with per-row `{label, status:'C'\|'NC'\|'NA', commentaire}`.
3. **Per-circuit relevés (C1/C2 — refoulement, surchauffe, sous-refroidissement, BP, HP, intensités L1/L2/L3 per compressor + per ventilator)** — currently a free-form `mesures[]` with regex-only label aliasing. Cube needs structured `circuits[].measurements[]` with explicit per-circuit grouping.
4. **Multi-technician + multi-day intervention model** — `technicien` is a single object and dates are a flat `{debut_date, fin_date}`. Real interventions span multiple techs and multiple days; promote to `techniciens[]` and `intervention.timeline[]`.
5. **CERFA-aligned nature_intervention enum + tonnage CO₂ + leak-test frequency thresholds** — `type_intervention` is a free-text "longest wins" string and `tonnage_co2` is unimplemented; these are required to choose the correct leak-control frequency band (12/6/3 vs 24/12/6 months).

Honourable mentions (not in top 5 but cheap wins):
- Fix `buildPartialReport` open bugs A–D documented in `AUDIT_EXTRACTION_INVENTORY.md` Q2.
- Reconcile `resultat.status` enum mismatch between `buildPartialReport` ('en_attente_pieces') and drawer (`partiellement` etc.).
- Add `severite` to `reserves[]`.
