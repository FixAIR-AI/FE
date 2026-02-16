# PATCH A: Corriger mergeReportData() — LAST-WRITE-WINS + DEDUP

Fichier: `technician/index.html`
Fonction: `mergeReportData` (vers ligne 13742)

## Diagnostic
La fonction originale n'a JAMAIS été patchée en R1-R4:
- Primitives: `if (!target[key]) target[key] = value` → first-write-wins → **bloque les corrections**
- Arrays: `target[key].push(...value)` (sauf codes_defaut) → **blind push = doublons**

## Chercher (EXACT — lignes 13741-13775):
```javascript
        // Merge incoming data into existing report data
        function mergeReportData(target, source) {
            if (!source) return;

            for (const [key, value] of Object.entries(source)) {
                if (value === null || value === undefined || value === '') continue;

                if (Array.isArray(value)) {
                    // For arrays, append new items
                    if (!target[key]) target[key] = [];
                    if (Array.isArray(target[key])) {
                        // Avoid duplicates for codes_defaut
                        if (key === 'codes_defaut') {
                            const existingCodes = new Set(target[key].map(c => c.code));
                            for (const item of value) {
                                if (!existingCodes.has(item.code)) {
                                    target[key].push(item);
                                }
                            }
                        } else {
                            target[key].push(...value);
                        }
                    }
                } else if (typeof value === 'object') {
                    // For nested objects, merge recursively
                    if (!target[key]) target[key] = {};
                    mergeReportData(target[key], value);
                } else {
                    // For primitives, only overwrite if target is empty
                    if (!target[key]) {
                        target[key] = value;
                    }
                }
            }
        }
```

## Remplacer par:
```javascript
        // Merge incoming data into existing report data (R5: last-write-wins + dedup arrays)
        function mergeReportData(target, source) {
            if (!source) return;
            for (const [key, value] of Object.entries(source)) {
                if (value === null || value === undefined || value === '') continue;
                if (Array.isArray(value)) {
                    if (!target[key]) target[key] = [];
                    if (Array.isArray(target[key])) {
                        if (REPLACE_ARRAYS.has(key)) {
                            if (value.length > 0) target[key] = [...value];
                        } else {
                            target[key] = deduplicateArray(key, target[key], value);
                        }
                    }
                } else if (typeof value === 'object') {
                    if (!target[key]) target[key] = {};
                    if (typeof target[key] === 'object' && !Array.isArray(target[key])) {
                        mergeReportData(target[key], value);
                    }
                } else {
                    target[key] = value;  // R5: LAST-WRITE-WINS — corrections écrasent les anciennes valeurs
                }
            }
        }
```

## Impact
- **Charge totale**: la correction 21.3 écrase l'ancien 20.8 ✅
- **Arrays**: deduplicateArray élimine les doublons au lieu de blind push ✅
- **Toutes les primitives**: les corrections du technicien gagnent toujours ✅
