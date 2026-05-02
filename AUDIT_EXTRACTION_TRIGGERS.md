# AUDIT_EXTRACTION_TRIGGERS

For each industry-standard field, a proposed detection rule (regex or phrase), AI-vs-user origin, and conflict-resolution policy. Designed for Cube (QBE) — same chat-transcript fallback that `buildPartialReport()` performs today, plus the structured fields it does not yet cover.

Conventions:

- `RX(name)` shorthand denotes a regex from the current `buildPartialReport` (line numbers in `AUDIT_EXTRACTION_INVENTORY.md` Q2).
- **Origin** = `user` if the extractor scans technician chat input, `ai` if the LLM should generate it from context, `hybrid` if both sources can write but conflict-resolution applies.
- **Conflict resolution** assumes the chat is read in chronological order and `unifiedMerge` is applied (last-write-wins for primitives + dedup for arrays). Every "user wins" rule below relies on the existing `(?:en fait\|correction\|plutôt\|non c'?est)` correction-priority capture from `RX(type_intervention_correction)` and the loop-based "last match" idiom from `RX(charge_totale)`.

---

## A. Universal HVAC skeleton

| Field | Detection rule | Origin | Conflict resolution |
|---|---|---|---|
| **Header — N° intervention** | `(?:n[°o]\s*intervention\|n[°o]\s*rapport\|ref(?:[ée]rence)?\s*(?:rapport)?)\s*[:#]?\s*([A-Z0-9\-/]{3,20})/i` | hybrid (printed on PDV / pre-filled by N8N) | last-write-wins; user can override with explicit "ref XYZ". |
| **Header — Type intervention** | Existing `RX(type_intervention_correction)` + compound-first chain (lines 12748–12768). Add CERFA enum: `/(?:assemblage\|mise en service\|modification\|maintenance(?:\s+(?:préventive\|corrective))?\|contrôle\s+étanchéité\s+(?:périodique\|non\s+périodique)\|démantèlement)/i` | user | "en fait/correction/plutôt" → overwrite; otherwise compound > preventive > MES > maintenance > SAV > installation. |
| **Header — Marque** | `/(?:marque\|brand\|fabricant)\s*[:=]?\s*(mitsubishi(?:\s+electric)?\|daikin\|carrier\|toshiba\|panasonic\|fujitsu\|hitachi\|samsung\|lg)/i` + auto-detect via model prefix tables (existing `RX(modele)` at L12846–L12852). | hybrid | model-prefix detection wins over free-text mention if explicit. |
| **Header — Lieu** | Combine site.adresse regex `RX(site_adresse)` + city regex `RX(site_ville)`. | user | last-write-wins. |
| **Header — Date début** | `/(?:d[ée]but\|arriv[ée]e?\|le)\s+(\d{1,2})[\/\-\s](\d{1,2}|janvier\|février\|…\|décembre)[\/\-\s](\d{2,4})(?:\s+[àa]\s+(\d{1,2})[h:](\d{0,2}))?/i` | user | last-write-wins; pair with `RX(heures_intervention)` for the time component. |
| **Header — Date fin** | `/(?:fin\|d[ée]part\|termin[ée])\s+(?:le\s+)?(\d{1,2})[\/\-\s](\d{1,2}\|janvier\|…)[\/\-\s](\d{2,4})(?:\s+[àa]\s+(\d{1,2})[h:](\d{0,2}))?/i` | user | last-write-wins. |
| **Header — Dossier suivi par** | `/(?:dossier\|suivi)\s+(?:suivi\s+)?par\s+([A-ZÀ-Ÿ][\wÀ-ÿ\-\s]{2,30})/i` | user | last-write-wins. |
| **Site — Numéro affaire** | `/(?:n[°o]?\s*(?:affaire\|chantier\|projet)\|affaire\s+n[°o]?)\s*[:#]?\s*([A-Z0-9\-]{3,15})/i` | user | last-write-wins. |
| **Site — Lieu d'intervention** | Existing `RX(site_adresse)` + `RX(site_ville)`. | user | last-write-wins. |
| **Client — Référence client** | `/(?:r[ée]f(?:[ée]rence)?\s+client\|client\s+r[ée]f)\s*[:#]?\s*([A-Z0-9\-]{2,15})/i` | user | last-write-wins. |
| **Client — Adresse** | Existing `RX(site_adresse)` reused; can be disambiguated when "client" / "facturation" precedes. | user | last-write-wins; client-scoped match preferred over site. |
| **Client — Contact** | `/(?:contact\|interlocuteur\|responsable)\s*[:=]?\s*(M(?:r\|me\|onsieur\|adame)?\.?\s+[A-ZÀ-Ÿ][\wÀ-ÿ\-]{1,30}(?:\s+[A-ZÀ-Ÿ][\wÀ-ÿ\-]{1,30})?)/i` | user | last-write-wins. |
| **Client — Téléphone** | `/(?:t[ée]l(?:[ée]phone)?\|portable\|gsm\|mobile)\s*[:=]?\s*(0\d(?:[\s\.\-]?\d{2}){4})/i` | user | last-write-wins; normalise to E.164 `+33`. |
| **Client — Email** | `/[\w.+\-]+@[\w\-]+\.[\w.\-]+/i` (anchor on previous "email"/"@") | user | last-write-wins. |
| **Client — Société** | Existing `RX(client_societe)` (L12772–L12783). | user | first-write-wins (current behaviour) → **change to last-write-wins** for Cube to match correction-priority pattern. |
| **Dates — Date+heure début/fin** | Combination of date regex + `RX(heures_intervention)` (L12993). | user | last-write-wins. |
| **Résultat — status** | Existing `RX(resultat)` (L13005–L13013). Add explicit `(r[ée]solu\|partiel\|en\s+cours\|non\s+r[ée]solu\|en\s+attente)` keyword scan. | user | "résolu" wins over "non résolu" only if "résolu" appears later than "non résolu". Otherwise last-occurrence. |
| **Résultat — label / description / conclusion** | Existing regex; AI-generated fallback for missing description from chat history. | hybrid | user wins; if AI synthesizes, prefix with `[AI]` so user can override. |
| **Réserves — free text + structured (type, sévérité)** | `/r[ée]serves?\s*[:=]?\s*([\s\S]{10,500})(?=\.\s*[A-Z]\|$)/i` plus per-item splitter on `[•\-\*]\s+` or numeric prefixes. Severity: `/\b(mineure\|majeure\|bloquante\|critique\|urgent)/i`. | user | dedup via R5_PATCH_C-3 fingerprint; severity last-write-wins. |
| **Sécurité — risques** | `/(?:risques?\|s[ée]curit[ée])\s+(?:identifi[ée]s?)?\s*[:=]\s*([\s\S]{5,400})(?=\.\s*[A-Z]\|$)/i` | user | last-write-wins. |
| **Sécurité — état** | `/(?:s[ée]curit[ée]\s+du\s+syst[èe]me\|s[ée]curit[ée]\s+(?:est\s+)?)(ok\|à\s+surveiller\|critique)/i` (3-state enum). | user | last-write-wins. |
| **Adressage — référence usine** | Existing `RX(adressage_structure)` + `RX(adressage_malformed_fix)`. | user | dedup by normalised UI/UE address (current behaviour). |
| **Adressage — numéro série** | Existing capture group from `RX(adressage_structure)`. | user | last-write-wins per address. |
| **Adressage — adressage** | Existing capture. | user | dedup. |
| **Adressage — désignation** | Existing capture (zone/designation alias). | user | last-write-wins. |
| **Adressage — commentaire** | New: split capture group 5 of `RX(adressage_structure)` already exists; just expose it in drawer/Word. | user | last-write-wins. |
| **Adressage — espace de service** | `/espace\s+(?:de\s+)?service\s*[:=]?\s*(conforme\|non\s+conforme\|insuffisant)/i` | user | last-write-wins. |
| **Fluide — type** | Existing `RX(fluide_type)` (L12972). | user | first-write-wins (existing). User override: "en fait c'est R32" → applies `RX(type_correction)` pattern. |
| **Fluide — type huile** | `/(?:huile\|oil)\s*[:=]?\s*(POE\|PAG\|PVE\|FVC\|MO\|AB\|PAO)/i` | user | last-write-wins. |
| **Fluide — C1 charge initiale** | Existing `RX(charge_initiale)` (L12988). | user | first-write-wins (existing). |
| **Fluide — C2 / C3 appoints (array)** | `/appoint\s+(?:n[°o]?\s*)?(\d)\s*(?:de\s+)?(\d+[\.,]?\d*)\s*kg(?:\s+(?:le\s+)?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}))?/gi` | user | append per index; user can correct via "appoint 2 c'est 1.5 kg" → last-write-wins for that index. |
| **Fluide — C4 charge totale** | Existing `RX(charge_totale)` loop (L12982). | user | last-write-wins (existing). |
| **Heures fonctionnement — type d'organe + désignation + heures + démarrages** | `/(compresseur\|ventilateur\|pompe\|résistance)(?:\s+([A-Z0-9]+))?\s*[:=]\s*(\d+)\s*h(?:eures?)?(?:\s*[/,]?\s*(\d+)\s*d[ée]marrages)?/gi` | user | dedup by `${organe}|${designation}`; last-write-wins per pair. |
| **Heures fonctionnement — démarrages/heure** | computed `nb_demarrages / nb_heures` — no chat regex. | ai (computed) | n/a. |
| **Rapport technicien (free narrative)** | n/a — should be AI-generated from full chat history. | ai | user can manually overwrite via drawer edit; drawer edit wins. |
| **Remarques** | `/remarques?\s*[:=]\s*([\s\S]{5,400})(?=\.\s*[A-Z]\|$)/i` | hybrid | last-write-wins. |
| **Travaux à prévoir + priorité** | `/(?:[àa]\s+pr[ée]voir\|travaux\s+à\s+pr[ée]voir)\s*[:=]?\s*([\s\S]{5,400})/i` + per-item splitter; priority `/\b(urgent\|prioritaire\|normal\|optionnel)/i`. | user | dedup via existing `travaux_prevoir` keyFn (texte first 50 chars). |
| **Photographies — titre / image / caption** | n/a from chat — uploaded via UI; caption regex when user types `/légende|caption\s*[:=]\s*([^\n]{5,80})/i` near a photo upload. | user | last-write-wins per photo index. |
| **Détail heures techniciens — nom** | `/(?:tech(?:nicien)?(?:s)?\s+pr[ée]sents?\s*[:=]?\s*)([A-ZÀ-Ÿ][\wÀ-ÿ\-]+(?:\s+et\s+[A-ZÀ-Ÿ][\wÀ-ÿ\-]+)*)/i` | user | dedup by name; last-write-wins per name. |
| **Détail heures — date+heure arrivée/départ** | Existing `RX(heures_intervention)` (L12993, L12999). | user | last-write-wins. |
| **Signatures — client / technicien (image)** | Captured from drawer canvas; not chat-based. | user | last-write-wins. |
| **Signatures — observation client** | Free text in drawer textarea + `/observation\s+client\s*[:=]\s*([\s\S]{5,400})/i` chat fallback. | user | last-write-wins; ignore default "Observations du client...". |
| **Signatures — autres techniciens** | Same as "Détail heures — nom" — propagate into `signatures.autres_techniciens[]`. | user | dedup. |
| **Signatures — nom STA** | `/(?:nom\s+sta\|sta\s*[:=])\s*([A-ZÀ-Ÿ][\wÀ-ÿ\-\s]{2,30})/i` | user | last-write-wins. |

---

## B. Mise en service (MES) annex

For all 21 MES fields, the recommended approach is:

- **Origin: user** for field values (e.g. lengths, intensities, températures).
- **Origin: ai** for the 12-point Mitsubishi checklist statuses *only when the technician has not explicitly answered each point* (mark unconfirmed points as `null`, never assume `'C'`).

| Field | Detection rule | Origin | Conflict |
|---|---|---|---|
| Validation préconisations Mitsubishi (12 pts) | Per-point: `/(préconisation\|point)\s*(\d{1,2})\s*[:=]\s*(c\|nc\|n\.?a\|conforme\|non\s+conforme)/i` | hybrid | user > AI; per-index last-write-wins. |
| Conduite frigo — longueur totale / OC↔UI loin / 1er Té↔UI loin / entre OC / dénivelés (×2) | `/(longueur\s+totale\|l\.?\s*OC[\s↔→\-]+UI\s+loin\|l\.?\s*1er\s+t[ée]\|d[ée]nivel[ée]\s+OC[\s↔→\-]+UI\s+basse\|d[ée]nivel[ée]\s+entre\s+UI)\s*[:=]?\s*(\d+[\.,]?\d*)\s*m\b/gi` | user | last-write-wins per label. |
| Kit jumelage / type Té / anomalies | `/(?:kit\s+jumelage\|type\s+t[ée])\s*[:=]\s*([\w\-]+)/i` ; anomalies = free text. | user | last-write-wins. |
| Hydraulique (filtre eau, vanne équilibrage, flow switch, volume eau, mesure débit, purgeur, antigel) | Per-item: `/(filtre\s+eau\|vanne\s+[ée]quilibrage\|flow\s+switch\|volume\s+eau\|d[ée]bit\|purgeur\|antigel)\s*[:=]\s*(oui\|non\|conforme\|non\s+conforme\|\d+(?:[\.,]\d+)?\s*\w+)/gi` | user | last-write-wins per item. |
| Réglages consignes (T° froid/chaud/hygrométrie, antigel évaporateur, type régulation, bande proportionnelle) | `/(?:consigne\s+(?:froid\|chaud\|hygrom[ée]trie)\|anti[\s\-]?gel\s+[ée]vaporateur\|type\s+r[ée]gulation\|bande\s+proportionnelle)\s*[:=]?\s*([\w\d\.,°%]+)/gi` | user | last-write-wins. |
| Charge condenseur déporté (C1/C2 init/appoint, huile, gaz/liquide longueur+section) | Multi-line; combine `/condenseur\s+d[ée]port[ée][\s\S]{0,200}/i` block then per-line `/(?:c1\|c2\|appoint)\s*(?:init(?:iale)?\|appoint)?\s*[:=]?\s*(\d+[\.,]?\d*)\s*kg\|m\|mm[²2]/gi`. | user | last-write-wins per slot. |
| Relevé général (version logiciel, air ext, tension auxiliaires/fonct/arrêt) | `/(?:version\s+logiciel\|air\s+ext\|tension\s+(?:auxiliaires\|fonctionnement\|arr[êe]t))\s*[:=]?\s*([\w\.\d\-]+)/gi` | user | last-write-wins. |
| Relevé température air (entrée/sortie, deltaT, hygrométrie, % ventilo) | `/(?:t[°°]?\s+(?:entr[ée]e\|sortie)\|delta\s*t\|hygrom[ée]trie\|%\s*ventilateur)\s*[:=]?\s*(-?\d+[\.,]?\d*)\s*(°C\|%\|K)/gi` | user | last-write-wins per label. |
| Relevé frigo C1/C2 (T° refoulement, liquide, aspiration, BP, HP, surchauffe, sous-refroidissement) | `/(?:circuit\s*)?C(\d)\s+(refoulement\|liquide\|aspiration\|bp\|hp\|surchauffe\|sous[\s\-]?refroidissement)\s*[:=]?\s*(-?\d+[\.,]?\d*)\s*(°C\|bar\|K)/gi` | user | dedup `${circuit}|${param}`; last-write-wins. |
| Intensités compresseurs L1/L2/L3 × C1...C6 | `/c(\d)\s*(?:compresseur)?\s*(?:l(\d)\s*[:=]?\s*)?(\d+[\.,]?\d*)\s*a\b/gi` | user | dedup `${compressor}|${phase}`. |
| Intensités ventilateurs armoire L1/L2/L3 × V1...V4 | `/v(\d)\s*(?:ventilateur)?\s*(?:l(\d)\s*[:=]?\s*)?(\d+[\.,]?\d*)\s*a\b/gi` | user | dedup similarly. |
| Intensités résistances électriques (1er/2ème étage, thermostat) | `/r[ée]sistance\s+(\d|1er\|2[èe]me)\s+[ée]tage\s*[:=]?\s*(\d+[\.,]?\d*)\s*a/gi` | user | last-write-wins. |
| Humidificateur (intensités électrodes, test remplissage/vidange) | `/(humidificateur\|[ée]lectrode)\s+(intensit[ée]\|remplissage\|vidange)\s*[:=]?\s*([\w\d\.\,]+)/gi` | user | last-write-wins. |
| Spécifications commande (T° entrée/sortie, débit, puissance, supervision, glycol %) | `/(supervision\|protocole)\s*[:=]?\s*(modbus\|lonworks\|trend\|bacnet\|knx)/i` ; `/glycol\s*(?:[:=]?\s*)(\d+[\.,]?\d*)\s*%/i` | user | last-write-wins. |

---

## C. Roof-top / CTA annex

| Field | Detection rule | Origin | Conflict |
|---|---|---|---|
| Inspection visuelle CTA (16 pts) | Per-point: `/(?:inspection\|point)\s*(\d{1,2})\s*[:=]?\s*(c\|nc\|n\.?a\|conforme\|non\s+conforme)/i` | hybrid | user > AI per index. |
| Vérification batterie hydraulique (14 pts) | Same shape. | hybrid | same. |
| Pressostats sécurité [PA] | `/(?:pressostat\s+(?:filtre\s+)?(air\s+neuf\|poche\|reprise))\s*[:=]?\s*(\d+)\s*pa/gi` | user | last-write-wins. |
| Ventilateurs reprise V1, V2 (intensités, %) | `/v(1\|2)\s*reprise\s+(?:intensit[ée]\|%)\s*[:=]?\s*(\d+[\.,]?\d*)\s*(a\|%)/gi` | user | dedup `${V}|${unit}`. |
| Ventilateurs soufflage V3, V4 | `/v(3\|4)\s*soufflage\s+…/gi` | user | same. |
| Delta P ventilateurs reprise/soufflage | `/delta\s*p\s+(reprise\|soufflage)\s*[:=]?\s*(\d+)\s*pa/gi` | user | last-write-wins. |
| Pression en gaine reprise/soufflage | `/pression\s+(?:en\s+)?gaine\s+(reprise\|soufflage)\s*[:=]?\s*(\d+)\s*pa/gi` | user | last-write-wins. |
| Débit d'air reprise/soufflage | `/d[ée]bit\s+(?:d['e]\s*air\s+)?(reprise\|soufflage)\s*[:=]?\s*(\d+)\s*m[³3]\/h/gi` | user | last-write-wins. |
| Mode air neuf % | `/(?:air\s+neuf\|free\s*cooling)\s*[:=]?\s*(\d+)\s*%/i` | user | last-write-wins. |
| Relevé température aéraulique | reuse MESURE_ALIAS_MAP keys (`temp_soufflage`, `temp_reprise`, `temp_ext`, `hygrometrie`). | user | dedup via existing `mesures` keyFn. |
| Intensités roues récup R1, dessicante R2 | `/(roue\s+r[ée]cup[ée]ration\s+R1\|roue\s+dessicante\s+R2)\s+intensit[ée]\s*[:=]?\s*(\d+[\.,]?\d*)\s*a/gi` | user | last-write-wins. |
| Intensités résistances R1, R2 | `/r[ée]sistance\s+R(\d)\s+intensit[ée]\s*[:=]?\s*(\d+[\.,]?\d*)\s*a/gi` | user | dedup. |
| Intensités pompes P1, P2 | `/pompe\s+P(\d)\s+intensit[ée]\s*[:=]?\s*(\d+[\.,]?\d*)\s*a/gi` | user | dedup. |

---

## D. Visite constructeur (VC) annex

| Field | Detection rule | Origin | Conflict |
|---|---|---|---|
| Inspection environnement UE (16 pts) / CMB (14 pts) / UI (12 pts) / Vérification & test (24 pts) | Per-point: `/(ue\|cmb\|ui\|test)\s*-?\s*(\d{1,2})\s*[:=]?\s*(c\|nc\|n\.?a)/i` | hybrid | user > AI per index. |
| Contrôles isolements ohm (UE1/UE2/UE3 — L1-L2/L1-L3/L2-L3/L1-Terre) | `/UE(\d)\s+(L\d-L\d\|L\d-Terre)\s*[:=]?\s*(\d+(?:[\.,]\d+)?)\s*Ω/gi` | user | dedup `${UE}|${pair}`. |
| Contrôles isolements mégaohm (L1-Terre/L2-Terre/L3-Terre/L1-L2/L1-L3/L2-L3) | `/UE(\d)\s+(L\d-(?:Terre\|L\d))\s*[:=]?\s*(\d+(?:[\.,]\d+)?)\s*M[ΩO]/gi` | user | dedup. |
| Tensions alimentation (10 pairs incl. TB3/TB7) | `/(L\d-L\d\|Terre-N\|BUS\|L\d-N\|TB\d)\s*[:=]?\s*(\d+(?:[\.,]\d+)?)\s*V/gi` | user | dedup. |
| Relevé fonctionnement UE/CMB par mode (refoulement, désurchauffe, sous-refroidissement, surchauffe, cible, fréq inverter, lev1, PS1, SCC, SC0) | Multi-line block parser (mode header `/(froid\|chaud\|d[ée]givrage)/i`) then `/(refoulement\|d[ée]surchauffe\|sous[\s\-]?refroidissement\|surchauffe\|cible\|fr[ée]quence\s+inverter\|lev\s*1\|ps\s*1\|scc\|sc0)\s*[:=]?\s*([\d\.,\-]+)\s*(°C\|hz\|bar\|%)?/gi` | user | dedup `${mode}|${param}`. |
| Relevé fonctionnement UI par mode | Same shape with UI prefix. | user | dedup. |
| Circuit en défaut + code alarme + 3 derniers historiques | `/(?:circuit\s+en\s+d[ée]faut)\s*[:=]?\s*([UC]\d{1,2})/i` ; `/derniers?\s+codes?\s+alarme\s*[:=]?\s*([A-Z0-9]{2,5})(?:\s*[,;]\s*([A-Z0-9]{2,5}))?(?:\s*[,;]\s*([A-Z0-9]{2,5}))?/i` | user | append to `codes_defaut[]` with `historique:true`. |

---

## E. GTC MES annex

| Field | Detection rule | Origin | Conflict |
|---|---|---|---|
| Information unités intérieures (50 lignes — N° adresse, N° groupe centralisé, N° étage, Nom groupe) | Table parser; per-line `/(\d{1,2})\s*[\|\/]\s*(\d{1,2})\s*[\|\/]\s*(\d{1,2})\s*[\|\/]\s*(.+?)$/gm`. | user | dedup by adresse. |
| Commande centralisée (modèle, série, IP, passerelle, masque, version logiciel) | `/(?:mod[èe]le\|s[ée]rie\|ip\|passerelle\|masque\|version\s+logiciel)\s*[:=]\s*([\w\.\d\-]+)/gi` | user | last-write-wins. |
| Fonctions activées (8 booleans) | Per-feature: `/(asservissement\|commande\s+virtuelle\|gestion\s+[ée]nerg[ée]tique\|[ée]tat\s+groupe\|archivage\|webdesign\|bacnet\|maintenance\s+tool)\s*[:=]?\s*(oui\|non\|activ[ée]e?\|d[ée]sactiv[ée]e?)/gi` | user | last-write-wins per feature. |
| Extensions 1, 2, 3 (mêmes champs) | Same as commande centralisée scoped to `/extension\s*(\d)/i` block. | user | dedup by extension index. |
| Informations GTC (BACNET, MODBUS, KNX, WEBDESIGN, LMAP, PAC YG-60 — série + IP/M-net + Associé à) | `/(bacnet\|modbus\|knx\|webdesign\|lmap\|pac\s+yg-?60)\s*[:=]?\s*(?:s[ée]rie\s*[:=]?\s*([\w\d\-]+))?\s*(?:ip\|m-?net)?\s*[:=]?\s*([\d\.]+)?/gi` | user | dedup per protocol. |
| Réglages d'options (6 sub-blocks) | Free text per sub-block — capture as nested `gtc.reglages_options.{asservissements, messages, limitations, energie, reseau, ambiance}`. | hybrid | last-write-wins. |

---

## F. CERFA n° 15497*04 (regulatory)

| Field | Detection rule | Origin | Conflict |
|---|---|---|---|
| Opérateur — nom / adresse / SIRET | `/(?:op[ée]rateur)\s*(?:nom\|raison\s+sociale)?\s*[:=]\s*([^\n]{3,80})/i` ; `/SIRET\s*[:=]?\s*(\d{14})/i` | user | last-write-wins. |
| Opérateur — N° attestation capacité (cat I/II/III/IV) | `/attestation\s+(?:de\s+)?capacit[ée]\s*(?:n[°o])?\s*[:=]?\s*([A-Z0-9\-]{4,15})\s*(?:cat[ée]gorie)?\s*(I{1,3}V?)/i` | user | last-write-wins. |
| Détenteur — nom / adresse / SIRET | Same regex shapes scoped to `/d[ée]tenteur/i`. | user | last-write-wins. |
| Équipement — identification | Reuse `equipements[].id` + `equipements[].numero_serie`. | hybrid | last-write-wins. |
| Équipement — dénomination fluide R-X | Existing `RX(fluide_type)`. | user | first-write-wins. |
| Équipement — charge totale (kg) | Existing `RX(charge_totale)`. | user | last-write-wins. |
| Équipement — tonnage équivalent CO₂ | Computed: `charge_totale_kg × PRG[fluid_type] / 1000`. PRG lookup table (`R410A:2088`, `R32:675`, `R134A:1430`, `R407C:1774`, `R290:3`, `R744:1`). | ai (computed) | n/a — recomputed on write. |
| Nature intervention — 8 cases | `/(assemblage\|mise\s+en\s+service\|modification\|maintenance\|contr[ôo]le\s+[ée]tanch[ée]it[ée]\s+(?:p[ée]riodique\|non\s+p[ée]riodique)\|d[ée]mantèlement\|autre)/gi` (multi-match → boolean per case). | user | last-write-wins per case (correction-priority for "en fait c'est démantèlement"). |
| Détecteur manuel fuite — identification + date contrôle | `/(?:d[ée]tecteur\s+(?:manuel\s+de\s+)?fuite)\s*[:=]?\s*([\w\-]+)\s*(?:contr[ôo]l[ée]\s+le\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}))?/i` | user | last-write-wins. |
| Détection permanente — OUI/NON | `/d[ée]tection\s+permanente\s*[:=]?\s*(oui\|non)/i` | user | last-write-wins. |
| Fréquence contrôle périodique | Computed from `tonnage_co2` + presence of permanent detector (no chat regex). Lookup table per CERFA spec (HCFC 2/30/300, HFC-PFC 5/50/500, HFO 1/10/100; with detector ⇒ 24/12/6 mois, without ⇒ 12/6/3 mois). | ai (computed) | n/a. |
| Fuites — localisation + état (×3 max) | Per-fuite: `/fuite\s*(\d)?\s*[:=]\s*([^\n]{5,100})\s+(r[ée]alis[ée]e?\|à\s+faire\|en\s+cours)/gi` | user | dedup by index; last-write-wins per index. |
| Manipulation fluide — A=vierge / B=recyclé / C=régénéré | `/(?:vierge\|recycl[ée]\|r[ée]g[ée]n[ée]r[ée])\s*[:=]?\s*(\d+[\.,]?\d*)\s*kg/gi` | user | dedup by category; last-write-wins. |
| Manipulation fluide — D=traitement / E=réutilisation | `/(?:traitement\|r[ée]utilisation)\s*[:=]?\s*(\d+[\.,]?\d*)\s*kg/gi` | user | dedup; last-write-wins. |
| Dénomination fluide chargé si changement | `/(?:fluide\s+charg[ée])\s*[:=]?\s*(R-?\d{2,4}[A-Z]?)/i` | user | last-write-wins. |
| Numéro BSFF (Trackdéchets) | `/(?:bsff\|trackd[ée]chets)\s*(?:n[°o])?\s*[:=]?\s*([A-Z0-9\-]{8,20})/i` | user | last-write-wins. |
| Identification contenants | `/(?:contenant\|bouteille)\s*(\d{1,2})?\s*[:=]?\s*([A-Z0-9\-]{4,15})/gi` | user | dedup by serial. |
| Dénomination ADR/RID — UN 1078 / UN 3161 | `/un\s*(1078\|3161)/i` (auto from fluid type fallback: R32/R290 → UN 3161, others → UN 1078). | hybrid | user override > computed. |
| Installation prévue destination fluide récupéré (nom, SIRET, adresse) | Scoped block `/(?:destination\s+fluide\s+r[ée]cup[ée]r[ée])[\s\S]{0,300}/i`, then SIRET + name + address sub-regex. | user | last-write-wins. |
| Observations | `/observations?\s*[:=]\s*([\s\S]{5,400})(?=\.\s*[A-Z]\|$)/i` | user | last-write-wins. |
| Signatures Opérateur (nom, qualité, date, signature) | Drawer canvas + `/(?:nom\|qualit[ée]\|date)\s+op[ée]rateur\s*[:=]\s*([^\n]+)/gi` | user | last-write-wins. |
| Signatures Détenteur (nom, qualité, date, signature) | Same shape scoped to `/d[ée]tenteur/i`. | user | last-write-wins. |

---

## Global conflict-resolution policy

The current code in `buildPartialReport()` already implements correction-priority via `/(?:en fait\|correction\|plutôt\|non c'?est)/i` for `type_intervention`. Generalise this to **every primitive field** for Cube:

```js
function correctionPriority(allText, fieldRegex) {
  const corrMatch = allText.match(
    new RegExp(`(?:en fait|correction|plut[ôo]t|non c'?est|je me suis trompé|c'?est plut[ôo]t)[^.]{0,80}?${fieldRegex.source}`, 'i')
  );
  if (corrMatch) return corrMatch[1];   // user override wins
  // otherwise loop all matches and keep last
  let last = null, m;
  const g = new RegExp(fieldRegex.source, 'gi');
  while ((m = g.exec(allText)) !== null) last = m[1];
  return last;
}
```

Use this helper for: `type_intervention`, `fluide.type`, `fluide.charge_totale`, `fluide.charge_initiale`, `client.societe`, `site.adresse`, `site.ville`, every CERFA scalar, every numeric MES/VC/ROOFTOP relevé.

For arrays (`reserves`, `codes_defaut`, `mesures`, `adressage`, `travaux_*`, `recommandations`), keep the existing `unifiedMerge` behaviour:

- `REPLACE_ARRAYS = { travaux_effectues, travaux_prevoir, recommandations }` — N8N is authoritative.
- All others — append + dedup by `keyFn` from `deduplicateArray`.

For the ai-vs-user split: tag every AI-synthesised field with `_provenance: 'ai'`. When the user later edits that field in the drawer, set `_provenance: 'user'` and never overwrite with AI again. This avoids the current 2-direction race (extraction overwriting chat corrections, see FIX_ROUND_3 BUG 3 / BUG 4).
