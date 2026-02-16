# R4-FIX5: Résultat "À définir" → statut réel

**Fichier:** `index.html` branche `claude/audit-technician-app-cSs5D`

**Bug:** Le statut résultat affiche "À définir" malgré le user ayant dit "résultat: problème résolu... le code 6607 persiste".

**Fix:** Dans `normalizeReportData()`, remplacer/compléter la section RESULTAT:

```javascript
// ====== SECTION 9bis: RESULTAT STATUS SYNC ======
const resultatFields = [
  data.resultat, data.resultat_intervention,
  data.intervention && data.intervention.resultat,
  data.statut_intervention, data.statut
];
let bestResultat = null;
resultatFields.forEach(val => {
  if (val && typeof val === 'string' && val.trim().length > 0
      && !val.trim().toLowerCase().includes('définir')
      && !val.trim().toLowerCase().includes('definir')) {
    bestResultat = val;
  }
});
if (bestResultat) {
  data.resultat = bestResultat;
  data.resultat_intervention = bestResultat;
  if (!data.intervention) data.intervention = {};
  data.intervention.resultat = bestResultat;
  data.statut_intervention = bestResultat;
}
// Fallback: extraire depuis la conclusion
if (!bestResultat && data.conclusion) {
  const c = data.conclusion.toLowerCase();
  if (c.includes('partiellement') || c.includes('persiste')) data.resultat = 'Partiellement résolu';
  else if (c.includes('résolu') && !c.includes('non résolu')) data.resultat = 'Résolu';
  else if (c.includes('non résolu')) data.resultat = 'Non résolu';
  if (data.resultat) {
    data.resultat_intervention = data.resultat;
    if (!data.intervention) data.intervention = {};
    data.intervention.resultat = data.resultat;
    data.statut_intervention = data.resultat;
  }
}
```

**Test:** Statut = "Partiellement résolu" (car code 6607 persiste).
