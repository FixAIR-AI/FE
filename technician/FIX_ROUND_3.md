# FIX ROUND 3 — 6 bugs finaux

---

## BUG 1 : Réserves absentes (CRITIQUE)

**Cause** : FIX-B R2 fait que `reserves` est dans `REPLACE_ARRAYS`. Quand le chat retourne un `[REPORT_DATA]` sans réserves (array vide), le `unifiedMerge` REMPLACE les réserves de l'extraction par `[]`.

**Fix** : Dans `unifiedMerge()`, ne remplacer que si la source est NON VIDE.

```javascript
// CHERCHER dans unifiedMerge() :
} else if (REPLACE_ARRAYS.has(key) && sourceVal.length > 0) {

// REMPLACER PAR :
} else if (REPLACE_ARRAYS.has(key) && sourceVal.length > 0 && sourceVal.some(item => item != null)) {
    // Only replace if source actually has meaningful content
    result[key] = [...sourceVal];
```

C'est tout. Une seule condition ajoutée.

---

## BUG 2 : Double préfixe "Statut : Statut :"

**Cause** : `normalizeReportData()` section 9 nettoie `resultat.status` mais l'extraction écrit `resultat.status = "Statut : ✗ Non résolu"` APRÈS la normalisation (car l'extraction arrive en async et re-merge).

**Fix** : Déplacer le nettoyage dans `updateDrawerPreview()` et `collectReportData()` — les deux endroits finaux avant affichage.

```javascript
// CHERCHER updateDrawerPreview(), juste AVANT l'appel à renderReportPreviewV12() :
// AJOUTER :
if (data && data.resultat) {
    ['status', 'label', 'description', 'conclusion'].forEach(k => {
        if (data.resultat[k] && typeof data.resultat[k] === 'string') {
            data.resultat[k] = data.resultat[k].replace(/^(Statut|Status|Conclusion|Description)\s*:\s*/i, '').trim();
        }
    });
}

// MÊME CHOSE dans collectReportData(), AVANT le return.
```

---

## BUG 3 : Correction charge pas dans le Word (20.8 au lieu de 21.3)

**Cause** : Le chat corrige `fluide.charge_totale = "21.3"` → sauvegardé dans `lastReportData`. Mais l'extraction (qui a la conversation entière) re-calcule et écrit `fluide_global.charge_totale_site_kg = 20.8` (avant la correction). `normalizeReportData` ne fait la conversion `fluide_global → fluide` que si `!data.fluide.charge_totale`. Comme les deux existent, le Word lit l'ancien `fluide` (via `systemFluide` dans l'objet racine).

**Fix** : Dans `normalizeReportData()`, section FLUIDE, quand `fluide_global` et `fluide` coexistent, prendre la valeur la plus récente. Mais comme on n'a pas de timestamp, la règle est : **si `fluide` a une valeur, c'est la source de vérité** (vient du chat/correction). Forcer `fluide_global` à matcher.

```javascript
// DANS normalizeReportData(), section FLUIDE, AJOUTER en premier :

// Sync fluide → fluide_global (chat corrections win)
if (data.fluide && data.fluide_global) {
    if (data.fluide.type && data.fluide.type !== 'non_precise') {
        data.fluide_global.type = data.fluide.type;
    }
    if (data.fluide.charge_totale) {
        const num = parseFloat(String(data.fluide.charge_totale).replace(/[^\d.]/g, ''));
        if (!isNaN(num)) data.fluide_global.charge_totale_site_kg = num;
    }
    if (data.fluide.charge_initiale) {
        const num = parseFloat(String(data.fluide.charge_initiale).replace(/[^\d.]/g, ''));
        if (!isNaN(num)) data.fluide_global.charge_usine_kg = num;
    }
}
```

**Aussi** : Dans `generateWord()`, chercher où il lit `fluide.charge_totale` et vérifier qu'il n'ajoute pas "kg" (le nettoyage FIX-E est déjà appliqué).

---

## BUG 4 : Type intervention pas corrigé

**Cause** : Le chat corrige via `[REPORT_DATA]` avec `type_intervention: "Maintenance préventive avec dépannage"`, mais l'extraction re-écrit `intervention.type = "depannage"` (async, après). Le `normalizeReportData` copie `intervention.type → type_intervention` seulement si `!data.type_intervention`. Comme le chat l'a mis, la condition est fausse, mais l'extraction met `intervention.type_label` qui est affiché par le drawer V12.

**Fix** : Dans `normalizeReportData()`, section INTERVENTION, synchroniser bidirectionnellement avec priorité au champ le plus spécifique.

```javascript
// REMPLACER la section 5 (INTERVENTION) par :

if (data.intervention && data.type_intervention) {
    // Sync: type_intervention (chat) wins over intervention.type (extraction)
    data.intervention.type_label = data.type_intervention;
    data.intervention.type = data.type_intervention;
}
if (data.intervention && !data.type_intervention) {
    data.type_intervention = data.intervention.type_label || data.intervention.type;
}
if (data.type_intervention && !data.intervention) {
    data.intervention = { type: data.type_intervention, type_label: data.type_intervention };
}
```

---

## BUG 5 : Code 6607 manquant

**Cause** : Le 6607 est mentionné dans le message 4 (correction). Le chat `[REPORT_DATA]` l'ajoute dans `codes_defaut`, mais l'extraction peut re-écrire `codes_defaut` avec seulement le 1302 (vu en premier). `codes_defaut` n'est PAS dans `REPLACE_ARRAYS`, donc le dedup devrait marcher. Le problème est peut-être que le chat n'a jamais inclus 6607 dans son `[REPORT_DATA]`, et l'extraction ne l'a pas non plus.

**Fix** : C'est principalement un problème de **prompt backend** (l'extraction doit mieux capturer tous les codes mentionnés). Mais côté frontend, s'assurer que `codes_defaut` est bien dans le dedup et pas dans REPLACE_ARRAYS :

```javascript
// VÉRIFIER que 'codes_defaut' n'est PAS dans REPLACE_ARRAYS
// (il ne devrait pas y être, il doit utiliser le dedup par code)
```

**Fix backend (prompt N8N)** : Ajouter dans le prompt d'extraction :
```
Inclure TOUS les codes défaut mentionnés dans la conversation, même ceux découverts tardivement.
```

---

## BUG 6 : Horaires pas capturées

**Cause** : Le tech dit "intervention de 8h30 à 16h45" dans le dernier message. Le chat `[REPORT_DATA]` inclut `technicien.heure_arrivee` et `technicien.heure_depart`, mais le drawer affiche "HH:MM" (valeur par défaut du template).

**Fix** : Vérifier dans `normalizeReportData()` que les horaires sont bien mappés. Ajouter :

```javascript
// DANS normalizeReportData(), AJOUTER section 10 :

// ═══════════════════════════════════════════════
// 10. TECHNICIEN : horaires et heures formatées
// ═══════════════════════════════════════════════
if (data.technicien) {
    // Normalize heure fields
    const t = data.technicien;
    if (t.heure_depart && !t.heure_arrivee) {}
    if (t.heure_arrivee && !t.heure_depart) {}
    // Clean placeholder values
    ['heure_arrivee', 'heure_depart'].forEach(k => {
        if (t[k] === 'HH:MM' || t[k] === 'hh:mm' || t[k] === '') {
            delete t[k]; // Remove placeholder so drawer shows nothing instead of "HH:MM"
        }
    });
}
```

**Note** : Le vrai problème est probablement que l'extraction ou le chat ne parse pas "8h30" → `heure_arrivee: "08:30"`. C'est un fix **backend prompt**.

---

## INSTRUCTIONS CLAUDE CODE — ROUND 3

```
Modifier technician/index.html. 6 fixes précis :

1. unifiedMerge() : dans la condition REPLACE_ARRAYS,
   ajouter "&& sourceVal.some(item => item != null)"
   pour ne pas remplacer par un array vide.

2. updateDrawerPreview() et collectReportData() :
   ajouter nettoyage double préfixe sur resultat.status/label/description/conclusion
   JUSTE AVANT l'appel renderReportPreviewV12() et AVANT le return.

3. normalizeReportData() section FLUIDE :
   ajouter sync fluide → fluide_global en PREMIER (corrections chat gagnent).

4. normalizeReportData() section INTERVENTION :
   remplacer par sync bidirectionnel avec priorité type_intervention.

5. Vérifier que 'codes_defaut' n'est PAS dans REPLACE_ARRAYS.

6. normalizeReportData() : ajouter section 10 pour nettoyer
   les placeholders HH:MM dans technicien.heure_arrivee/depart.
```

---

## RÉSUMÉ

| Fix | Bug | Lignes à modifier | Impact |
|-----|-----|-------------------|--------|
| 1 | Réserves absentes | 1 condition dans unifiedMerge | ✅ Réserves visibles |
| 2 | Double préfixe | 2 blocs (drawer + export) | ✅ "Non résolu" propre |
| 3 | Charge Word | 5 lignes dans normalizeReportData | ✅ Correction propagée |
| 4 | Type intervention | 8 lignes dans normalizeReportData | ✅ "Maintenance" propagé |
| 5 | Code 6607 | 0 lignes (vérification) | ⚠️ Backend principalement |
| 6 | Horaires | 6 lignes dans normalizeReportData | ✅ Placeholders nettoyés |

**Après Round 3 projeté : 8.5/10**
