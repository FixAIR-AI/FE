# PATCH C: Corriger normalizeMesureLabel + alias map + reserves dedup

Fichier: `technician/index.html`

---

## C1: normalizeMesureLabel — ajouter conversion underscore→espace (ligne 13318)

### Diagnostic
N8N envoie des labels comme `pression_hp`, `temperature_soufflage`. Sans conversion underscore→espace, ces labels ne matchent PAS les clés du MESURE_ALIAS_MAP qui utilisent des espaces.

### Chercher:
```javascript
        function normalizeMesureLabel(label) {
            if (!label) return '';
            const lower = label.toLowerCase().trim()
                .replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/[ùû]/g, 'u').replace(/[ôö]/g, 'o').replace(/[ïî]/g, 'i')
                .replace(/\s+/g, ' ');
            return MESURE_ALIAS_MAP[lower] || lower;
        }
```

### Remplacer par:
```javascript
        function normalizeMesureLabel(label) {
            if (!label) return '';
            const lower = label.toLowerCase().trim()
                .replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').replace(/[ùû]/g, 'u').replace(/[ôö]/g, 'o').replace(/[ïî]/g, 'i').replace(/[ç]/g, 'c')
                .replace(/[_]/g, ' ')
                .replace(/\s+/g, ' ');
            return MESURE_ALIAS_MAP[lower] || lower;
        }
```

---

## C2: MESURE_ALIAS_MAP — ajouter aliases manquants (ligne 13301)

### Diagnostic
Après dé-accentuation, `'température soufflage'` → `'temperature soufflage'` qui ne matche PAS la clé acccentuée du map. Aussi, `'surchauffe compresseur'` et `'frequence compresseur'` manquent.

### Chercher:
```javascript
            'surchauffe': 'surchauffe', 'sh': 'surchauffe', 'superheat': 'surchauffe',
```

### Remplacer par:
```javascript
            'surchauffe': 'surchauffe', 'sh': 'surchauffe', 'superheat': 'surchauffe', 'surchauffe compresseur': 'surchauffe',
```

### ET chercher:
```javascript
            'température soufflage': 'temp_soufflage', 'temp soufflage': 'temp_soufflage', 'soufflage': 'temp_soufflage',
```

### Remplacer par:
```javascript
            'température soufflage': 'temp_soufflage', 'temp soufflage': 'temp_soufflage', 'temperature soufflage': 'temp_soufflage', 'soufflage': 'temp_soufflage',
```

### ET chercher:
```javascript
            'température reprise': 'temp_reprise', 'temp reprise': 'temp_reprise', 'reprise': 'temp_reprise',
```

### Remplacer par:
```javascript
            'température reprise': 'temp_reprise', 'temp reprise': 'temp_reprise', 'temperature reprise': 'temp_reprise', 'reprise': 'temp_reprise',
```

### ET chercher:
```javascript
            'température extérieure': 'temp_ext', 'temp ext': 'temp_ext', 'temp extérieure': 'temp_ext', 'temp. ext.': 'temp_ext',
```

### Remplacer par:
```javascript
            'température extérieure': 'temp_ext', 'temp ext': 'temp_ext', 'temp extérieure': 'temp_ext', 'temp. ext.': 'temp_ext', 'temperature exterieure': 'temp_ext',
```

### ET chercher:
```javascript
            'température ambiante': 'temp_ambiante', 'temp ambiante': 'temp_ambiante', 'ambiance': 'temp_ambiante'
```

### Remplacer par:
```javascript
            'température ambiante': 'temp_ambiante', 'temp ambiante': 'temp_ambiante', 'temperature ambiante': 'temp_ambiante', 'ambiance': 'temp_ambiante', 'frequence compresseur': 'frequence_compresseur', 'frequency compresseur': 'frequence_compresseur', 'freq compresseur': 'frequence_compresseur'
```

---

## C3: Reserves dedup — meilleure normalisation (ligne 13670)

### Diagnostic
Les réserves paraphrasées ne sont pas dédupliquées car la clé garde les articles français ("de la" vs ""). Exemple: "Calorifuge de la ligne liquide dégradé" ≠ "Calorifuge ligne liquide dégradé" → clés différentes → doublon.

### Chercher:
```javascript
                case 'reserves':
                    // R4-FIX4: Smart dedup for reserves — normalize text, strip punctuation
                    keyFn = item => {
                        if (typeof item === 'string') return item.substring(0, 80).toLowerCase().replace(/[.,;:!?\s]+/g, ' ').trim();
                        const text = (item.texte || item.description || item.titre || '').substring(0, 80).toLowerCase().replace(/[.,;:!?\s]+/g, ' ').trim();
                        const type = (item.type || item.categorie || '').toLowerCase();
                        return type ? `${type}|${text}` : text;
                    };
                    break;
```

### Remplacer par:
```javascript
                case 'reserves':
                    // R5: Smart dedup — strip accents + French articles for fuzzy match
                    keyFn = item => {
                        const raw = typeof item === 'string' ? item : (item.texte || item.description || item.titre || '');
                        return raw.toLowerCase()
                            .replace(/[éèê]/g,'e').replace(/[àâ]/g,'a').replace(/[ùû]/g,'u').replace(/[ôö]/g,'o').replace(/[ïî]/g,'i').replace(/[ç]/g,'c')
                            .replace(/\b(de|du|des|la|le|les|l'|d'|un|une|et|ou|sur|en|dans|pour|par|avec)\b/g,'')
                            .replace(/[^a-z0-9]/g,'')
                            .substring(0, 60);
                    };
                    break;
```
