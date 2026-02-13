# PATCH B: Corriger buildPartialReport() — 4 sous-patches

Fichier: `technician/index.html`
Fonction: `buildPartialReport` (vers ligne 12995)

---

## B1: Deep copy au lieu de shallow copy (ligne 13023)

### Diagnostic
`{ ...lastReportData }` = shallow copy → les arrays de partialData sont les MÊMES objets que lastReportData. Donc `mergeReportData(partialData, data)` MUTE directement les arrays de lastReportData !

### Chercher:
```javascript
            // Start with base data (keep existing if any)
            const partialData = lastReportData ? { ...lastReportData } : {
```

### Remplacer par:
```javascript
            // Start with base data (R5: deep copy to prevent mutation of lastReportData)
            let partialData = lastReportData ? JSON.parse(JSON.stringify(lastReportData)) : {
```

---

## B2: Type intervention — détection par priorité (lignes 13067-13078)

### Diagnostic
L'ordre actuel teste `dépannage` AVANT `maintenance`, donc "maintenance préventive avec dépannage" → "SAV / Dépannage" (faux). Et le guard `if (!partialData.type_intervention)` bloque toute correction.

### Chercher:
```javascript
            // Detect type intervention
            if (!partialData.type_intervention) {
                if (allText.includes('dépannage') || allText.includes('sav') || allText.includes('panne')) {
                    partialData.type_intervention = 'SAV / Dépannage';
                } else if (allText.includes('mise en service') || allText.match(/\bmes\b/)) {
                    partialData.type_intervention = 'Mise en service';
                } else if (allText.includes('maintenance') || allText.includes('entretien')) {
                    partialData.type_intervention = 'Maintenance';
                } else if (allText.includes('installation')) {
                    partialData.type_intervention = 'Installation';
                }
            }
```

### Remplacer par:
```javascript
            // Detect type intervention (R5: correction-priority, compound types first)
            {
                let detected = null;
                const corrMatch = allText.match(/(?:en fait|correction|plutôt|non c'?est)[^.]{0,50}?(maintenance préventive avec dépannage|maintenance préventive|dépannage|mise en service|installation|diagnostic)/i);
                if (corrMatch) {
                    detected = corrMatch[1].charAt(0).toUpperCase() + corrMatch[1].slice(1);
                } else if (allText.includes('maintenance préventive') && (allText.includes('dépannage') || allText.includes('panne'))) {
                    detected = 'Maintenance préventive avec dépannage';
                } else if (allText.includes('maintenance préventive')) {
                    detected = 'Maintenance préventive';
                } else if (allText.includes('mise en service') || allText.match(/\bmes\b/)) {
                    detected = 'Mise en service';
                } else if (allText.includes('maintenance') || allText.includes('entretien')) {
                    detected = 'Maintenance';
                } else if (allText.includes('dépannage') || allText.includes('sav') || allText.includes('panne')) {
                    detected = 'SAV / Dépannage';
                } else if (allText.includes('installation')) {
                    detected = 'Installation';
                }
                if (detected) partialData.type_intervention = detected;
            }
```

---

## B3: Codes défaut — détection incrémentale (lignes 13114-13148)

### Diagnostic
Le guard `if (!partialData.codes_defaut || length === 0)` empêche la détection de NOUVEAUX codes (ex: 6607) quand des codes existent déjà.

### Chercher:
```javascript
            // ═══ IMPROVED ERROR CODE DETECTION ═══
            // More patterns and better extraction
            if (!partialData.codes_defaut || partialData.codes_defaut.length === 0) {
```

### Remplacer par:
```javascript
            // ═══ IMPROVED ERROR CODE DETECTION (R5: incremental — always scan for new codes) ═══
            {
                const existingCodes = new Set((partialData.codes_defaut || []).map(c => c.code));
```

### ET chercher (vers lignes 13142-13148):
```javascript
                if (foundCodes.size > 0) {
                    partialData.codes_defaut = Array.from(foundCodes).map(code => ({
                        code: code,
                        description: '' // Will be filled by AI
                    }));
                }
            }
```

### Remplacer par:
```javascript
                if (foundCodes.size > 0) {
                    if (!partialData.codes_defaut) partialData.codes_defaut = [];
                    for (const code of foundCodes) {
                        if (!existingCodes.has(code)) {
                            partialData.codes_defaut.push({ code, description: '' });
                        }
                    }
                }
            }
```

---

## B4: Ajouter extraction texte (charge, heures, résultat) — après fluide (ligne 13285)

### Chercher:
```javascript
            // Detect fluide
            if (!partialData.fluide?.type) {
                const fluideMatch = allText.match(/(r410a|r32|r134a|r407c|r290|r744)/i);
                if (fluideMatch) {
                    partialData.fluide = partialData.fluide || {};
                    partialData.fluide.type = fluideMatch[1].toUpperCase();
                }
            }

            // Update the stored data and refresh preview  (FIX-3: Don't overwrite extraction data)
```

### Remplacer par:
```javascript
            // Detect fluide
            if (!partialData.fluide?.type) {
                const fluideMatch = allText.match(/(r410a|r32|r134a|r407c|r290|r744)/i);
                if (fluideMatch) {
                    partialData.fluide = partialData.fluide || {};
                    partialData.fluide.type = fluideMatch[1].toUpperCase();
                }
            }

            // R5: Charge totale — LAST occurrence = correction du technicien
            {
                let lastCharge = null;
                const reCharge = /charge\s+totale\s*(?:de\s+|:\s*|(?:c'?est|cest)\s+)?(\d+[\.,]?\d*)\s*kg/gi;
                let cm; while ((cm = reCharge.exec(allText)) !== null) lastCharge = cm[1].replace(',', '.');
                if (lastCharge) { partialData.fluide = partialData.fluide || {}; partialData.fluide.charge_totale = lastCharge; }
            }
            // R5: Charge usine (fill-gaps only)
            {
                const cu = allText.match(/charge\s+(?:usine|initiale)\s*(?:de\s+|:\s*)?(\d+[\.,]?\d*)\s*kg/i);
                if (cu) { partialData.fluide = partialData.fluide || {}; if (!partialData.fluide.charge_initiale) partialData.fluide.charge_initiale = cu[1].replace(',', '.'); }
            }
            // R5: Heures d'intervention
            {
                const rh = allText.match(/(?:intervention|arriv[ée]e?|de)\s+(?:[àa]\s+)?(\d{1,2})\s*[h:]\s*(\d{0,2})\s*(?:[àa]|-)\s*(\d{1,2})\s*[h:]\s*(\d{0,2})/i);
                if (rh) {
                    partialData.technicien = partialData.technicien || {};
                    partialData.technicien.heure_arrivee = rh[1].padStart(2,'0') + ':' + (rh[2]||'00').padStart(2,'0');
                    partialData.technicien.heure_depart = rh[3].padStart(2,'0') + ':' + (rh[4]||'00').padStart(2,'0');
                } else {
                    const rd = allText.match(/(?:fini|termin[ée]|parti|d[ée]part)\s+(?:[àa]\s+)?(\d{1,2})\s*[h:]\s*(\d{0,2})/i);
                    if (rd) { partialData.technicien = partialData.technicien || {}; partialData.technicien.heure_depart = rd[1].padStart(2,'0') + ':' + (rd[2]||'00').padStart(2,'0'); }
                }
            }
            // R5: Résultat d'intervention
            {
                const rr = allText.match(/r[ée]sultat\s*:\s*(.+?)(?:\.\s|$)/im);
                if (rr) {
                    partialData.resultat = partialData.resultat || {};
                    const rt = rr[1].trim();
                    partialData.resultat.description = rt;
                    if (/r[ée]solu|corrig[ée]/i.test(rt) && !/non|persiste/i.test(rt)) partialData.resultat.status = 'resolu';
                    else if (/persiste|partiel|attente|reprise/i.test(rt)) partialData.resultat.status = 'en_attente_pieces';
                    else if (/non.*r[ée]solu|impossible/i.test(rt)) partialData.resultat.status = 'non_resolu';
                }
            }

            // Update the stored data and refresh preview  (FIX-3: Don't overwrite extraction data)
```
