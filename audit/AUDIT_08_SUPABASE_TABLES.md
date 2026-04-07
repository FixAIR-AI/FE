# AUDIT_08 - Supabase Tables

## Database Tables Referenced in Frontend Code

Based on comprehensive grep analysis of all `.from('table_name')` calls across the entire codebase.

### Tables Overview

| # | Table | Total References | Apps Using It |
|---|-------|-----------------|---------------|
| 1 | users | 66 | ALL apps |
| 2 | projects | 55 | technician, index, docs, admin, manager, operations |
| 3 | chats | 24 | technician, index, docs |
| 4 | messages | 15 | technician, index, docs, master |
| 5 | calendar_events | 14 | technician, index, docs, admin, manager |
| 6 | availability_shares | 10 | admin, manager, operations |
| 7 | user_actions | 6 | technician, index, docs |
| 8 | reports | 6 | technician, index, docs |
| 9 | team_messages | 5 | admin, manager, operations |
| 10 | invitations | 4 | admin, manager, invite |
| 11 | referrals | 3 | r/ (referral page) |
| 12 | app_settings | 3 | technician, index, docs |

**Total: 12 tables** referenced from frontend code.

---

## Table: `users`

### Purpose
Core user table storing all FixAIR users (technicians, managers, admins).

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key, matches auth.users |
| email | text | Login, user identification |
| first_name | text | Display name |
| last_name | text | Display name |
| status | text | User status (pending, approved, etc.) |
| role | text | 'technician', 'manager', 'admin', 'master' |
| company_id | uuid | FK to companies |
| brand_key | text | HVAC brand association |
| brand_name | text | Brand display name |
| subscription_status | text | Freemium/paid status |
| referral_code | text | Unique referral code |
| referred_by | uuid/text | Who referred this user |
| created_at | timestamp | Account creation |
| avatar_url | text | Profile photo URL |
| phone | text | Phone number |
| last_sign_in | timestamp | Last login tracking |

### Operations by App
| App | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| technician | x | | x | |
| index | x | x | x | |
| docs | x | | x | |
| auth | x | x | x | |
| admin | x | | x | |
| manager | x | | x | |
| operations | x | | x | |
| master | x | | x | |
| debug | x | | | |
| invite | x | | x | |
| r/ | x | | x | |

---

## Table: `projects`

### Purpose
Stores intervention reports/projects created by technicians.

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key |
| user_id | uuid | FK to users, report owner |
| company_id | uuid | FK to companies |
| title | text | Project title |
| status | text | 'en_cours', 'terminé', etc. |
| extracted_data | jsonb | Full report data (the main payload) |
| photos | jsonb | Array of photo objects |
| brand_key | text | HVAC brand |
| brand_name | text | Brand display name |
| reference | text | Report reference number (FX-YYYY-XXXXX) |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last modification |
| archived | boolean | Soft delete flag |

### Operations by App
| App | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| technician | x | x | x | x |
| index | x | x | x | x |
| docs | x | x | x | x |
| admin | x | | | |
| manager | x | | | |
| operations | x | | | |

### Key `extracted_data` JSON Structure
```json
{
  "client": { "societe", "contact", "telephone" },
  "site": { "adresse", "ville", "numero_affaire" },
  "systeme": { "type", "modele", "serie", "puissance" },
  "fluide": { "type", "charge_totale" },
  "codes_defaut": [{ "code", "description" }],
  "adressage": [{ "ref_usine", "serie", "adresse", "designation", "commentaire" }],
  "travaux_effectues": [{ "texte" }],
  "mesures": [{ "label", "valeur", "unite" }],
  "technicien": { "nom", "heure_arrivee", "heure_depart" },
  "resultat": { "status", "description" },
  "reserves": [{ "texte" }],
  "type_intervention": "string",
  "date_intervention": "string"
}
```

---

## Table: `chats`

### Purpose
Chat sessions associated with projects. Each project can have multiple chat panels (assistant, copilot).

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key |
| project_id | uuid | FK to projects |
| user_id | uuid | FK to users |
| panel | text | 'assistant' or 'copilot' |
| title | text | Chat title |
| created_at | timestamp | Creation time |

### Operations
| App | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| technician | x | x | | x |
| index | x | x | | x |
| docs | x | x | | x |

---

## Table: `messages`

### Purpose
Individual chat messages within chat sessions.

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key |
| chat_id | uuid | FK to chats |
| role | text | 'user', 'assistant', 'system' |
| content | text | Message text |
| created_at | timestamp | Message time |

### Operations
| App | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| technician | x | x | | x |
| index | x | x | | x |
| docs | x | x | | x |
| master | x | | | |

---

## Table: `calendar_events`

### Purpose
Calendar events for technician scheduling/availability.

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| title | text | Event title |
| start_time | timestamp | Event start |
| end_time | timestamp | Event end |
| type | text | Event type |
| created_at | timestamp | Creation time |

### Operations
| App | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| technician | x | x | x | x |
| index | x | x | x | x |
| docs | x | x | x | x |
| admin | x | | | |
| manager | x | | | |

---

## Table: `availability_shares`

### Purpose
Shared availability data between technicians and their managers/admins.

### Operations
| App | SELECT | INSERT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| admin | x | x | x | |
| manager | x | x | x | |
| operations | x | | | |

---

## Table: `user_actions`

### Purpose
Tracks user actions/analytics (e.g., button clicks, feature usage).

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| action | text | Action type |
| metadata | jsonb | Additional data |
| created_at | timestamp | Action time |

### Operations
| App | SELECT | INSERT |
|-----|--------|--------|
| technician | x | x |
| index | x | x |
| docs | x | x |

---

## Table: `reports`

### Purpose
Generated reports (PDF/Word exports) linked to projects.

### Operations
| App | SELECT | INSERT | UPDATE |
|-----|--------|--------|--------|
| technician | x | x | x |
| index | x | | |
| docs | x | | |

---

## Table: `team_messages`

### Purpose
Internal team messaging system for companies.

### Operations
| App | SELECT | INSERT |
|-----|--------|--------|
| admin | x | x |
| manager | x | x |
| operations | x | |

---

## Table: `invitations`

### Purpose
Team invitation tokens for onboarding new users.

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key |
| token | text | Unique invitation token |
| email | text | Invited email |
| company_id | uuid | FK to companies |
| role | text | Assigned role |
| status | text | pending, accepted, etc. |
| created_at | timestamp | Creation time |

### Operations
| App | SELECT | INSERT |
|-----|--------|--------|
| admin | x | x |
| manager | x | x |
| invite | x | x |

---

## Table: `referrals`

### Purpose
Referral tracking for viral growth / referral program.

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| id | uuid | Primary key |
| referrer_id | uuid | Who made the referral |
| referred_id | uuid | Who was referred |
| referral_code | text | The code used |
| status | text | pending, converted, etc. |
| link_clicks | integer | Number of link clicks |
| created_at | timestamp | Creation time |

### Operations
| App | SELECT | INSERT | UPDATE |
|-----|--------|--------|--------|
| r/ | x | x | x |

---

## Table: `app_settings`

### Purpose
Application-wide settings (API keys, feature flags).

### Known Columns (from code analysis)
| Column | Type (inferred) | Evidence |
|--------|----------------|----------|
| key | text | Setting name (e.g., 'elevenlabs_api_key') |
| value | text | Setting value |

### Operations
| App | SELECT |
|-----|--------|
| technician | x |
| index | x |
| docs | x |

**Note:** This table stores sensitive API keys (e.g., ElevenLabs). Access should be restricted via RLS.

---

## Additional Tables (Referenced in master/index.html via REST API)

The master app uses direct REST API calls (`/rest/v1/${table}`) which means it can access ANY table. Specific additional tables referenced:

| Table | Evidence |
|-------|----------|
| sent_emails | master/index.html:3517 |
| email_link_clicks | master/index.html:3613 |

---

## Supabase RPC Functions

Only ONE RPC function call found in the frontend:

| Function | Used In | Purpose |
|----------|---------|---------|
| `increment_link_clicks` | r/index.html:648 | Atomic increment of referral link click counter |

---

## Supabase Realtime Subscriptions

| Channel | Table(s) | Used In | Events |
|---------|----------|---------|--------|
| team-status | users | admin, manager | UPDATE |
| project-updates | projects | admin, manager | INSERT, UPDATE |
| team-messages | team_messages | admin, manager | INSERT |
| availability-shares | availability_shares | admin, manager | INSERT, UPDATE, DELETE |

**Note:** Operations app declares `realtimeSubscriptions` array but no active subscriptions were found being set up. [POTENTIAL DEAD CODE]
