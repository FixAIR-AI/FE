# ADDENDUM CRITIQUE — À LIRE AVANT LE SPEC PRINCIPAL
# Stripe Payment Loop + Audit Obligatoire + Protection SQL Existante

## ⚠️ RÈGLE ABSOLUE #0 — AUDIT AVANT TOUTE MODIFICATION

**AVANT de toucher quoi que ce soit dans le code ou la base de données, Claude Code DOIT :**

### Audit Étape 1 : Vérifier le SQL existant dans Supabase
```sql
-- 1A. Lister TOUTES les colonnes de la table users
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 1B. Lister TOUTES les tables qui existent
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 1C. Lister les colonnes de la table referrals
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'referrals'
ORDER BY ordinal_position;

-- 1D. Lister les colonnes de referral_milestones (si existe)
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'referral_milestones'
ORDER BY ordinal_position;

-- 1E. Lister TOUS les triggers existants
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- 1F. Lister TOUTES les fonctions existantes
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';
```

### Audit Étape 2 : Vérifier le code JavaScript existant
```bash
# 2A. Chercher toutes les fonctions freemium
grep -n 'function.*[Ff]reemium\|function.*[Uu]pgrade\|function.*[Rr]eferral\|FREEMIUM_CONFIG' technician/index.html

# 2B. Chercher toutes les queries Supabase liées au referral
grep -n 'referral_code\|total_referrals\|bonus_queries\|is_ambassador\|subscription_tier\|referred_by' technician/index.html

# 2C. Chercher les exports window.*
grep -n 'window\.\(show\|close\|handle\|share\|track\|canSend\|canUse\|copy\|init\)' technician/index.html

# 2D. Chercher la structure localStorage
grep -n 'fixair_freemium_usage\|freemiumUsage\|getFreemiumUsage\|createFreshUsage' technician/index.html

# 2E. Chercher les éléments HTML des modals
grep -n 'upgradeOverlay\|referralModalOverlay\|inviteConfirm\|referralPending' technician/index.html
```

### Audit Étape 3 : Comparer avec le spec
**Pour CHAQUE modification listée dans le spec principal :**
1. Vérifier que le code à remplacer correspond EXACTEMENT à ce qui est dans le fichier
2. Si ça ne correspond pas → ARRÊTER et documenter la différence
3. Si une colonne SQL existe déjà → NE PAS re-créer, utiliser ce qui existe
4. Si une fonction existe déjà → Vérifier qu'on ne perd pas de fonctionnalité

**NE JAMAIS :**
- Supprimer une table
- Supprimer une colonne
- DROP une fonction sans la recréer
- ALTER TABLE sans IF NOT EXISTS / IF EXISTS
- Modifier une fonction Supabase trigger sans vérifier qu'elle existe d'abord

---

## 🔗 SECTION CRITIQUE : STRIPE → SUPABASE → ACCÈS PRO

### Le lien de paiement Stripe
```
https://pay.fixair.ai/b/dRm7sKa3MbPAgxdfgR2VG00
```

### Le Problème
Quand le user clique "Passer à Pro — 49€/mois" dans le popup :
1. Il ouvre ce lien Stripe dans un nouvel onglet
2. Il paie sur Stripe
3. **Comment on sait qu'il a payé ?**
4. **Comment on met à jour `users.subscription_tier = 'pro'` ?**
5. **Comment l'app lui donne accès immédiatement ?**

### La Solution : 3 mécanismes complémentaires

#### Mécanisme A : Passer le `user_id` dans l'URL Stripe (Client-side)

Stripe Payment Links supportent le `client_reference_id` via query parameter.

**Dans `handleUpgradeClick()` du spec principal, REMPLACER par :**

```javascript
function handleUpgradeClick() {
    console.log('[Freemium] Upgrade clicked');
    closeUpgradeModal();
    closePendingPopup();
    closeInviteConfirmPopup();
    
    // Construire le lien Stripe avec le user_id + email
    const stripeBaseUrl = 'https://pay.fixair.ai/b/dRm7sKa3MbPAgxdfgR2VG00';
    const params = new URLSearchParams();
    
    // Passer le user_id pour lier le paiement au compte
    if (currentUserId) {
        params.set('client_reference_id', currentUserId);
    }
    
    // Pré-remplir l'email si on l'a
    if (currentUser && currentUser.email) {
        params.set('prefilled_email', currentUser.email);
    }
    
    const fullUrl = `${stripeBaseUrl}?${params.toString()}`;
    
    // Ouvrir Stripe dans un nouvel onglet
    window.open(fullUrl, '_blank');
    
    // Pendant que l'user est sur Stripe, on poll pour vérifier s'il a payé
    startPaymentPolling();
}
```

#### Mécanisme B : Polling côté client (pendant que l'user est sur Stripe)

```javascript
// Poll Supabase toutes les 5 secondes pour vérifier si le paiement est passé
let paymentPollInterval = null;

function startPaymentPolling() {
    // Arrêter tout polling existant
    if (paymentPollInterval) clearInterval(paymentPollInterval);
    
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (60 * 5s)
    
    console.log('[Payment] Starting payment polling...');
    
    paymentPollInterval = setInterval(async () => {
        attempts++;
        
        if (attempts > maxAttempts) {
            clearInterval(paymentPollInterval);
            paymentPollInterval = null;
            console.log('[Payment] Polling timeout — user may not have completed payment');
            return;
        }
        
        try {
            const userId = await getCurrentUserId();
            if (!userId) return;
            
            const { data, error } = await db
                .from('users')
                .select('subscription_tier')
                .eq('id', userId)
                .single();
            
            if (data && (data.subscription_tier === 'pro' || data.subscription_tier === 'enterprise')) {
                // ✅ PAYMENT CONFIRMED!
                clearInterval(paymentPollInterval);
                paymentPollInterval = null;
                
                console.log('[Payment] ✅ Payment confirmed! User is now Pro');
                
                // Update local cache immediately
                const usage = getFreemiumUsage();
                usage.isPro = true;
                saveFreemiumUsage(usage);
                
                // Show success toast
                toast('🎉 Bienvenue chez FixAIR Pro ! Accès illimité activé.');
                
                // Remove any upgrade banners
                document.querySelectorAll('.upgrade-banner').forEach(b => b.remove());
                document.querySelectorAll('.sprint-banner').forEach(b => b.remove());
            }
        } catch (e) {
            console.warn('[Payment] Polling error:', e);
        }
    }, 5000); // Every 5 seconds
}

// Stop polling when page unloads
window.addEventListener('beforeunload', () => {
    if (paymentPollInterval) clearInterval(paymentPollInterval);
});

// Also check on page focus (user comes back from Stripe tab)
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && paymentPollInterval) {
        // Immediate check when user comes back to tab
        try {
            const userId = await getCurrentUserId();
            if (!userId) return;
            
            const { data } = await db
                .from('users')
                .select('subscription_tier')
                .eq('id', userId)
                .single();
            
            if (data && (data.subscription_tier === 'pro' || data.subscription_tier === 'enterprise')) {
                clearInterval(paymentPollInterval);
                paymentPollInterval = null;
                
                const usage = getFreemiumUsage();
                usage.isPro = true;
                saveFreemiumUsage(usage);
                
                toast('🎉 Bienvenue chez FixAIR Pro ! Accès illimité activé.');
                
                document.querySelectorAll('.upgrade-banner').forEach(b => b.remove());
                document.querySelectorAll('.sprint-banner').forEach(b => b.remove());
            }
        } catch (e) {}
    }
});

window.startPaymentPolling = startPaymentPolling;
```

#### Mécanisme C : Stripe Webhook → Supabase (Server-side, via n8n)

**C'est la partie la plus importante.** Le polling est un fallback, mais le VRAI mécanisme est le webhook.

**Créer un workflow n8n :**

```
Stripe Webhook (checkout.session.completed)
    ↓
Extract client_reference_id (= user_id) + customer_email
    ↓
Update Supabase: users.subscription_tier = 'pro' WHERE id = client_reference_id
    ↓
Done
```

**Configuration n8n détaillée :**

1. **Nœud 1 : Webhook Trigger**
   - Méthode : POST
   - Path : `/stripe-webhook`
   - URL résultante : `https://cherhabil.app.n8n.cloud/webhook/stripe-webhook`

2. **Nœud 2 : Code (extraire les données)**
```javascript
// Extract payment data from Stripe webhook
const event = $input.first().json;

// Vérifier que c'est un checkout complété
if (event.type !== 'checkout.session.completed') {
    return [{ json: { skip: true, reason: 'Not a checkout completion' } }];
}

const session = event.data.object;

return [{
    json: {
        userId: session.client_reference_id,      // Le user_id qu'on a passé
        customerEmail: session.customer_email || session.customer_details?.email,
        customerId: session.customer,               // Stripe customer ID
        subscriptionId: session.subscription,       // Stripe subscription ID
        amountPaid: session.amount_total,
        currency: session.currency,
        paymentStatus: session.payment_status       // 'paid'
    }
}];
```

3. **Nœud 3 : IF (vérifier qu'on a un userId)**
   - Condition : `{{ $json.userId }}` is not empty
   - Si vrai → Nœud 4
   - Si faux → Nœud 5 (fallback par email)

4. **Nœud 4 : Supabase Update (par userId)**
```sql
UPDATE users 
SET 
    subscription_tier = 'pro',
    stripe_customer_id = '{{ $json.customerId }}',
    stripe_subscription_id = '{{ $json.subscriptionId }}',
    subscription_started_at = NOW(),
    updated_at = NOW()
WHERE id = '{{ $json.userId }}';
```

5. **Nœud 5 : Supabase Update (fallback par email)**
```sql
UPDATE users 
SET 
    subscription_tier = 'pro',
    stripe_customer_id = '{{ $json.customerId }}',
    stripe_subscription_id = '{{ $json.subscriptionId }}',
    subscription_started_at = NOW(),
    updated_at = NOW()
WHERE email = '{{ $json.customerEmail }}';
```

**SQL additionnel pour Supabase (colonnes Stripe) :**
```sql
-- Ajouter les colonnes Stripe (IF NOT EXISTS pour ne rien écraser)
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;
```

**Configuration Stripe (à faire dans le Dashboard Stripe) :**
1. Aller dans Stripe Dashboard → Developers → Webhooks
2. Ajouter endpoint : `https://cherhabil.app.n8n.cloud/webhook/stripe-webhook`
3. Événements à écouter : `checkout.session.completed`
4. Copier le Webhook Signing Secret (pour validation optionnelle)

---

## 📱 PAS BESOIN DE PAGE PRICING

**Réponse à ta question : NON, tu n'as pas besoin d'une page pricing séparée.**

Pourquoi :
- Tu as 20 users, pas 20 000
- Le popup dans l'app EST ta page pricing
- Le lien Stripe fait office de checkout
- Ajouter une page pricing = temps perdu = pas de viralité

**Le flow est :**
```
User dans l'app → Hit limit → Popup (referral-first) 
    → Clic "Passer à Pro 49€/mois"
    → Stripe s'ouvre avec email pré-rempli
    → User paie
    → Webhook n8n → Supabase → subscription_tier = 'pro'
    → Polling détecte le changement → Toast "🎉 Bienvenue Pro !"
    → User est immédiatement débloqué
```

Pas de page pricing. Pas de landing page. Le popup fait tout.

---

## 🛡️ PROTECTION SQL — CE QUI EXISTE DÉJÀ

### Colonnes `users` qui EXISTENT déjà (NE PAS RE-CRÉER) :
- `subscription_tier` (VARCHAR) — déjà là
- `referral_code` (VARCHAR) — déjà là
- `total_referrals` (INTEGER) — déjà là
- `bonus_queries` (INTEGER) — déjà là
- `is_ambassador` (BOOLEAN) — déjà là
- `referred_by` (UUID) — déjà là
- `subscription_paid_by` — déjà là (enterprise)

### Table `referrals` qui EXISTE déjà (NE PAS RE-CRÉER) :
Colonnes existantes :
- `id` (UUID)
- `referrer_id` (UUID)
- `referee_id` (UUID)
- `referral_code` (VARCHAR)
- `status` (VARCHAR) — 'pending' | 'completed'
- `bonus_granted_referrer` (BOOLEAN)
- `bonus_granted_referee` (BOOLEAN)
- `bonus_queries_amount` (INTEGER)
- `created_at` (TIMESTAMPTZ)
- `completed_at` (TIMESTAMPTZ)

### Table `referral_milestones` qui EXISTE déjà (NE PAS RE-CRÉER)
(Vérifier les colonnes avec l'audit)

### Règle pour le SQL dans le spec principal :
**CHAQUE** `ALTER TABLE` doit utiliser `IF NOT EXISTS` :
```sql
-- ✅ CORRECT
ALTER TABLE users ADD COLUMN IF NOT EXISTS completed_referrals INTEGER DEFAULT 0;

-- ❌ INTERDIT
ALTER TABLE users ADD COLUMN completed_referrals INTEGER DEFAULT 0;
```

**CHAQUE** `CREATE TABLE` doit utiliser `IF NOT EXISTS` :
```sql
-- ✅ CORRECT
CREATE TABLE IF NOT EXISTS referral_milestones (...);

-- ❌ INTERDIT
CREATE TABLE referral_milestones (...);
```

**CHAQUE** `CREATE FUNCTION` doit utiliser `CREATE OR REPLACE` :
```sql
-- ✅ CORRECT
CREATE OR REPLACE FUNCTION grant_referral_bonus() ...

-- ❌ INTERDIT
CREATE FUNCTION grant_referral_bonus() ...
```

**CHAQUE** trigger doit être `DROP IF EXISTS` avant `CREATE` :
```sql
-- ✅ CORRECT
DROP TRIGGER IF EXISTS grant_bonus_on_referral_complete ON referrals;
CREATE TRIGGER grant_bonus_on_referral_complete ...
```

---

## 📋 MODIFICATION AU SPEC PRINCIPAL

### Dans PHASE 1 SQL, REMPLACER Migration 1 par :

```sql
-- AUDIT D'ABORD : Vérifier ce qui existe
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('completed_referrals', 'week_free_granted_at', 'referral_buffer_until', 'sprint_challenge_shown', 'stripe_customer_id', 'stripe_subscription_id', 'subscription_started_at');

-- AJOUTER SEULEMENT ce qui manque (IF NOT EXISTS protège)
ALTER TABLE users ADD COLUMN IF NOT EXISTS completed_referrals INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS week_free_granted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_buffer_until TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sprint_challenge_shown BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;
```

### Dans PHASE 4, ÉTAPE 4H, REMPLACER `handleUpgradeClick()` par la version avec Stripe (voir Mécanisme A ci-dessus)

### Dans PHASE 4, ÉTAPE 4J, AJOUTER les fonctions polling (voir Mécanisme B ci-dessus)

### Dans PHASE 4, ajouter les `window.` exports :
```javascript
window.startPaymentPolling = startPaymentPolling;
```

---

## 🔄 ORDRE D'EXÉCUTION FINAL

```
1. AUDIT (Étapes 1-3 ci-dessus) — Documenter ce qui existe
2. SQL Supabase — Ajouter les colonnes manquantes (IF NOT EXISTS)
3. SQL Supabase — Créer/Remplacer le trigger (CREATE OR REPLACE)
4. n8n — Créer le workflow Stripe Webhook
5. Stripe Dashboard — Ajouter le webhook endpoint
6. CSS — Modifications (spec principal Phase 2)
7. HTML — Modifications (spec principal Phase 3)
8. JavaScript — Modifications (spec principal Phase 4)
9. TESTS — Exécuter les 7 tests du spec principal
10. TEST STRIPE — Faire un test payment (Stripe test mode)
```

---

## 🧪 TEST STRIPE END-TO-END

### Test en mode Stripe Test :
1. S'assurer que le Payment Link est en mode TEST (pas live)
2. Ouvrir l'app en tant qu'utilisateur free
3. Atteindre la limite (20 Copilot queries)
4. Cliquer "Passer à Pro — 49€/mois"
5. Sur Stripe, utiliser la carte test : `4242 4242 4242 4242`
6. Compléter le paiement
7. Vérifier dans Supabase : `SELECT subscription_tier FROM users WHERE id = 'your-id'` → doit être `pro`
8. Revenir sur l'app → toast "🎉 Bienvenue chez FixAIR Pro !" doit apparaître
9. Envoyer un message → doit passer sans popup

### Si le webhook ne marche pas :
Le polling côté client est le fallback. Il vérifie Supabase toutes les 5 secondes.
Si après 5 minutes le paiement n'est pas détecté, le user peut refresh la page.

---

## ⚠️ RÉSUMÉ DES AJOUTS PAR RAPPORT AU SPEC PRINCIPAL

| # | Ajout | Fichier |
|---|-------|---------|
| A1 | Audit obligatoire avant toute modification | Procédure |
| A2 | Stripe Payment Link intégré | JS : handleUpgradeClick() |
| A3 | Polling côté client (5s) | JS : startPaymentPolling() |
| A4 | Visibilitychange listener | JS : document event |
| A5 | n8n workflow Stripe webhook | n8n Cloud |
| A6 | Colonnes Stripe dans users | SQL : IF NOT EXISTS |
| A7 | Protection SQL (IF NOT EXISTS partout) | SQL |
| A8 | Test Stripe end-to-end | Procédure |

**Ce document est un ADDENDUM. Il se lit AVANT le spec principal `CLAUDE-CODE-VIRAL-GROWTH-SPEC.md`.**
