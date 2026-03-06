# FixAIR - Complete Data Schema Documentation

## Source File
`/technician/index.html` (~21,500 lines)

## Report Data Structure

The report data is stored in `lastReportData` (global variable, line ~7445) and persisted in Supabase `projects.extracted_data` JSONB column.

### Complete Schema

```javascript
{
  // ═══ BASIC INFO ═══
  brand: string,              // Equipment brand (e.g., "DAIKIN")
  brand_key: string,          // Brand key for matching
  status: string,             // Report status
  date: string,               // Intervention date
  reference: string,          // Report reference number
  numero_rapport: string,     // Alias for reference
  resume: string,             // Executive summary text
  type_intervention: string,  // e.g., "DIAGNOSTIC", "MAINTENANCE"

  // ═══ INTERVENTION ═══
  intervention: {
    type: string,              // Short type code
    type_label: string,        // Human-readable type
    type_detail: string        // Extended description
  },

  // ═══ CLIENT ═══
  client: {
    nom: string,               // Client name
    societe: string,           // Company name
    contact: string,           // Contact person
    telephone: string,         // Phone number
    email: string,             // Email
    reference: string,         // Client reference
    adresse: string            // Client address
  },

  // ═══ SITE ═══
  site: {
    adresse: string,           // Site address
    ville: string,             // City
    numero_affaire: string,    // Business reference
    postal: string,            // Postal code
    country: string            // Country
  },

  // ═══ EQUIPMENT ═══
  equipements: [{
    id: string,                // Equipment ID
    marque: string,            // Brand
    modele: string,            // Model
    role: string,              // "ue" (outdoor), "ui" (indoor)
    type_ui: string,           // Indoor unit type
    numero_serie: string,      // Serial number
    puissance: string          // Power rating
  }],

  systeme: {
    type: string,              // System type
    modele: string,            // Model
    serie: string,             // Serial
    puissance: string,         // Power
    garantie: string           // Warranty status
  },

  // ═══ FLUID ═══
  fluide: {
    type: string,              // Refrigerant type (e.g., "R410A")
    charge_totale: string,     // Total charge
    charge_initiale: string,   // Initial charge
    charge_appoint: string,    // Top-up charge
    type_huile: string         // Oil type
  },

  fluide_global: {
    type: string,
    charge_totale_site_kg: string,
    charge_usine_kg: string,
    charge_appoint_kg: string
  },

  // ═══ ADDRESSING (Indoor Units) ═══
  adressage: [{
    adresse: string,           // Address code (e.g., "UI1")
    equipement_id: string,     // Equipment reference
    ref_usine: string,         // Factory reference
    modele: string,            // Model name
    zone: string,              // Zone/area
    designation: string,       // Alias for zone
    numero_serie: string       // Serial number
  }],

  // ═══ MEASUREMENTS ═══
  mesures: [{
    label: string,             // Measurement name (normalized)
    type: string,              // Alias for label
    valeur: string,            // Measured value
    valeur_texte: string,      // Text description
    unite: string,             // Unit (e.g., "°C", "bar")
    status: string,            // "conforme" or other
    sous_type: string,         // Sub-category
    equipement_id: string      // Related equipment
  }],

  // ═══ FAULT CODES ═══
  codes_defaut: [{
    code: string,              // Error code (e.g., "E7")
    description: string,       // Description
    resolution: boolean        // Whether resolved
  }],

  // ═══ WORK DONE ═══
  travaux_effectues: [{
    titre: string,             // Title
    texte: string,             // Description
    contenu: string,           // Alias for texte
    status: string             // "done" | "error" | "pending"
  }],

  // ═══ PLANNED WORK ═══
  travaux_prevoir: [{
    titre: string,
    texte: string,
    priorite: string           // Priority level
  }],

  // ═══ RESERVES ═══
  reserves: [{
    titre: string,
    description: string,
    texte: string,
    type: string
  }],

  // ═══ RECOMMENDATIONS ═══
  recommandations: [{
    titre: string,
    description: string,
    texte: string
  }],

  // ═══ RESULT ═══
  resultat: {
    status: string,            // "resolu" | "en_cours" | "non_resolu" | "en_attente"
    label: string,             // Display label
    description: string,       // Details
    conclusion: string         // Final conclusion
  },

  // ═══ TECHNICIAN ═══
  technicien: {
    nom: string,               // Name
    entreprise: string,        // Company
    adresse: string,           // Address
    email: string,
    heure_arrivee: string,     // Arrival time
    heure_depart: string,      // Departure time
    autres: string             // Other info
  },

  // ═══ SIGNATURES ═══
  signatures: {
    client: { image: string },
    technicien: { image: string },
    nom_client: string,
    nom_technicien: string
  },

  // ═══ PHOTOS ═══
  photos: [{
    url: string,               // Photo URL
    data: string,              // Base64 data
    caption: string,           // Caption text
    name: string               // File name
  }],

  // ═══ OPTIONAL SECTIONS ═══
  observation_client: string,

  dates: {
    debut_date: string,
    debut_heure: string,
    fin_date: string,
    fin_heure: string
  },

  securite: {
    etat: string,
    risques: string
  },

  tests: {
    pression_test_bar: string,
    duree_test_heures: string,
    valeur_vacuometre_mbar: string
  },

  tuyauteries: {
    longueur_totale_m: string,
    denivele_oc_ui_m: string,
    appoint_calcule_kg: string
  },

  electrique: {
    calibre_disjoncteur: string,
    section_cable: string
  },

  releves_ue: {
    pd1_bar: string,
    ps_bar: string,
    ta_celsius: string,
    freq_inv1_hz: string
  },

  pieces: [{
    reference: string,
    designation: string,
    quantite: number
  }],

  rapport_technicien: string,
  remarques: string
}
```

## Normalization

The `normalizeReportData()` function (line ~13289) performs bidirectional field sync:
- `fluide` ↔ `fluide_global` ↔ root-level fluid fields
- `systeme` ↔ `equipements` array
- `travaux_effectues.contenu` ↔ `travaux_effectues.texte`
- `adressage.equipement_id` ↔ `adressage.ref_usine` ↔ `adressage.adresse`
- `resultat.status` normalized to: resolu, en_cours, non_resolu, en_attente

## Merge Strategy (unifiedMerge, line ~13552)

- **REPLACE arrays**: `travaux_effectues`, `travaux_prevoir`, `recommandations`
- **Deduplicate arrays**: `equipements` (by model+role), `adressage` (by normalized address), `mesures` (by label+equipmentId), `codes_defaut` (by code), `reserves` (fuzzy match)
- **Primitives**: Last-write-wins (empty/null values skipped)
- **Objects**: Recursive merge
