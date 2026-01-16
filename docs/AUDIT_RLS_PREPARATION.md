# AUDIT RLS - PREPARATION
## Document de preparation pour l'implementation Row Level Security

**Date:** 2026-01-16
**Status:** AUDIT SEULEMENT - AUCUNE MODIFICATION

---

## PARTIE 1: CARTOGRAPHIE DES ROLES ET PERMISSIONS

### 1.1 ROLES UTILISATEURS

#### ADMIN / OWNER (Super Admin)
- **Creation:** Via signup entreprise sur /auth (role='manager' mais devrait etre 'admin')
- **Donnees accessibles:**
  - Tous les users de SA company
  - Tous les projets de SA company
  - Invitations envoyees
  - Partages de disponibilite
  - Messages d'equipe
- **Actions:**
  - Approuver/rejeter les demandes d'acces
  - Inviter managers et technicians
  - Voir dashboard equipe
  - Gerer la company

#### MANAGER
- **Creation:** Invite par un Admin
- **Donnees accessibles:**
  - Son profil
  - Technicians ou `manager_id = son_id` (INTERNES)
  - Partages de dispo avec lui
  - Projets de son equipe
  - Messages avec son equipe
- **Actions:**
  - Inviter des technicians
  - Voir projets de son equipe
  - Communiquer avec son equipe
  - Accepter/rejeter partages de dispo

#### TECHNICIAN (Independant - standalone)
- **Creation:** Signup sur /auth, choix "Technicien independant"
- **Donnees accessibles:**
  - Son profil uniquement
  - Ses projets uniquement
  - Ses chats uniquement
  - Ses messages uniquement
  - Ses rapports uniquement
- **Actions:**
  - CRUD sur ses propres projets
  - Utiliser le chatbot Copilot
  - Generer des rapports
  - Modifier son profil
- **Caracteristiques:**
  - `member_type = 'standalone'`
  - `manager_id = NULL`
  - `company_id = NULL`

#### TECHNICIAN (Entreprise - internal)
- **Creation:** Invite par Admin/Manager via /invite
- **Donnees accessibles:**
  - Son profil
  - Ses projets
  - Messages avec son manager
- **Actions:**
  - CRUD sur ses projets
  - Communiquer avec son manager
  - Partager sa disponibilite
- **Caracteristiques:**
  - `member_type = 'internal'`
  - `manager_id = ID du manager qui a invite`
  - `status = 'active'` (auto-approuve)

---

## PARTIE 2: INVENTAIRE DES REQUETES SUPABASE PAR FICHIER

### 2.1 technician/index.html

| Ligne | Table | Operation | Filtre | Contexte |
|-------|-------|-----------|--------|----------|
| 6027 | app_settings | SELECT | - | Charger config app |
| 6051 | users | SELECT | eq('id', authId) | Charger profil |
| 6099 | users | UPDATE | eq('id', user.id) | Sync metadata |
| 6567 | users | SELECT | eq('email', email) | Verifier email existe |
| 6909 | users | UPDATE | eq('id', userId) | Sauvegarder profil |
| 6929 | users | UPSERT | - | Creer profil si inexistant |
| 7096 | users | UPDATE | eq('id', userId) | Marquer onboarding done |
| 7294 | projects | SELECT | eq('id', projectId) | Charger brand projet |
| 7309 | projects | UPDATE | eq('id', projectId) | Mettre a jour projet |
| 7510 | chats | SELECT | eq('project_id', id) | Charger chats du projet |
| 7521 | messages | SELECT | eq('chat_id', id) | Charger messages |
| 7587 | chats | INSERT | user_id, project_id | Creer nouveau chat |
| 7889 | projects | INSERT | user_id | Creer nouveau projet |
| 7911 | chats | INSERT | user_id, project_id | Creer chat pour projet |
| 7935 | messages | INSERT | chat_id | Ajouter message |
| 7964 | messages | SELECT | eq('chat_id', id) | Charger historique |
| 7984 | projects | UPDATE | eq('id', id) | Maj titre projet |
| 8033 | projects | SELECT | eq('user_id', id) | Charger mes projets |
| 8255 | projects | UPDATE | eq('id', id) | Renommer projet |
| 8284 | chats | SELECT | eq('project_id', id) | Charger chats a supprimer |
| 8288 | messages | DELETE | eq('chat_id', id) | Supprimer messages |
| 8292 | chats | DELETE | eq('project_id', id) | Supprimer chats |
| 8296 | projects | DELETE | eq('id', id) | Supprimer projet |
| 8363 | chats | SELECT | eq('id', chatId) | Verifier type chat |
| 8396 | projects | SELECT | eq('user_id', id) | Charger tous projets |
| 8409 | projects | SELECT | eq('id', id) | Charger photos |
| 8453 | projects | UPDATE | eq('id', id) | Sauvegarder photos |
| 8473 | chats | SELECT | eq('user_id', id) | Charger tous chats |
| 8484 | messages | SELECT | eq('chat_id', id) | Charger messages chat |
| 11546 | calendar_events | INSERT | user_id | Creer evenement |
| 11562 | calendar_events | UPDATE | eq('id', id) | Completer evenement |
| 13153 | projects | UPDATE | eq('id', id) | Maj photos |
| 13595 | user_actions | INSERT | user_id | Logger action |

### 2.2 manager/index.html

| Ligne | Table | Operation | Filtre | Contexte |
|-------|-------|-----------|--------|----------|
| 1178 | users | SELECT | eq('email', email) | Verifier si existe |
| 1300 | users | SELECT | eq('id', authId) | Charger profil |
| 1680 | users | SELECT | eq('id', authId) | Init auth |
| 1722 | users | SELECT | eq('manager_id', myId) | **Charger INTERNES** |
| 1734 | projects | SELECT | eq('user_id', techId) | Projets d'un tech |
| 1755 | team_messages | SELECT | or(sender/receiver) | Messages equipe |
| 1789 | availability_shares | SELECT | eq('manager_id', myId) | Partages dispo |
| 1849 | projects | SELECT | eq('user_id', techId) | Projets tech |
| 1917 | availability_shares | SELECT | eq('manager_id', myId) | Partages dispo |
| 1959 | availability_shares | UPDATE | eq('id', shareId) | Accepter partage |
| 1973 | calendar_events | INSERT | - | Creer event depuis dispo |
| 2006 | availability_shares | UPDATE | eq('id', id) | Rejeter partage |
| 2131 | team_messages | INSERT | sender_id, receiver_id | Envoyer message |
| 2157 | invitations | INSERT | inviter_id | Creer invitation |

### 2.3 admin/index.html

| Ligne | Table | Operation | Filtre | Contexte |
|-------|-------|-----------|--------|----------|
| 1132 | users | SELECT | eq('email', email) | Verifier si existe |
| 1257 | users | SELECT | eq('id', authId) | Charger profil |
| 1681 | users | SELECT | eq('id', authId) | Init auth |
| 1723 | users | SELECT | eq('manager_id', myId) | Charger INTERNES |
| 1735 | projects | SELECT | eq('user_id', techId) | Projets d'un tech |
| 1756 | team_messages | SELECT | or(sender/receiver) | Messages equipe |
| 1790 | availability_shares | SELECT | eq('manager_id', myId) | Partages dispo |
| 1850 | projects | SELECT | eq('user_id', techId) | Projets tech |
| 1918 | availability_shares | SELECT | eq('manager_id', myId) | Partages dispo |
| 1960 | availability_shares | UPDATE | eq('id', shareId) | Accepter partage |
| 1974 | calendar_events | INSERT | - | Creer event depuis dispo |
| 2007 | availability_shares | UPDATE | eq('id', id) | Rejeter partage |
| 2132 | team_messages | INSERT | sender_id, receiver_id | Envoyer message |
| 2158 | invitations | INSERT | inviter_id | Creer invitation |

### 2.4 auth/index.html

| Ligne | Table | Operation | Filtre | Contexte |
|-------|-------|-----------|--------|----------|
| 687 | users | SELECT | eq('email', email) | Verifier si existe |
| 765 | users | SELECT | eq('email', email) | Login check |
| 819 | users | SELECT | eq('email', email) | Get profile |
| 869 | users | UPSERT | onConflict: 'email' | **Save lead (ANON!)** |
| 894 | users | UPDATE | eq('email', email) | **Save type (ANON!)** |
| 989 | users | UPSERT | onConflict: 'email' | Create tech profile |
| 1077 | users | UPSERT | onConflict: 'email' | Create enterprise profile |
| 1128 | users | SELECT | eq('id', userId) | Check status |
| 1187 | users | SELECT | eq('id', userId) | Check approval |
| 1249 | users | SELECT | eq('id', userId) | Redirect check |

### 2.5 invite/index.html

| Ligne | Table | Operation | Filtre | Contexte |
|-------|-------|-----------|--------|----------|
| 412 | invitations | SELECT | eq('token', token) | Charger invitation |
| 442 | users | SELECT | eq('id', inviter_id) | Info inviteur |
| 525 | users | UPSERT | onConflict: 'email' | Creer profil invite |
| 546 | invitations | UPDATE | eq('id', id) | Marquer acceptee |

---

## PARTIE 3: MATRICE D'ACCES PAR TABLE

### 3.1 Table: users

| Role | SELECT | INSERT | UPDATE | DELETE | Filtre RLS |
|------|--------|--------|--------|--------|------------|
| Anonymous (signup) | own email | UPSERT (lead) | own email | - | email = input |
| Technician | own | - | own | - | id = auth.uid() |
| Manager | own + team | - | own | - | id = auth.uid() OR manager_id = auth.uid() |
| Admin | own + company | invite | own + approve | - | company logic |

**ATTENTION:** Le signup fait des UPSERT SANS auth! Necessite policy speciale.

### 3.2 Table: projects

| Role | SELECT | INSERT | UPDATE | DELETE | Filtre RLS |
|------|--------|--------|--------|--------|------------|
| Technician | own | own | own | own | user_id = auth.uid() |
| Manager | team | - | - | - | user_id IN (team members) |
| Admin | company | - | - | - | user_id IN (company users) |

### 3.3 Table: chats

| Role | SELECT | INSERT | UPDATE | DELETE | Filtre RLS |
|------|--------|--------|--------|--------|------------|
| Technician | own | own | - | own | user_id = auth.uid() |
| Manager | - | - | - | - | Pas d'acces |
| Admin | - | - | - | - | Pas d'acces |

### 3.4 Table: messages

| Role | SELECT | INSERT | UPDATE | DELETE | Filtre RLS |
|------|--------|--------|--------|--------|------------|
| Technician | own chats | own chats | - | own chats | chat.user_id = auth.uid() |
| Manager | - | - | - | - | Pas d'acces |
| Admin | - | - | - | - | Pas d'acces |

### 3.5 Table: team_messages

| Role | SELECT | INSERT | UPDATE | DELETE | Filtre RLS |
|------|--------|--------|--------|--------|------------|
| Technician | sent/received | send | - | - | sender_id OR receiver_id = auth.uid() |
| Manager | sent/received | send | - | - | sender_id OR receiver_id = auth.uid() |

### 3.6 Table: availability_shares

| Role | SELECT | INSERT | UPDATE | DELETE | Filtre RLS |
|------|--------|--------|--------|--------|------------|
| Technician | own | own | - | - | technician_id = auth.uid() |
| Manager | received | - | accept/reject | - | manager_id = auth.uid() |

### 3.7 Table: invitations

| Role | SELECT | INSERT | UPDATE | DELETE | Filtre RLS |
|------|--------|--------|--------|--------|------------|
| Anonymous (invite) | by token | - | accept | - | token = input |
| Manager | own created | create | - | - | inviter_id = auth.uid() |
| Admin | own created | create | - | - | inviter_id = auth.uid() |

### 3.8 Table: calendar_events

| Role | SELECT | INSERT | UPDATE | DELETE | Filtre RLS |
|------|--------|--------|--------|--------|------------|
| Technician | own | own | own | own | user_id = auth.uid() |
| Manager | - | from dispo | - | - | Special case |

### 3.9 Table: reports

| Role | SELECT | INSERT | UPDATE | DELETE | Filtre RLS |
|------|--------|--------|--------|--------|------------|
| Technician | own | own | - | - | user_id = auth.uid() |

### 3.10 Table: app_settings

| Role | SELECT | INSERT | UPDATE | DELETE | Filtre RLS |
|------|--------|--------|--------|--------|------------|
| All | global | - | - | - | Public read |

### 3.11 Table: user_actions

| Role | SELECT | INSERT | UPDATE | DELETE | Filtre RLS |
|------|--------|--------|--------|--------|------------|
| Technician | - | own | - | - | user_id = auth.uid() |

---

## PARTIE 4: FLUX CRITIQUES A PROTEGER

### FLUX 1: Inscription Technicien Independant

```
1. /auth - User entre email
2. SELECT users WHERE email = ? (verifier si existe)
3. User n'existe pas → UPSERT users (status='incomplete') ⚠️ ANON!
4. User choisit type → UPDATE users SET role (⚠️ ANON!)
5. User remplit formulaire
6. Supabase Auth signUp()
7. UPSERT users (status='pending')
8. User confirme email (lien Supabase)
9. Admin approuve via interface
10. UPDATE users SET status='approved'
11. User se connecte
```

**DANGER:** Etapes 3-4 sont SANS authentification!

### FLUX 2: Inscription Entreprise

```
1. /auth - User entre email
2. SELECT users WHERE email = ?
3. User n'existe pas → UPSERT users (status='incomplete') ⚠️ ANON!
4. User choisit "Entreprise" → UPDATE users SET role='manager' ⚠️ ANON!
5. User remplit formulaire + company_name
6. Supabase Auth signUp()
7. UPSERT users (status='pending', role='manager')
8. Admin approuve
9. User devient Admin de sa company
```

### FLUX 3: Invitation Technician par Manager

```
1. Manager sur /manager clique "Inviter"
2. INSERT invitations (inviter_id, email, role, token)
3. Email envoye avec lien /invite?token=xxx
4. Tech ouvre /invite
5. SELECT invitations WHERE token = ? ⚠️ ANON!
6. SELECT users WHERE id = inviter_id ⚠️ ANON!
7. Tech remplit formulaire
8. Supabase Auth signUp()
9. UPSERT users (manager_id = inviter_id, status='active')
10. UPDATE invitations SET status='accepted'
```

### FLUX 4: Connexion utilisateur existant

```
1. /technician ou /manager ou /admin
2. User entre email
3. SELECT users WHERE email = ? (verifier role)
4. User entre password
5. Supabase Auth signIn()
6. SELECT users WHERE id = auth.uid() (verifier status)
7. Si approved → accès
8. Si pending → ecran pending
```

### FLUX 5: Creation projet (Technician)

```
1. Tech authentifie sur /technician
2. Clic "Nouvelle intervention"
3. INSERT projects (user_id = auth.uid())
4. INSERT chats (project_id, user_id = auth.uid())
5. Envoyer message → INSERT messages
```

### FLUX 6: Vue equipe (Manager)

```
1. Manager authentifie sur /manager
2. SELECT users WHERE manager_id = auth.uid() (internes)
3. Pour chaque tech: SELECT projects WHERE user_id = tech.id
4. SELECT team_messages (conversations)
5. SELECT availability_shares WHERE manager_id = auth.uid()
```

---

## PARTIE 5: REQUETES SANS AUTH (DANGER!)

### Operations AVANT authentification:

| Fichier | Ligne | Table | Operation | Contexte |
|---------|-------|-------|-----------|----------|
| auth | 687 | users | SELECT | Verifier si email existe |
| auth | 869 | users | UPSERT | Sauver lead (incomplete) |
| auth | 894 | users | UPDATE | Sauver type de user |
| invite | 412 | invitations | SELECT | Charger invitation par token |
| invite | 442 | users | SELECT | Info inviteur |

### Solutions possibles:

1. **Service Role Key pour signup** - N8N gere la creation
2. **Policies speciales** - Autoriser INSERT pour email specifique
3. **Functions RPC** - Fonctions Postgres securisees
4. **Trigger on auth.users** - Creer profil automatiquement

---

## PARTIE 6: WORKFLOWS N8N A VERIFIER

| Workflow | Action | Table | Operation | Service Role? |
|----------|--------|-------|-----------|---------------|
| Approbation user | Update status | users | UPDATE | A VERIFIER |
| Envoi email welcome | Read user | users | SELECT | A VERIFIER |
| Envoi email invitation | Read invitation | invitations | SELECT | A VERIFIER |
| Webhook signup | Create profile | users | INSERT | A VERIFIER |

**IMPORTANT:** Si N8N utilise `anon` key, les policies RLS s'appliquent!
Si N8N utilise `service_role` key, RLS est bypass.

---

## PARTIE 7: STRUCTURE DES TABLES (COLONNES CLES POUR RLS)

### users
```sql
- id (UUID) -- PK, lie a auth.users.id
- email (TEXT) -- UNIQUE
- role (TEXT) -- 'technician', 'manager', 'admin', 'owner'
- status (TEXT) -- 'incomplete', 'pending', 'approved', 'active', 'suspended'
- member_type (TEXT) -- 'standalone', 'internal', 'external'
- manager_id (UUID) -- FK users.id (pour technicians internes)
- company_id (UUID) -- FK companies.id (si implemente)
- auth_id (UUID) -- FK auth.users.id (parfois different de id)
```

### projects
```sql
- id (UUID) -- PK
- user_id (UUID) -- FK users.id, PROPRIETAIRE
- title, brand, status, photos...
```

### chats
```sql
- id (UUID) -- PK
- project_id (UUID) -- FK projects.id
- user_id (UUID) -- FK users.id
- chat_type (TEXT) -- 'copilot', 'report', 'codes'
```

### messages
```sql
- id (UUID) -- PK
- chat_id (UUID) -- FK chats.id
- content, role, created_at...
```

### invitations
```sql
- id (UUID) -- PK
- inviter_id (UUID) -- FK users.id
- email (TEXT)
- token (TEXT) -- UNIQUE, pour lien
- role (TEXT)
- status (TEXT) -- 'pending', 'accepted', 'expired'
```

### availability_shares
```sql
- id (UUID) -- PK
- technician_id (UUID) -- FK users.id
- manager_id (UUID) -- FK users.id
- status (TEXT) -- 'pending', 'accepted', 'rejected'
```

### team_messages
```sql
- id (UUID) -- PK
- sender_id (UUID) -- FK users.id
- receiver_id (UUID) -- FK users.id
- content, created_at...
```

---

## PARTIE 8: QUESTIONS A CLARIFIER AVEC HOUSSAM

### Architecture & Roles

1. **Un manager peut-il voir les projets de TOUS les technicians de sa company, ou seulement ceux qu'il manage directement (manager_id)?**
   - Actuellement: Seulement ceux avec `manager_id = son_id`

2. **Un admin peut-il voir les donnees de TOUTES les companies (super admin global) ou seulement SA company?**
   - Actuellement: Pas de filtrage company visible dans le code

3. **Les technicians independants ont-ils une company_id = NULL ou une company speciale "solo"?**
   - Actuellement: Pas de company_id dans le code tech

4. **Quelle est la hierarchie exacte: Owner > Admin > Manager > Technician?**

### Donnees & Privacy

5. **Les messages de chat Copilot sont-ils visibles par le manager/admin ou strictement prives?**
   - Actuellement: Pas d'acces manager aux chats

6. **Les rapports generes sont-ils partageables avec l'equipe?**

7. **Y a-t-il des fonctionnalites de partage de projet entre technicians?**

### Signup & Leads

8. **Le lead capture (email avant auth) doit-il creer un vrai record users ou une table leads separee?**
   - Actuellement: Cree dans users avec status='incomplete'

9. **Qui peut voir les leads incomplete?** (Admin dashboard?)

10. **Le signup entreprise cree-t-il automatiquement une company?**

### Invitations

11. **Un tech interne peut-il etre "transfere" a un autre manager?**

12. **Une invitation expiree peut-elle etre re-envoyee?**

---

## PARTIE 9: POLICIES RLS SUGGEREES

### users
```sql
-- SELECT: Voir son profil + son equipe
CREATE POLICY "users_select" ON users FOR SELECT USING (
    id = auth.uid()  -- Son propre profil
    OR manager_id = auth.uid()  -- Ses technicians (manager)
    OR TRUE  -- A RESTREINDRE: check email only pour signup
);

-- INSERT: Uniquement pour signup (anon)
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (
    -- Necessite service_role ou function RPC
    TRUE
);

-- UPDATE: Son propre profil
CREATE POLICY "users_update" ON users FOR UPDATE USING (
    id = auth.uid()
);
```

### projects
```sql
-- Technician: CRUD sur ses projets
CREATE POLICY "projects_technician" ON projects FOR ALL USING (
    user_id = auth.uid()
);

-- Manager: SELECT projets de son equipe
CREATE POLICY "projects_manager_select" ON projects FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE manager_id = auth.uid())
);
```

### chats & messages
```sql
-- Seulement le proprietaire
CREATE POLICY "chats_owner" ON chats FOR ALL USING (
    user_id = auth.uid()
);

CREATE POLICY "messages_owner" ON messages FOR ALL USING (
    chat_id IN (SELECT id FROM chats WHERE user_id = auth.uid())
);
```

### invitations
```sql
-- Anon: SELECT par token
CREATE POLICY "invitations_by_token" ON invitations FOR SELECT USING (
    TRUE  -- Filtre par token dans la requete
);

-- Authentifie: Gerer ses invitations
CREATE POLICY "invitations_owner" ON invitations FOR ALL USING (
    inviter_id = auth.uid()
);
```

---

## PARTIE 10: RISQUES IDENTIFIES

### CRITIQUE - Signup sans auth
Le flux de signup fait des operations sur `users` AVANT que l'utilisateur soit authentifie. Solutions:
1. Utiliser service_role via N8N
2. Fonction RPC avec `SECURITY DEFINER`
3. Trigger sur `auth.users` pour creer le profil

### MOYEN - Pas de company_id
Actuellement, le filtrage par "company" n'existe pas vraiment. Tout se fait par `manager_id`. Si on veut une isolation stricte par entreprise, il faut:
1. Ajouter `company_id` a toutes les tables pertinentes
2. Propager la company lors des invitations

### FAIBLE - SELECT trop large sur users
Le SELECT sur `users` pour verifier si un email existe est accessible en anon. Risque: enumeration d'emails.

---

## CHECKLIST AVANT IMPLEMENTATION RLS

- [ ] Valider les reponses aux questions Partie 8 avec Houssam
- [ ] Definir policies exactes pour chaque table
- [ ] Tester en local chaque policy
- [ ] Backup de la base AVANT activation RLS
- [ ] Plan de rollback si probleme
- [ ] Mettre a jour N8N si necessaire (service_role)
- [ ] Tester tous les flux critiques post-RLS
