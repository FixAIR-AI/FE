# FIXAIR — PLAN DE FIX DÉFINITIF

**Date**: 2026-02-12
**Status**: Audit complet terminé — prêt pour implémentation
**Scope**: Frontend (index.html) + Backend (N8N) + Database (Supabase)

---

## DIAGNOSTIC FINAL

### Root Cause (cause racine unique)

Le système a **3 formats de données différents** qui coexistent :

| Format | Où il est produit | Où il est consommé |
|--------|------------------|--------------------|
| **Chat format** (V1) | `[REPORT_DATA]` du chat AI | Word export, `calculateReportCompletion()` |
| **Extraction format** | Workflow N8N extraction | V12 drawer (renderer actif) |
| **Assistant format** | Save Assistant Context1 | `projects.extracted_data.assistant` (isolé) |

**Résultat** : le drawer V12 ne voit pas les données du chat, le Word export ne voit pas les données de l'extraction, et le calcul de progression est faux.

### Les 13 bugs identifiés — regroupés par fix

| Fix | Bugs résolus | Impact |
|-----|-------------|--------|
| **FIX-1**: `normalizeReportData()` | BUG-001, 002, 003, 004, 008, 009, 010 | **7 bugs** |
| **FIX-2**: Merge unifié | BUG-005, 007, 012 | **3 bugs** |
| **FIX-3**: Protéger `buildPartialReport()` | BUG-006 | **1 bug** |
| **FIX-4**: Debounce Supabase writes | BUG-013 | **1 bug** |
| **FIX-5**: Supabase Realtime (optionnel) | BUG-011 | **1 bug** |

### Supabase Schema Findings

- **Realtime NON activé** pour la table `projects` (activé uniquement pour: users, availability_shares, team_messages, invitations)
- **RLS actif** : `user_id = get_my_user_id()` — le workflow N8N doit utiliser `service_role` key
- **Pas de triggers** sur projects/messages/reports
- **Save Assistant Context1** écrit dans `extracted_data.assistant` (sous-objet) — **PAS de conflit** avec l'extraction qui écrit à la racine
- **Deux formats coexistent en production** dans `projects.extracted_data`

---

## FIX-1 : `normalizeReportData()` — CRITIQUE

**Résout** : BUG-001, 002, 003, 004, 008, 009, 010 (7 bugs)
**Principe** : Après chaque source de données (chat, extraction, Supabase load), normaliser pour que TOUS les formats soient présents simultanément.

### Code à ajouter (NOUVEAU — insérer avant `mergeReportData` ~ligne 13250)

```javascript
/**
 * normalizeReportData — Ensures data has BOTH chat-format AND extraction-format fields
 * Call after EVERY data source: chat parse, extraction result, Supabase load
 */
function normalizeReportData(data) {
    if (!data || typeof data !== 'object') return data;

    // ═══════════════════════════════════════════════
    // 1. FLUIDE ↔ FLUIDE_GLOBAL (bidirectional)
    // ═══════════════════════════════════════════════
    if (data.fluide_global && typeof data.fluide_global === 'object') {
        if (!data.fluide) data.fluide = {};
        if (data.fluide_global.type && !data.fluide.type)
            data.fluide.type = data.fluide_global.type;
        if (data.fluide_global.charge_usine_kg != null && !data.fluide.charge_initiale)
            data.fluide.charge_initiale = String(data.fluide_global.charge_usine_kg) + ' kg';
        if (data.fluide_global.charge_totale_site_kg != null && !data.fluide.charge_totale)
            data.fluide.charge_totale = String(data.fluide_global.charge_totale_site_kg) + ' kg';
    }
    if (data.fluide && typeof data.fluide === 'object') {
        if (!data.fluide_global) data.fluide_global = {};
        if (data.fluide.type && !data.fluide_global.type)
            data.fluide_global.type = data.fluide.type;
        if (data.fluide.charge_totale && !data.fluide_global.charge_totale_site_kg) {
            const num = parseFloat(String(data.fluide.charge_totale).replace(/[^\d.]/g, ''));
            if (!isNaN(num)) data.fluide_global.charge_totale_site_kg = num;
        }
        if (data.fluide.charge_initiale && !data.fluide_global.charge_usine_kg) {
            const num = parseFloat(String(data.fluide.charge_initiale).replace(/[^\d.]/g, ''));
            if (!isNaN(num)) data.fluide_global.charge_usine_kg = num;
        }
    }

    // ═══════════════════════════════════════════════
    // 2. SYSTEME ↔ EQUIPEMENTS (bidirectional)
    // ═══════════════════════════════════════════════
    if (data.equipements && Array.isArray(data.equipements) && data.equipements.length > 0) {
        if (!data.systeme || !data.systeme.modele) {
            // Find the main outdoor unit or first equipment
            const mainEquip = data.equipements.find(e =>
                e.role === 'ue' || e.role === 'outdoor' || e.role === 'unite_exterieure'
            ) || data.equipements[0];
            data.systeme = data.systeme || {};
            if (!data.systeme.modele) data.systeme.modele = mainEquip.modele;
            if (!data.systeme.type) data.systeme.type = mainEquip.type_ui || mainEquip.role;
            if (!data.systeme.serie) data.systeme.serie = mainEquip.numero_serie;
        }
    }
    if (data.systeme && data.systeme.modele && (!data.equipements || data.equipements.length === 0)) {
        data.equipements = [{
            id: 'sys-1',
            modele: data.systeme.modele,
            marque: data.brand || data.brand_key || '',
            role: 'ue',
            type_ui: data.systeme.type || '',
            numero_serie: data.systeme.serie || ''
        }];
    }

    // ═══════════════════════════════════════════════
    // 3. TRAVAUX_EFFECTUES : contenu ↔ texte
    // ═══════════════════════════════════════════════
    if (data.travaux_effectues && Array.isArray(data.travaux_effectues)) {
        data.travaux_effectues.forEach(t => {
            if (t.contenu && !t.texte) t.texte = t.contenu;
            if (t.texte && !t.contenu) t.contenu = t.texte;
        });
    }

    // ═══════════════════════════════════════════════
    // 4. RESERVES : description ↔ texte
    // ═══════════════════════════════════════════════
    if (data.reserves && Array.isArray(data.reserves)) {
        data.reserves.forEach(r => {
            // Handle string reserves (from extraction sometimes)
            if (typeof r === 'string') return; // skip, will be handled by array normalization below
            if (r.description && !r.texte) r.texte = r.description;
            if (r.texte && !r.description) r.description = r.texte;
        });
        // Normalize string reserves to objects
        data.reserves = data.reserves.map(r => {
            if (typeof r === 'string') {
                return { titre: r.substring(0, 60), texte: r, description: r, type: 'reserve' };
            }
            return r;
        });
    }

    // ═══════════════════════════════════════════════
    // 5. INTERVENTION.TYPE ↔ TYPE_INTERVENTION
    // ═══════════════════════════════════════════════
    if (data.intervention && data.intervention.type && !data.type_intervention) {
        data.type_intervention = data.intervention.type_label || data.intervention.type;
    }
    if (data.type_intervention && !data.intervention) {
        data.intervention = {
            type: data.type_intervention,
            type_label: data.type_intervention
        };
    }

    // ═══════════════════════════════════════════════
    // 6. MESURES : type ↔ label
    // ═══════════════════════════════════════════════
    if (data.mesures && Array.isArray(data.mesures)) {
        data.mesures.forEach(m => {
            if (m.type && !m.label) m.label = m.sous_type ? `${m.type} - ${m.sous_type}` : m.type;
            if (m.label && !m.type) m.type = m.label;
        });
    }

    // ═══════════════════════════════════════════════
    // 7. ADRESSAGE : normalize equipment_id format
    // ═══════════════════════════════════════════════
    if (data.adressage && Array.isArray(data.adressage)) {
        data.adressage.forEach(a => {
            // Ensure both ref_usine and equipement_id exist
            if (a.equipement_id && !a.ref_usine) a.ref_usine = a.equipement_id;
            if (a.ref_usine && !a.equipement_id) a.equipement_id = a.ref_usine;
            // Ensure both serie and numero_serie exist
            if (a.numero_serie && !a.serie) a.serie = a.numero_serie;
            if (a.serie && !a.numero_serie) a.numero_serie = a.serie;
        });
    }

    // ═══════════════════════════════════════════════
    // 8. RECOMMANDATIONS : normalize strings to objects
    // ═══════════════════════════════════════════════
    if (data.recommandations && Array.isArray(data.recommandations)) {
        data.recommandations = data.recommandations.map(r => {
            if (typeof r === 'string') {
                return { titre: r.substring(0, 60), description: r, texte: r };
            }
            if (r && !r.texte && r.description) r.texte = r.description;
            if (r && !r.description && r.texte) r.description = r.texte;
            return r;
        });
    }

    return data;
}
```

### Où appeler `normalizeReportData()` — 4 points d'insertion

**Point 1 — Après parsing [REPORT_DATA] du chat (ligne ~16086)**
```javascript
// AVANT (Line 16086):
let extractedData = JSON.parse(reportDataMatch[1].trim());

// APRÈS:
let extractedData = JSON.parse(reportDataMatch[1].trim());
extractedData = normalizeReportData(extractedData);  // ← AJOUTER
```

**Point 2 — Après réception résultat extraction (ligne ~15748)**
```javascript
// AVANT (dans handleExtractionResult, Line 15771):
smartMergeExtraction(lastReportData, extractedData);

// APRÈS:
extractedData = normalizeReportData(extractedData);  // ← AJOUTER
smartMergeExtraction(lastReportData, extractedData);
```

**Point 3 — Après chargement depuis Supabase (ligne ~10485)**
```javascript
// AVANT (Line 10485):
lastReportData = project.extracted_data;

// APRÈS:
lastReportData = normalizeReportData(project.extracted_data);  // ← MODIFIER
```

**Point 4 — Avant le Word export (dans collectReportData, ligne ~11315)**
```javascript
// AVANT:
return { ...lastReportData };

// APRÈS:
return normalizeReportData({ ...lastReportData });  // ← MODIFIER
```

---

## FIX-2 : Merge unifié — HAUTE PRIORITÉ

**Résout** : BUG-005, 007, 012 (3 bugs)
**Principe** : Remplacer les 2 fonctions merge par UNE SEULE avec stratégie cohérente.

### Remplacer `mergeReportData()` (ligne ~13257) ET `smartMergeExtraction()` (ligne ~15796)

```javascript
/**
 * unifiedMerge — Single merge strategy for all data sources
 * Primitives: LAST-WRITE-WINS (corrections toujours appliquées)
 * Arrays: DEDUPLICATE by smart keys
 */
function unifiedMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    if (!target || typeof target !== 'object') return { ...source };

    const result = { ...target };

    for (const key of Object.keys(source)) {
        const sourceVal = source[key];
        const targetVal = result[key];

        // Skip null/undefined source values
        if (sourceVal == null) continue;

        // Skip metadata
        if (key === '_metadata') continue;

        // Arrays: deduplicate
        if (Array.isArray(sourceVal)) {
            if (!Array.isArray(targetVal) || targetVal.length === 0) {
                result[key] = [...sourceVal];
            } else {
                result[key] = deduplicateArray(key, targetVal, sourceVal);
            }
        }
        // Nested objects: recursive merge
        else if (typeof sourceVal === 'object' && typeof targetVal === 'object') {
            result[key] = unifiedMerge(targetVal, sourceVal);
        }
        // Primitives: LAST-WRITE-WINS (source overwrites target)
        else if (sourceVal !== '' && sourceVal !== null && sourceVal !== undefined) {
            result[key] = sourceVal;
        }
    }

    return result;
}

/**
 * deduplicateArray — Smart dedup per field type
 */
function deduplicateArray(fieldName, existing, incoming) {
    // Combine both arrays
    const combined = [...existing, ...incoming];

    // Choose dedup key based on field name
    let keyFn;
    switch (fieldName) {
        case 'equipements':
            keyFn = item => {
                if (typeof item === 'string') return item;
                const model = (item.modele || '').toUpperCase().replace(/-[A-Z]\d*$/, '');
                return `${model}|${item.role || ''}`;
            };
            break;
        case 'adressage':
            keyFn = item => {
                if (typeof item === 'string') return item;
                // Normalize UI01 → UI1
                const id = (item.equipement_id || item.ref_usine || item.adresse || '')
                    .toUpperCase().replace(/UI0*(\d+)/i, 'UI$1');
                return id;
            };
            break;
        case 'mesures':
            keyFn = item => {
                if (typeof item === 'string') return item;
                const type = (item.type || item.label || '').toLowerCase();
                const sousType = (item.sous_type || '').toLowerCase();
                const equipId = (item.equipement_id || '').toUpperCase();
                return `${type}|${sousType}|${equipId}`;
            };
            break;
        case 'codes_defaut':
            keyFn = item => {
                if (typeof item === 'string') return item;
                return (item.code || '').toUpperCase();
            };
            break;
        case 'travaux_effectues':
        case 'travaux_prevoir':
            keyFn = item => {
                if (typeof item === 'string') return item;
                const text = (item.texte || item.contenu || item.titre || '').substring(0, 50).toLowerCase();
                return text;
            };
            break;
        case 'reserves':
        case 'recommandations':
            keyFn = item => {
                if (typeof item === 'string') return item.substring(0, 50).toLowerCase();
                const text = (item.titre || item.texte || item.description || '').substring(0, 50).toLowerCase();
                return text;
            };
            break;
        default:
            // Generic: use JSON string as key
            keyFn = item => JSON.stringify(item);
    }

    // Deduplicate: keep LAST occurrence (source wins for updates)
    const map = new Map();
    for (const item of combined) {
        const key = keyFn(item);
        if (key) map.set(key, item);
    }
    return Array.from(map.values());
}
```

### Points de modification

**Remplacer l'appel à `mergeReportData` (ligne ~16105)**
```javascript
// AVANT:
mergeReportData(lastReportData, extractedData);

// APRÈS:
lastReportData = unifiedMerge(lastReportData, extractedData);
```

**Remplacer l'appel à `smartMergeExtraction` (ligne ~15771)**
```javascript
// AVANT:
smartMergeExtraction(lastReportData, extractedData);

// APRÈS:
lastReportData = unifiedMerge(lastReportData, extractedData);
```

**Note** : Les anciennes fonctions `mergeReportData()` et `smartMergeExtraction()` peuvent être supprimées ou commentées.

---

## FIX-3 : Protéger `buildPartialReport()` — HAUTE PRIORITÉ

**Résout** : BUG-006 (1 bug)
**Principe** : Ne jamais remplacer `lastReportData` entièrement depuis le text parser.

### Modifier `buildPartialReport()` (ligne ~13252)

```javascript
// AVANT (Line 13252):
lastReportData = partialData;

// APRÈS:
if (!lastReportData || Object.keys(lastReportData).length <= 4) {
    // Only use partial data if lastReportData is empty/minimal (brand, brand_key, status, date)
    lastReportData = partialData;
} else {
    // Merge partial data INTO existing data (don't replace)
    lastReportData = unifiedMerge(lastReportData, partialData);
}
```

---

## FIX-4 : Debounce Supabase writes — PRIORITÉ MOYENNE

**Résout** : BUG-013 (1 bug)
**Principe** : Centraliser tous les writes Supabase dans UNE fonction debounced.

### Code à ajouter (NOUVEAU)

```javascript
/**
 * Debounced save to Supabase — prevents race conditions between parallel writes
 */
let _saveTimeout = null;
let _pendingSaveData = null;

function debouncedSaveExtractedData(data, progressOverride) {
    _pendingSaveData = { data, progressOverride };

    if (_saveTimeout) clearTimeout(_saveTimeout);

    _saveTimeout = setTimeout(async () => {
        const { data: saveData, progressOverride: prog } = _pendingSaveData;
        _pendingSaveData = null;

        if (!currentProjectId || !saveData) return;

        try {
            const updatePayload = {
                extracted_data: saveData,
                updated_at: new Date().toISOString()
            };

            if (prog != null) {
                updatePayload.progress = Math.round(prog);
                // Update completion_status based on progress
                if (prog >= 90) {
                    updatePayload.completion_status = 'completed';
                    updatePayload.completed_at = new Date().toISOString();
                }
            }

            const { error } = await db.from('projects')
                .update(updatePayload)
                .eq('id', currentProjectId);

            if (error) console.error('[debouncedSave] Error:', error);
        } catch (err) {
            console.error('[debouncedSave] Exception:', err);
        }
    }, 800); // 800ms debounce — enough for both parallel flows to finish
}
```

### Points de modification — Remplacer les 5 writes directs

Les 5 lignes identifiées dans l'audit (14734, 14968, 15080, 15787, 16113) doivent être remplacées par `debouncedSaveExtractedData(lastReportData, progress)`.

**Exemple pour ligne ~15787 (handleExtractionResult)**:
```javascript
// AVANT:
await db.from('projects').update({
    extracted_data: lastReportData,
    completion_percentage: completionPercentage
}).eq('id', currentProjectId);

// APRÈS:
debouncedSaveExtractedData(lastReportData, completionPercentage);
```

**Exemple pour ligne ~16113 (sendMsg REPORT_DATA parse)**:
```javascript
// AVANT:
await db.from('projects').update({
    extracted_data: lastReportData
}).eq('id', currentProjectId);

// APRÈS:
const progress = calculateReportCompletion(lastReportData);
debouncedSaveExtractedData(lastReportData, progress);
```

---

## FIX-5 : Supabase Realtime (OPTIONNEL — à faire plus tard)

**Résout** : BUG-011
**Pré-requis** : Activer Realtime sur la table `projects` dans Supabase Dashboard

### SQL à exécuter dans Supabase

```sql
-- Activer Realtime sur la table projects
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
```

### Code frontend à ajouter (dans la fonction de chargement projet)

```javascript
// Subscribe to realtime changes for this project
function subscribeToProjectUpdates(projectId) {
    if (window._projectSubscription) {
        window._projectSubscription.unsubscribe();
    }

    window._projectSubscription = db
        .channel(`project-${projectId}`)
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'projects',
            filter: `id=eq.${projectId}`
        }, (payload) => {
            const newData = payload.new.extracted_data;
            if (newData && JSON.stringify(newData) !== JSON.stringify(lastReportData)) {
                lastReportData = normalizeReportData(newData);
                updateDrawerPreview(lastReportData);
                console.log('[Realtime] Project data updated from server');
            }
        })
        .subscribe();
}
```

**Note** : Ce fix est optionnel car actuellement l'extraction passe par le frontend (triggerExtraction → handleExtractionResult). Le Realtime ne serait utile que si on décide de faire sauvegarder l'extraction directement en DB depuis N8N.

---

## BACKEND N8N — AUCUN CHANGEMENT NÉCESSAIRE

L'audit backend confirme :

1. **Save Assistant Context1** écrit dans `extracted_data.assistant` (sous-objet isolé) — ✅ PAS de conflit
2. **Validate & Save1 v2.5** a déjà la dédup smart (normalizeEquipmentId, normalizeModelName, equipmentKey, adressageKey) — ✅ OK
3. **Format Response4** wrappe automatiquement le JSON dans `[REPORT_DATA]` — ✅ OK
4. **Update Supabase Projects1** fait un PATCH propre — ✅ OK

**Le problème est 100% frontend** — les formats sont corrects côté N8N, c'est le frontend qui ne normalise pas entre les deux sources.

---

## SUPABASE — UNE SEULE ACTION

```sql
-- OPTIONNEL : Activer Realtime pour le push en temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
```

Pas d'autres changements nécessaires côté DB.

---

## ORDRE D'IMPLÉMENTATION

| Étape | Fix | Fichier | Complexité | Impact |
|-------|-----|---------|------------|--------|
| 1 | **FIX-1** : `normalizeReportData()` | index.html | 🟢 Ajout de fonction + 4 lignes modifiées | **7 bugs résolus** |
| 2 | **FIX-2** : `unifiedMerge()` + `deduplicateArray()` | index.html | 🟡 Remplacement de 2 fonctions + 2 appels | **3 bugs résolus** |
| 3 | **FIX-3** : Protéger `buildPartialReport()` | index.html | 🟢 1 ligne modifiée | **1 bug résolu** |
| 4 | **FIX-4** : `debouncedSaveExtractedData()` | index.html | 🟡 Ajout de fonction + 5 remplacements | **1 bug résolu** |
| 5 | **FIX-5** : Supabase Realtime | Supabase + index.html | 🔴 Optionnel | **1 bug résolu** |

**Total : 13/13 bugs résolus avec les 5 fixes.**

---

## INSTRUCTIONS CLAUDE CODE

Pour implémenter ces fixes, donner les instructions suivantes à Claude Code :

```
Tu vas modifier le fichier technician/index.html sur la branche claude/dev-lab-7iGKi.

FIXES À APPLIQUER (dans cet ordre) :

FIX-1 : Ajouter la fonction normalizeReportData() AVANT la fonction mergeReportData() (~ligne 13250).
Le code exact est dans DEFINITIVE_FIX_PLAN.md section FIX-1.
Ensuite, appeler normalizeReportData() aux 4 points indiqués :
- Ligne ~16086 : après JSON.parse du REPORT_DATA
- Ligne ~15771 : avant smartMergeExtraction dans handleExtractionResult
- Ligne ~10485 : lors du chargement du projet depuis Supabase
- Ligne ~11315 : dans collectReportData avant le return

FIX-2 : Ajouter les fonctions unifiedMerge() et deduplicateArray() à côté de normalizeReportData().
Remplacer l'appel mergeReportData() ligne ~16105 par : lastReportData = unifiedMerge(lastReportData, extractedData);
Remplacer l'appel smartMergeExtraction() ligne ~15771 par : lastReportData = unifiedMerge(lastReportData, extractedData);

FIX-3 : Modifier buildPartialReport() ligne ~13252 :
Remplacer "lastReportData = partialData" par le code conditionnel dans DEFINITIVE_FIX_PLAN.md section FIX-3.

FIX-4 : Ajouter debouncedSaveExtractedData() et remplacer les 5 writes directs
(lignes ~14734, ~14968, ~15080, ~15787, ~16113) par des appels à debouncedSaveExtractedData().

NE PAS toucher au backend N8N.
NE PAS toucher à renderReportPreviewV12() ni generateWord() — ils fonctionneront correctement grâce à la normalisation.

Après les modifications, vérifier qu'il n'y a pas d'erreurs de syntaxe.
```

---

## TESTS À FAIRE APRÈS

### Test 1 : Chat seul (sans extraction)
1. Ouvrir un nouveau projet Mitsubishi
2. Décrire une intervention en chat
3. Vérifier que le drawer V12 montre : fluide, système, intervention type
4. Exporter en Word — vérifier fluide, travaux, réserves

### Test 2 : Extraction seule
1. Envoyer un message avec beaucoup d'infos techniques
2. Attendre le résultat extraction
3. Vérifier pas de doublons dans adressage et equipements
4. Vérifier le % de complétion est réaliste

### Test 3 : Refresh
1. Après les tests 1&2, faire un hard refresh (Ctrl+Shift+R)
2. Vérifier que toutes les données sont toujours là
3. Vérifier que le drawer se re-render correctement

### Test 4 : GAYA BEBE (test de régression)
1. Relancer le test GAYA BEBE avec les 12 UI (PLFY-P15VFM-E1)
2. Vérifier : adressage = 12 lignes max (UI1-UI12, pas UI01-UI12 en double)
3. Vérifier : equipements sans explosion (≤15 max)
4. Vérifier : fluide R410A visible dans drawer ET dans Word export

### Test 5 : BERTHIER (test de régression)
1. Relancer le test BERTHIER (PUHY-P500YNW-A2, 25 UI)
2. Mêmes vérifications que Test 4
3. Vérifier DRV détecté dans le type système
