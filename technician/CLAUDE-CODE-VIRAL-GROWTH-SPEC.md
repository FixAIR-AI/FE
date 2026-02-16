# CLAUDE CODE — SPEC TECHNIQUE DÉFINITIVE
# FixAIR Viral Growth Engine (4-Week Survival Plan)

## ⚠️ RÈGLE #1 — NE RIEN CASSER
Ce fichier fait 21 057 lignes. Tu modifies UNIQUEMENT ce qui est listé ici.
Tu ne réorganises PAS le code. Tu ne renommes PAS les fonctions existantes.
Avant chaque modification, tu vérifies que le code que tu remplaces correspond EXACTEMENT à ce qui est dans le fichier.

---

## 📄 FICHIER CIBLE
```
technician/index.html
```
Fichier unique (HTML + CSS + JS). ~21 057 lignes.

---

## 🎯 RÉSUMÉ DE CE QU'ON CONSTRUIT

### Free Tier (ce que l'utilisateur gratuit a droit)
- **20 requêtes Copilot** par semaine
- **3 rapports générés** par semaine (via Assistant)
- Pas de limite séparée — c'est 20 Copilot + 3 rapports

### Quand la limite est atteinte → Popup Unifié (Referral-First)
- CTA principal : **"Inviter un collègue → 1 semaine gratuite"**
- CTA secondaire : **"Passer à Pro — 49€/mois"**
- Bouton "Plus tard"

### Quand l'utilisateur invite → Buffer immédiat
- **+5 requêtes OU 24h d'accès** immédiatement après l'envoi de l'invitation
- Popup de confirmation : "Invitation envoyée"

### Quand le referral se convertit → Récompense
- **+7 jours gratuits** pour le referrer ET le referee

### Sprint Challenge (Jour 3+ après inscription)
- Bannière : "Invite 3 techniciens → 2 mois FixAIR offerts"
- Visible pour TOUS les utilisateurs après jour 3

### Bannière douce (Warning)
- S'affiche à 80% de la limite (16 Copilot queries ou 2 rapports)
- Design subtil vert, pas de jaune agressif

### Re-entry (Utilisateur qui revient)
- Exemple HVAC pré-rempli "Un clic vers la valeur"

### Message WhatsApp
- Ton technicien authentique, pas SaaS
- "c'est trop con de garder ça pour moi"
- Messages variés pour multi-invite (pas le même texte 5 fois)

---

## 📐 PHASE 1 : SQL SUPABASE (Exécuter en premier)

### Migration 1 — Colonnes utilisateur
```sql
-- Ajouter les colonnes de milestone referral
ALTER TABLE users ADD COLUMN IF NOT EXISTS completed_referrals INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS week_free_granted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_buffer_until TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sprint_challenge_shown BOOLEAN DEFAULT false;

-- Vérification
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('completed_referrals', 'week_free_granted_at', 'referral_buffer_until', 'sprint_challenge_shown');
```

### Migration 2 — Trigger automatique
```sql
-- Quand un referral passe à 'completed', incrémenter le compteur et récompenser
CREATE OR REPLACE FUNCTION grant_referral_bonus()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Incrémenter le compteur du referrer
    UPDATE users 
    SET 
      completed_referrals = COALESCE(completed_referrals, 0) + 1,
      total_referrals = COALESCE(total_referrals, 0) + 1
    WHERE id = NEW.referrer_id;
    
    -- Donner +7 jours gratuits au referrer
    UPDATE users 
    SET week_free_granted_at = NOW()
    WHERE id = NEW.referrer_id;
    
    -- Donner +7 jours gratuits au referee aussi
    UPDATE users 
    SET week_free_granted_at = NOW()
    WHERE id = NEW.referee_id;
    
    -- Donner bonus queries au referee (20 requêtes)
    UPDATE users 
    SET bonus_queries = COALESCE(bonus_queries, 0) + 20
    WHERE id = NEW.referee_id;
    
    -- Vérifier si le referrer atteint le milestone Sprint (3 referrals = 2 mois)
    IF (SELECT completed_referrals FROM users WHERE id = NEW.referrer_id) >= 3 THEN
      -- Donner 2 mois gratuits (60 jours)
      UPDATE users 
      SET 
        week_free_granted_at = NOW() + INTERVAL '60 days',
        is_ambassador = true
      WHERE id = NEW.referrer_id
      AND NOT is_ambassador;  -- Ne donner qu'une seule fois
    END IF;
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS grant_bonus_on_referral_complete ON referrals;
CREATE TRIGGER grant_bonus_on_referral_complete
AFTER UPDATE ON referrals
FOR EACH ROW
EXECUTE FUNCTION grant_referral_bonus();
```

### Migration 3 — Index pour performance
```sql
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
```

---

## 📐 PHASE 2 : CSS — Remplacer les styles des modals + banner

### ÉTAPE 2A — Remplacer le CSS de l'upgrade modal + banner
**LIGNES 5202 à 5430** — Du début de `.upgrade-overlay {` jusqu'à la fin de `[data-theme="light"] .upgrade-benefits {`

**REMPLACER TOUT CE BLOC PAR :**

```css
/* ═══ UNIFIED PAYWALL POPUP (Referral-First) ═══ */
.upgrade-overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    padding: 20px;
}
.upgrade-overlay.show {
    opacity: 1;
    visibility: visible;
}
.upgrade-modal {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 20px;
    max-width: 400px;
    width: 100%;
    overflow: hidden;
    transform: translateY(20px) scale(0.95);
    transition: transform 0.3s ease;
}
.upgrade-overlay.show .upgrade-modal {
    transform: translateY(0) scale(1);
}
.upgrade-modal-accent {
    height: 3px;
    background: linear-gradient(90deg, #6C5CE7, #00b894, #6C5CE7);
}
.upgrade-modal-body {
    padding: 28px 24px 24px;
    text-align: center;
}
.upgrade-fire-icon {
    width: 68px; height: 68px;
    border-radius: 50%;
    background: rgba(108, 92, 231, 0.08);
    border: 2px solid rgba(108, 92, 231, 0.2);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
    font-size: 30px;
}
.upgrade-modal-title {
    font-size: 19px; font-weight: 800;
    color: var(--text);
    margin-bottom: 8px;
}
.upgrade-modal-subtitle {
    font-size: 13px;
    color: var(--text-dim);
    margin-bottom: 24px;
    line-height: 1.55;
}

/* Referral CTA block (PRIMARY — green, most visible) */
.upgrade-referral-block {
    background: rgba(0, 184, 148, 0.07);
    border: 1px solid rgba(0, 184, 148, 0.15);
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 16px;
}
.upgrade-referral-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 10px;
}
.upgrade-referral-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: rgba(0, 184, 148, 0.12);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
}
.upgrade-referral-info { text-align: left; }
.upgrade-referral-title {
    font-size: 14px; font-weight: 700; color: #00b894;
}
.upgrade-referral-desc {
    font-size: 11.5px; color: var(--text-dim);
    margin-top: 2px; line-height: 1.4;
}
.upgrade-referral-btn {
    width: 100%; padding: 13px 20px;
    border-radius: 10px;
    background: linear-gradient(135deg, #00b894, #00a381);
    color: white; border: none;
    font-size: 14px; font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 18px rgba(0, 184, 148, 0.3);
    transition: all 0.2s;
}
.upgrade-referral-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 22px rgba(0, 184, 148, 0.4);
}

/* Upgrade CTA (SECONDARY — violet outline, discret) */
.upgrade-pro-btn {
    width: 100%; padding: 13px 20px;
    border-radius: 10px;
    background: rgba(108, 92, 231, 0.12);
    border: 1px solid rgba(108, 92, 231, 0.2);
    color: #8b7cf7;
    font-size: 13.5px; font-weight: 600;
    cursor: pointer; margin-bottom: 4px;
    transition: all 0.2s;
}
.upgrade-pro-btn:hover { background: rgba(108, 92, 231, 0.18); }
.upgrade-pro-note {
    font-size: 10.5px; color: rgba(255, 255, 255, 0.2);
    margin-bottom: 14px;
}
.upgrade-later-btn {
    background: transparent; border: none;
    color: rgba(255, 255, 255, 0.18);
    font-size: 12px; cursor: pointer; padding: 4px 0;
}
.upgrade-later-btn:hover { color: rgba(255, 255, 255, 0.35); }

/* Post-Invite Confirmation Popup */
.invite-confirm-popup {
    position: fixed;
    bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--bg-secondary);
    border: 1px solid rgba(0, 184, 148, 0.2);
    border-radius: 16px;
    padding: 20px 24px;
    max-width: 380px; width: 90%;
    text-align: center;
    z-index: 10001;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    opacity: 0;
    visibility: hidden;
}
.invite-confirm-popup.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1; visibility: visible;
}
.invite-confirm-title {
    font-size: 15px; font-weight: 700; color: #00b894;
    margin-bottom: 6px;
}
.invite-confirm-text {
    font-size: 12px; color: var(--text-dim);
    line-height: 1.5; margin-bottom: 16px;
}
.invite-confirm-buttons {
    display: flex; flex-direction: column; gap: 8px;
}
.invite-confirm-btn-primary {
    width: 100%; padding: 11px 16px;
    border-radius: 10px;
    background: rgba(0, 184, 148, 0.12);
    border: 1px solid rgba(0, 184, 148, 0.2);
    color: #00b894; font-size: 13px; font-weight: 600;
    cursor: pointer;
}
.invite-confirm-btn-secondary {
    width: 100%; padding: 11px 16px;
    border-radius: 10px;
    background: rgba(108, 92, 231, 0.1);
    border: 1px solid rgba(108, 92, 231, 0.15);
    color: #8b7cf7; font-size: 12px; font-weight: 600;
    cursor: pointer;
}

/* Sprint Challenge Banner */
.sprint-banner {
    background: linear-gradient(135deg, rgba(108, 92, 231, 0.08), rgba(0, 184, 148, 0.06));
    border: 1px solid rgba(108, 92, 231, 0.15);
    border-radius: 14px;
    padding: 16px 18px;
    margin: 12px 16px;
    cursor: pointer;
    transition: all 0.2s;
}
.sprint-banner:hover {
    border-color: rgba(108, 92, 231, 0.25);
}
.sprint-banner-header {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 8px;
}
.sprint-banner-emoji { font-size: 18px; }
.sprint-banner-title {
    font-size: 14px; font-weight: 700; color: var(--text);
}
.sprint-banner-desc {
    font-size: 12px; color: var(--text-dim);
    line-height: 1.5; margin-bottom: 10px;
}
.sprint-banner-cta {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    background: rgba(0, 184, 148, 0.12);
    border: 1px solid rgba(0, 184, 148, 0.2);
    color: #00b894; font-size: 12px; font-weight: 600;
    cursor: pointer;
}

/* Soft Warning Banner (in-chat, replaces old yellow) */
.upgrade-banner {
    background: rgba(108, 92, 231, 0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(108, 92, 231, 0.1);
    border-radius: 12px;
    padding: 11px 16px;
    margin: 12px 0;
    display: flex; align-items: center; gap: 14px;
    animation: fadeIn 0.3s ease;
}
.upgrade-banner-content { flex: 1; }
.upgrade-banner-title {
    font-size: 12.5px; font-weight: 600;
    color: var(--text); opacity: 0.75;
}
.upgrade-banner-text {
    font-size: 11px; color: var(--text-dim); margin-top: 2px;
}
.upgrade-banner-btn {
    padding: 8px 16px; border-radius: 8px;
    background: rgba(0, 184, 148, 0.15);
    border: 1px solid rgba(0, 184, 148, 0.25);
    color: #00b894; font-size: 12px; font-weight: 600;
    cursor: pointer; white-space: nowrap;
    transition: all 0.2s;
}
.upgrade-banner-btn:hover { background: rgba(0, 184, 148, 0.22); }

/* Pending Referral Status (shown on app open if no conversion) */
.referral-pending-popup {
    position: fixed;
    bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--bg-secondary);
    border: 1px solid rgba(108, 92, 231, 0.15);
    border-radius: 16px;
    padding: 20px 24px;
    max-width: 380px; width: 90%;
    text-align: center;
    z-index: 10001;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    opacity: 0; visibility: hidden;
}
.referral-pending-popup.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1; visibility: visible;
}

/* Re-entry prompt */
.reentry-prompt {
    background: rgba(255, 107, 53, 0.06);
    border: 1px solid rgba(255, 107, 53, 0.12);
    border-radius: 14px;
    padding: 16px 18px;
    margin: 12px 0;
    cursor: pointer;
    transition: all 0.2s;
}
.reentry-prompt:hover {
    background: rgba(255, 107, 53, 0.1);
    border-color: rgba(255, 107, 53, 0.2);
}

/* Light theme overrides */
[data-theme="light"] .upgrade-modal { background: #FFFFFF; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); }
[data-theme="light"] .upgrade-modal-title { color: #1E293B; }
[data-theme="light"] .upgrade-modal-subtitle { color: #64748B; }
[data-theme="light"] .upgrade-referral-desc { color: #64748B; }
[data-theme="light"] .upgrade-pro-note { color: rgba(0, 0, 0, 0.3); }
[data-theme="light"] .upgrade-later-btn { color: rgba(0, 0, 0, 0.25); }
[data-theme="light"] .upgrade-fire-icon { background: rgba(108, 92, 231, 0.06); border-color: rgba(108, 92, 231, 0.15); }
[data-theme="light"] .invite-confirm-popup { background: #FFFFFF; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15); }
[data-theme="light"] .sprint-banner { background: linear-gradient(135deg, rgba(108, 92, 231, 0.05), rgba(0, 184, 148, 0.04)); }
```

### ÉTAPE 2B — Supprimer le CSS de la referral modal
**LIGNES 5574 à 5700** — Du début de `.referral-modal-overlay {` jusqu'à `[data-theme="light"] .referral-modal {`

**SUPPRIMER TOUT CE BLOC.** Le popup unifié ci-dessus le remplace.

**⚠️ NE PAS TOUCHER** le CSS `.referral-section` (lignes 5435-5572) — c'est la section profil.

---

## 📐 PHASE 3 : HTML — Remplacer les modals

### ÉTAPE 3A — Remplacer le HTML de l'upgrade modal + referral modal
**LIGNES 5748 à 5840** — Du `<div id="upgradeOverlay"...>` jusqu'à `<!-- END REFERRAL FRICTION MODAL -->`

**REMPLACER TOUT CE BLOC (les 2 modals) PAR :**

```html
<!-- ═══ UNIFIED PAYWALL POPUP (Referral-First) ═══ -->
<div id="upgradeOverlay" class="upgrade-overlay" onclick="closeUpgradeModal(event)">
    <div class="upgrade-modal" onclick="event.stopPropagation()">
        <div class="upgrade-modal-accent"></div>
        <div class="upgrade-modal-body">
            <div class="upgrade-fire-icon">🔥</div>
            <h2 class="upgrade-modal-title" id="upgradeTitle">Vous êtes un power user !</h2>
            <p class="upgrade-modal-subtitle" id="upgradeSubtitle">Vous avez atteint votre limite gratuite cette semaine</p>
            
            <!-- PRIMARY: Referral CTA -->
            <div class="upgrade-referral-block">
                <div class="upgrade-referral-header">
                    <div class="upgrade-referral-icon">🎁</div>
                    <div class="upgrade-referral-info">
                        <div class="upgrade-referral-title">Invitez, continuez gratuitement</div>
                        <div class="upgrade-referral-desc">Un collègue s'inscrit → 1 semaine gratuite pour vous deux</div>
                    </div>
                </div>
                <button class="upgrade-referral-btn" onclick="handleInviteClick()">
                    Inviter un collègue
                </button>
            </div>
            
            <!-- SECONDARY: Upgrade CTA -->
            <button class="upgrade-pro-btn" onclick="handleUpgradeClick()">
                Passer à Pro — 49€/mois
            </button>
            <div class="upgrade-pro-note">Annulable à tout moment · Facturation mensuelle</div>
            
            <button class="upgrade-later-btn" onclick="closeUpgradeModal()">Plus tard</button>
        </div>
    </div>
</div>
<!-- END UNIFIED PAYWALL -->

<!-- ═══ POST-INVITE CONFIRMATION POPUP ═══ -->
<div id="inviteConfirmPopup" class="invite-confirm-popup">
    <div class="invite-confirm-title">✅ Invitation envoyée</div>
    <div class="invite-confirm-text">
        Dès que ton collègue s'inscrit avec ton lien, tu débloques 1 semaine gratuite.<br>
        En attendant, tu as accès temporairement.
    </div>
    <div class="invite-confirm-buttons">
        <button class="invite-confirm-btn-primary" onclick="handleInviteClick()">
            👥 Inviter quelqu'un d'autre
        </button>
        <button class="invite-confirm-btn-secondary" onclick="handleUpgradeClick()">
            💳 Passer Pro — 49€/mois
        </button>
    </div>
</div>
<!-- END POST-INVITE CONFIRMATION -->

<!-- ═══ PENDING REFERRAL STATUS POPUP ═══ -->
<div id="referralPendingPopup" class="referral-pending-popup">
    <div style="font-size: 24px; margin-bottom: 12px;">⏳</div>
    <div style="font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 6px;">
        Aucun collègue ne s'est encore inscrit
    </div>
    <div style="font-size: 12px; color: var(--text-dim); line-height: 1.5; margin-bottom: 16px;" id="pendingMicroCopy">
        Un seul collègue qui s'inscrit = 1 semaine gratuite pour vous deux.
    </div>
    <div class="invite-confirm-buttons">
        <button class="invite-confirm-btn-primary" onclick="handleInviteClick()">
            👥 Inviter un technicien maintenant
        </button>
        <button class="invite-confirm-btn-secondary" onclick="handleUpgradeClick()">
            💳 Passer Pro — 49€/mois
        </button>
    </div>
    <button class="upgrade-later-btn" onclick="closePendingPopup()" style="margin-top: 8px;">
        Plus tard
    </button>
</div>
<!-- END PENDING REFERRAL STATUS -->
```

---

## 📐 PHASE 4 : JAVASCRIPT — Modifications du système freemium

Toutes les modifications suivantes sont dans le **même fichier** `index.html`.

### ÉTAPE 4A — Remplacer FREEMIUM_CONFIG
**LIGNE 18557** — Trouver `const FREEMIUM_CONFIG = {` et remplacer tout le bloc (jusqu'au `};`)

```javascript
const FREEMIUM_CONFIG = {
    // ═══ FREE TIER LIMITS ═══
    freeCopilotChats: 20,        // 20 Copilot queries per week
    freeReports: 3,              // 3 generated reports per week (via Assistant)
    softLimitWarning: 0.8,       // Show warning at 80%
    
    // ═══ REFERRAL ═══
    bufferQueriesOnInvite: 5,    // +5 queries immediately after invite sent
    bufferHoursOnInvite: 24,     // OR 24h access after invite sent
    weekFreeDaysOnConvert: 7,    // +7 days when referral converts
    sprintTarget: 3,             // Sprint: 3 referrals = 2 months free
    sprintRewardDays: 60,        // Sprint: 60 days free
    sprintShowAfterDays: 3,      // Show sprint banner after day 3
    
    // ═══ PRICING ═══
    monthlyPrice: 49,
    
    // ═══ STORAGE & URLS ═══
    storageKey: 'fixair_freemium_usage',
    upgradeUrl: 'https://fixair.ai/upgrade',  // Placeholder — pas de Stripe encore
    
    // ═══ PRO FEATURES ═══
    proFeatures: ['export_pdf', 'export_word', 'share_report', 'diagrams_advanced']
};
```

### ÉTAPE 4B — Modifier `createFreshUsage()` 
**LIGNE 18598** — Trouver `function createFreshUsage()` et remplacer tout le bloc

```javascript
function createFreshUsage() {
    const fresh = {
        weekStart: getFreemiumWeekStart().toISOString(),
        copilotChats: 0,
        assistantChats: 0,    // Keep for analytics (backward compat)
        reportsGenerated: 0,  // NEW: Track reports separately
        bufferQueries: 0,     // NEW: Bonus queries from invites
        bufferUntil: null,    // NEW: Temporary access expiry (ISO string)
        isPro: false,
        lastChecked: new Date().toISOString(),
        invitesSentThisWeek: 0  // NEW: Track invites sent
    };
    saveFreemiumUsage(fresh);
    return fresh;
}
```

### ÉTAPE 4C — Remplacer `trackChatUsage()`
**LIGNE 18670** — Trouver `function trackChatUsage(panel) {` et remplacer TOUTE la fonction

```javascript
function trackChatUsage(panel) {
    const usage = getFreemiumUsage();
    
    // Pro users bypass
    if (usage.isPro) return { allowed: true, remaining: 999 };
    
    // Owner bypass
    if (currentUserId === 'd5baabf1-147a-4ee5-a07a-8f80212fbc9a') {
        return { allowed: true, remaining: 999 };
    }
    
    // Check temporary buffer (24h access from invite)
    if (usage.bufferUntil && new Date(usage.bufferUntil) > new Date()) {
        // User has temporary access — allow but still track
        usage.copilotChats = (usage.copilotChats || 0) + 1;
        saveFreemiumUsage(usage);
        return { allowed: true, remaining: 999, buffered: true };
    }
    
    // Check buffer queries (+5 from invite)
    if ((usage.bufferQueries || 0) > 0) {
        usage.bufferQueries -= 1;
        usage.copilotChats = (usage.copilotChats || 0) + 1;
        saveFreemiumUsage(usage);
        return { allowed: true, remaining: usage.bufferQueries, buffered: true };
    }
    
    // ═══ LIMIT CHECK ═══
    if (panel === 'copilot') {
        const limit = FREEMIUM_CONFIG.freeCopilotChats;
        usage.copilotChats = (usage.copilotChats || 0) + 1;
        saveFreemiumUsage(usage);
        
        const remaining = Math.max(0, limit - usage.copilotChats);
        const percentUsed = usage.copilotChats / limit;
        
        return {
            allowed: usage.copilotChats <= limit,
            remaining: remaining,
            total: limit,
            used: usage.copilotChats,
            percentUsed: percentUsed,
            showWarning: percentUsed >= FREEMIUM_CONFIG.softLimitWarning && percentUsed < 1,
            showUpgrade: percentUsed >= 1
        };
    } else {
        // Assistant — check reports limit
        const limit = FREEMIUM_CONFIG.freeReports;
        // Assistant messages are free, but REPORTS are limited
        // We count report generations, not messages
        usage.assistantChats = (usage.assistantChats || 0) + 1;
        saveFreemiumUsage(usage);
        
        // Assistant messages always allowed (reports are checked separately)
        return { allowed: true, remaining: 999 };
    }
}
```

### ÉTAPE 4D — Ajouter `trackReportGeneration()` — NOUVELLE FONCTION
**Ajouter APRÈS** la fin de `trackChatUsage()` (après le `}`)

```javascript
// Track report generation (called when report is built/exported)
function trackReportGeneration() {
    const usage = getFreemiumUsage();
    
    if (usage.isPro) return { allowed: true, remaining: 999 };
    if (currentUserId === 'd5baabf1-147a-4ee5-a07a-8f80212fbc9a') {
        return { allowed: true, remaining: 999 };
    }
    
    // Check buffer
    if (usage.bufferUntil && new Date(usage.bufferUntil) > new Date()) {
        return { allowed: true, remaining: 999, buffered: true };
    }
    
    const limit = FREEMIUM_CONFIG.freeReports;
    usage.reportsGenerated = (usage.reportsGenerated || 0) + 1;
    saveFreemiumUsage(usage);
    
    const remaining = Math.max(0, limit - usage.reportsGenerated);
    
    return {
        allowed: usage.reportsGenerated <= limit,
        remaining: remaining,
        total: limit,
        used: usage.reportsGenerated,
        showUpgrade: usage.reportsGenerated > limit
    };
}
window.trackReportGeneration = trackReportGeneration;
```

### ÉTAPE 4E — Remplacer `canSendChat()`
**LIGNE 18706** — Remplacer TOUTE la fonction

```javascript
function canSendChat(panel) {
    const usage = getFreemiumUsage();
    if (usage.isPro) return { allowed: true, remaining: 999 };
    if (currentUserId === 'd5baabf1-147a-4ee5-a07a-8f80212fbc9a') {
        return { allowed: true, remaining: 999 };
    }
    
    // Check buffer
    if (usage.bufferUntil && new Date(usage.bufferUntil) > new Date()) {
        return { allowed: true, remaining: 999, buffered: true };
    }
    if ((usage.bufferQueries || 0) > 0) {
        return { allowed: true, remaining: usage.bufferQueries, buffered: true };
    }
    
    if (panel === 'copilot') {
        const limit = FREEMIUM_CONFIG.freeCopilotChats;
        const remaining = Math.max(0, limit - (usage.copilotChats || 0));
        return { allowed: remaining > 0, remaining, total: limit, used: usage.copilotChats || 0 };
    } else {
        return { allowed: true, remaining: 999 };
    }
}
```

### ÉTAPE 4F — Remplacer `showUpgradeModal()`
**LIGNE 18732** — Remplacer TOUTE la fonction (c'est une grosse fonction avec un switch/case)

```javascript
function showUpgradeModal(context = 'generic') {
    const overlay = document.getElementById('upgradeOverlay');
    const title = document.getElementById('upgradeTitle');
    const subtitle = document.getElementById('upgradeSubtitle');
    
    // Always same message — referral-first
    title.textContent = 'Vous êtes un power user ! 🔥';
    subtitle.textContent = 'Vous avez atteint votre limite gratuite cette semaine';
    
    overlay.classList.add('show');
    console.log('[Freemium] Unified modal shown:', context);
}
```

### ÉTAPE 4G — Remplacer `closeUpgradeModal()`
**LIGNE 18787** — Remplacer TOUTE la fonction

```javascript
function closeUpgradeModal(event) {
    if (event && event.target && event.target.id !== 'upgradeOverlay') return;
    document.getElementById('upgradeOverlay').classList.remove('show');
}
```

### ÉTAPE 4H — Remplacer `handleUpgradeClick()`
**LIGNE 18793** — Remplacer TOUTE la fonction

```javascript
function handleUpgradeClick() {
    console.log('[Freemium] Upgrade clicked — toast admin contact');
    closeUpgradeModal();
    closePendingPopup();
    closeInviteConfirmPopup();
    
    // Temporaire — pas de Stripe encore
    toast('✅ Demande enregistrée — un administrateur vous contactera très rapidement');
    
    // TODO: Quand Stripe prêt, décommenter :
    // window.open(FREEMIUM_CONFIG.upgradeUrl, '_blank');
}
```

### ÉTAPE 4I — Remplacer `showUpgradeBanner()`
**LIGNE 18810** — Remplacer TOUTE la fonction

```javascript
function showUpgradeBanner(panel, remaining) {
    const chatBody = document.getElementById(panel + 'Body');
    if (!chatBody) return;
    if (chatBody.querySelector('.upgrade-banner')) return;
    
    const banner = document.createElement('div');
    banner.className = 'upgrade-banner';
    banner.innerHTML = `
        <div class="upgrade-banner-content">
            <div class="upgrade-banner-title">Vous approchez de votre limite hebdomadaire</div>
            <div class="upgrade-banner-text">Passez à Pro pour un accès illimité</div>
        </div>
        <button class="upgrade-banner-btn" onclick="showUpgradeModal('banner_click')">Passer à Pro</button>
    `;
    
    chatBody.appendChild(banner);
    chatBody.scrollTop = chatBody.scrollHeight;
}
```

### ÉTAPE 4J — Ajouter les NOUVELLES FONCTIONS (après `initFreemium` ligne 18847)
**Insérer AVANT** la ligne `window.showUpgradeModal = showUpgradeModal;` (ligne 18849)

```javascript
// ═══ NEW: Invite flow handler ═══
function handleInviteClick() {
    // Close any open modals
    closeUpgradeModal();
    closePendingPopup();
    
    // Open WhatsApp with contextual message
    shareOnWhatsAppWithVariant();
    
    // Grant immediate buffer (+5 queries OR 24h)
    grantInviteBuffer();
    
    // Show confirmation popup after short delay
    setTimeout(() => {
        showInviteConfirmPopup();
    }, 500);
}

// WhatsApp message with rotation (avoid same text to 5 people)
function shareOnWhatsAppWithVariant() {
    const link = getReferralLink();
    const variant = Math.floor(Math.random() * 3);
    
    let message;
    switch(variant) {
        case 0:
            message = `Salut ! Je viens de trouver un truc pour les dépannages CVC — diagnostic IA + rapports auto en 30 secondes. C'est trop con de garder ça pour moi.\nTeste avec mon lien, on gagne tous les deux 1 semaine gratuite : ${link}`;
            break;
        case 1:
            message = `Hey ! Je te partage un outil que j'utilise sur le terrain (diagnostic + rapports auto). Je t'offre 1 semaine gratuite pour tester :\n${link}\nTeste-le maintenant sur un vrai dépannage.`;
            break;
        case 2:
            message = `Salut ! Tu connais FixAIR ? C'est un assistant IA pour les techs CVC — tu lui donnes un code erreur et il te sort le diagnostic + le rapport. Ça m'a changé la vie.\nEssaie gratuit : ${link}`;
            break;
    }
    
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    trackReferralShare('whatsapp');
}

// Grant immediate buffer after invite sent
function grantInviteBuffer() {
    const usage = getFreemiumUsage();
    
    // Option 1: +5 queries
    usage.bufferQueries = (usage.bufferQueries || 0) + FREEMIUM_CONFIG.bufferQueriesOnInvite;
    
    // Option 2: 24h access
    const bufferEnd = new Date();
    bufferEnd.setHours(bufferEnd.getHours() + FREEMIUM_CONFIG.bufferHoursOnInvite);
    usage.bufferUntil = bufferEnd.toISOString();
    
    // Track invites
    usage.invitesSentThisWeek = (usage.invitesSentThisWeek || 0) + 1;
    
    saveFreemiumUsage(usage);
    console.log('[Referral] Buffer granted: +5 queries + 24h access');
}

// Show post-invite confirmation popup
function showInviteConfirmPopup() {
    const popup = document.getElementById('inviteConfirmPopup');
    if (popup) popup.classList.add('show');
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
        closeInviteConfirmPopup();
    }, 8000);
}

function closeInviteConfirmPopup() {
    const popup = document.getElementById('inviteConfirmPopup');
    if (popup) popup.classList.remove('show');
}

// Show pending referral popup (on app re-open if no conversions)
function showPendingReferralPopup() {
    const usage = getFreemiumUsage();
    
    // Only show if user has sent invites but no conversions
    if ((usage.invitesSentThisWeek || 0) === 0) return;
    if (referralState.totalReferrals > 0) return; // Already got conversions
    
    // Rotate micro-copy
    const variants = [
        'Plus tu partages, plus tu débloques vite ton accès gratuit.',
        'Un seul collègue qui s\'inscrit = 1 semaine gratuite pour vous deux.',
        'Les meilleurs retours viennent souvent du 2e ou 3e collègue invité.'
    ];
    const microCopy = document.getElementById('pendingMicroCopy');
    if (microCopy) {
        microCopy.textContent = variants[Math.floor(Math.random() * variants.length)];
    }
    
    const popup = document.getElementById('referralPendingPopup');
    if (popup) popup.classList.add('show');
}

function closePendingPopup() {
    const popup = document.getElementById('referralPendingPopup');
    if (popup) popup.classList.remove('show');
}

// ═══ SPRINT CHALLENGE (Day 3+) ═══
function checkSprintChallenge() {
    if (!currentUser || !currentUser.created_at) return;
    
    const usage = getFreemiumUsage();
    if (usage.isPro) return;
    
    // Calculate days since signup
    const signupDate = new Date(currentUser.created_at);
    const now = new Date();
    const daysSinceSignup = Math.floor((now - signupDate) / (1000 * 60 * 60 * 24));
    
    // Show after day 3
    if (daysSinceSignup < FREEMIUM_CONFIG.sprintShowAfterDays) return;
    
    // Don't show if already completed sprint (ambassador = 3+ referrals)
    if (referralState.isAmbassador) return;
    
    // Don't show if already dismissed today
    const lastDismissed = localStorage.getItem('fixair_sprint_dismissed');
    if (lastDismissed) {
        const dismissed = new Date(lastDismissed);
        const hoursSince = (now - dismissed) / (1000 * 60 * 60);
        if (hoursSince < 24) return;
    }
    
    // Inject sprint banner into homepage
    injectSprintBanner();
}

function injectSprintBanner() {
    const homepage = document.getElementById('homepageContent');
    if (!homepage) return;
    if (homepage.querySelector('.sprint-banner')) return;
    
    const completed = referralState.totalReferrals || 0;
    const target = FREEMIUM_CONFIG.sprintTarget;
    
    const banner = document.createElement('div');
    banner.className = 'sprint-banner';
    banner.onclick = function() { showUpgradeModal('sprint'); };
    banner.innerHTML = `
        <div class="sprint-banner-header">
            <span class="sprint-banner-emoji">⚡</span>
            <span class="sprint-banner-title">Défi 10 jours</span>
        </div>
        <div class="sprint-banner-desc">
            Invite ${target} techniciens CVC qui s'inscrivent → 2 mois FixAIR offerts (100€ de valeur)<br>
            <strong>${completed}/${target} complétés</strong>
        </div>
        <button class="sprint-banner-cta" onclick="event.stopPropagation(); handleInviteClick();">
            🎯 Inviter maintenant
        </button>
    `;
    
    // Insert at top of homepage content
    homepage.insertBefore(banner, homepage.firstChild);
}

// ═══ RE-ENTRY PROMPT (returning users) ═══
function showReentryPrompt(panel) {
    const chatBody = document.getElementById(panel + 'Body');
    if (!chatBody) return;
    if (chatBody.querySelector('.reentry-prompt')) return;
    if (chatBody.children.length > 1) return; // Only on empty chat
    
    const examples = [
        { code: 'E1', brand: 'Daikin', desc: 'Défaut capteur température extérieure' },
        { code: 'F3', brand: 'Mitsubishi', desc: 'Erreur débit réfrigérant faible' },
        { code: 'H6', brand: 'Panasonic', desc: 'Défaut compresseur position locked' },
        { code: 'L5', brand: 'Toshiba', desc: 'Surcharge instantanée' }
    ];
    const ex = examples[Math.floor(Math.random() * examples.length)];
    
    const prompt = document.createElement('div');
    prompt.className = 'reentry-prompt';
    prompt.onclick = function() {
        const input = document.getElementById(panel + 'Input');
        if (input) {
            input.value = `Code erreur ${ex.code} sur ${ex.brand} — diagnostic ?`;
            input.dispatchEvent(new Event('input'));
            prompt.remove();
        }
    };
    prompt.innerHTML = `
        <div style="font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 4px;">
            🔧 Un diagnostic rapide ?
        </div>
        <div style="font-size: 12px; color: var(--text-dim); line-height: 1.4;">
            Exemple : <strong>Code ${ex.code} ${ex.brand}</strong> — ${ex.desc}<br>
            <span style="color: var(--copilot); font-weight: 500;">Cliquez pour tester →</span>
        </div>
    `;
    
    chatBody.appendChild(prompt);
}

// Check week_free_granted_at from Supabase
async function checkWeekFreeStatus() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) return false;
        
        const { data, error } = await db
            .from('users')
            .select('week_free_granted_at, completed_referrals, is_ambassador')
            .eq('id', userId)
            .single();
        
        if (error || !data || !data.week_free_granted_at) return false;
        
        const grantedAt = new Date(data.week_free_granted_at);
        const now = new Date();
        
        // Ambassador (3+ referrals) gets 60 days
        const freeDays = data.is_ambassador ? 60 : 7;
        const expiresAt = new Date(grantedAt);
        expiresAt.setDate(expiresAt.getDate() + freeDays);
        
        if (now < expiresAt) {
            // Still in free period — update local cache
            const usage = getFreemiumUsage();
            usage.isPro = true;  // Treat as pro temporarily
            saveFreemiumUsage(usage);
            console.log(`[Referral] Free period active — ${freeDays} days from ${grantedAt.toISOString()}`);
            return true;
        }
        
        return false;
    } catch (e) {
        console.warn('[Referral] Error checking week free status:', e);
        return false;
    }
}

// Expose all new functions
window.handleInviteClick = handleInviteClick;
window.shareOnWhatsAppWithVariant = shareOnWhatsAppWithVariant;
window.grantInviteBuffer = grantInviteBuffer;
window.showInviteConfirmPopup = showInviteConfirmPopup;
window.closeInviteConfirmPopup = closeInviteConfirmPopup;
window.showPendingReferralPopup = showPendingReferralPopup;
window.closePendingPopup = closePendingPopup;
window.checkSprintChallenge = checkSprintChallenge;
window.showReentryPrompt = showReentryPrompt;
window.checkWeekFreeStatus = checkWeekFreeStatus;
```

### ÉTAPE 4K — Modifier `sendMsg()` freemium check
**LIGNE 16164** — Trouver le bloc commenté `// ═══ FREEMIUM CHECK`

**REMPLACER** les lignes 16164-16178 par :

```javascript
// ═══ FREEMIUM CHECK: Track usage and show upgrade if needed ═══
if (typeof trackChatUsage === 'function') {
    const usageResult = trackChatUsage(panel);
    
    // Hard limit → Show unified popup (referral-first)
    if (usageResult.showUpgrade && !usageResult.allowed) {
        showUpgradeModal('limit');
        return; // Don't send the message
    }
    
    // Soft warning → Show banner (message still sends)
    if (usageResult.showWarning) {
        showUpgradeBanner(panel, usageResult.remaining);
    }
}
// ═══ END FREEMIUM CHECK ═══
```

### ÉTAPE 4L — Remplacer `showReferralModal()` et `closeReferralModal()`
**LIGNE 18950** — Remplacer les deux fonctions par des wrappers

```javascript
// Legacy wrappers → redirect to unified modal
function showReferralModal(context) {
    showUpgradeModal(context || 'limit');
}

function closeReferralModal(event) {
    closeUpgradeModal(event);
}
```

### ÉTAPE 4M — Modifier `getWhatsAppMessage()` 
**LIGNE 18879** — Remplacer la fonction

```javascript
function getWhatsAppMessage() {
    const link = getReferralLink();
    const message = `Salut ! Je viens de trouver un truc pour les dépannages CVC — diagnostic IA + rapports auto en 30 secondes. C'est trop con de garder ça pour moi.\nTeste avec mon lien, on gagne tous les deux 1 semaine gratuite : ${link}`;
    return encodeURIComponent(message);
}
```

### ÉTAPE 4N — Ajouter les appels dans `initFreemium()`
**LIGNE 18838** — Remplacer la fonction `initFreemium` complète

```javascript
async function initFreemium() {
    console.log('[Freemium] Initializing...');
    
    // Check subscription status from database
    await checkSubscriptionStatus();
    
    // Check if user has active free period from referral
    await checkWeekFreeStatus();
    
    const usage = getFreemiumUsage();
    console.log('[Freemium] Current usage:', usage);
    
    // Check if should show pending referral popup
    setTimeout(() => {
        showPendingReferralPopup();
    }, 2000);
    
    // Check sprint challenge eligibility
    setTimeout(() => {
        checkSprintChallenge();
    }, 3000);
    
    // Show re-entry prompt on copilot if returning user
    setTimeout(() => {
        showReentryPrompt('copilot');
    }, 1500);
}
```

### ÉTAPE 4O — Ajouter report tracking dans `buildPartialReport()`
**LIGNE 12977** — Au DÉBUT de la fonction `buildPartialReport()`, ajouter ces lignes APRÈS le `{` :

```javascript
// Track report generation for freemium (first time this project builds report)
if (typeof trackReportGeneration === 'function') {
    const reportCheck = trackReportGeneration();
    if (reportCheck.showUpgrade && !reportCheck.allowed) {
        showUpgradeModal('report_limit');
        return;
    }
}
```

**⚠️ ATTENTION** : `buildPartialReport()` est appelée souvent (à chaque message assistant). Le `trackReportGeneration()` incrémente à chaque appel. Pour éviter le double-comptage, modifier `trackReportGeneration()` pour ne compter qu'une fois par projet :

**Modifier** `trackReportGeneration()` (ajouté en 4D) pour ajouter cette logique :

```javascript
function trackReportGeneration() {
    const usage = getFreemiumUsage();
    
    if (usage.isPro) return { allowed: true, remaining: 999 };
    if (currentUserId === 'd5baabf1-147a-4ee5-a07a-8f80212fbc9a') {
        return { allowed: true, remaining: 999 };
    }
    
    // Check buffer
    if (usage.bufferUntil && new Date(usage.bufferUntil) > new Date()) {
        return { allowed: true, remaining: 999, buffered: true };
    }
    
    // Only count ONCE per project (avoid double-counting from buildPartialReport)
    const projectId = currentProjectId; // Global variable
    if (!usage.reportProjects) usage.reportProjects = [];
    if (usage.reportProjects.includes(projectId)) {
        // Already counted this project
        const limit = FREEMIUM_CONFIG.freeReports;
        const remaining = Math.max(0, limit - usage.reportsGenerated);
        return {
            allowed: usage.reportsGenerated <= limit,
            remaining: remaining,
            showUpgrade: usage.reportsGenerated > limit
        };
    }
    
    // New project — count it
    usage.reportProjects.push(projectId);
    
    const limit = FREEMIUM_CONFIG.freeReports;
    usage.reportsGenerated = (usage.reportsGenerated || 0) + 1;
    saveFreemiumUsage(usage);
    
    const remaining = Math.max(0, limit - usage.reportsGenerated);
    
    return {
        allowed: usage.reportsGenerated <= limit,
        remaining: remaining,
        total: limit,
        used: usage.reportsGenerated,
        showUpgrade: usage.reportsGenerated > limit
    };
}
window.trackReportGeneration = trackReportGeneration;
```

### ÉTAPE 4P — Fix bug existant : `showToast` → `toast`
**LIGNES 18905, 18914, 18923, 18932** — La fonction `showToast()` N'EXISTE PAS dans le code. La vraie fonction est `toast()` (ligne 7429).

**Remplacer les 4 occurrences de** `showToast(` **par** `toast(` :
- Ligne 18905 : `showToast('Code copié !', 'success')` → `toast('Code copié !')`
- Ligne 18914 : `showToast('Code copié !', 'success')` → `toast('Code copié !')`
- Ligne 18923 : `showToast('Lien copié !', 'success')` → `toast('Lien copié !')`
- Ligne 18932 : `showToast('Lien copié !', 'success')` → `toast('Lien copié !')`

---

## ❌ NE PAS TOUCHER — Liste complète

| Élément | Lignes | Raison |
|---------|--------|--------|
| `referralState` object | 18864-18869 | Utilisé partout |
| `getReferralLink()` | 18873-18876 | OK tel quel |
| `shareOnWhatsApp()` | 18886-18892 | Gardé comme fallback |
| `shareOnWhatsAppFromModal()` | 18895-18898 | Utilisé dans le nouveau popup |
| `copyReferralCode()` | 18900-18916 | Profil |
| `copyReferralLink()` | 18919-18938 | Profil |
| `trackReferralShare()` | 18941-18947 | Analytics |
| `loadReferralData()` | 18972-19003 | Charge Supabase |
| `updateReferralUI()` | 19005-19021 | Met à jour profil |
| `ensureReferralCode()` | 19024-19067 | Génère code |
| `initReferral()` | 19070-19082 | Init |
| `getFreemiumUsage()` | 18577-18596 | Lecture localStorage |
| `saveFreemiumUsage()` | 18611-18617 | Sauvegarde localStorage |
| `getFreemiumWeekStart()` | 18619-18626 | Calcul lundi |
| `checkSubscriptionStatus()` | 18629-18667 | Query Supabase |
| `canUseProFeature()` | 18728-18731 | Export PDF/Word |
| Section profil referral HTML | 6257-6300 | Ne pas toucher |
| CSS `.referral-section` | 5435-5572 | Ne pas toucher |
| Toast function `toast()` | 7429 | Ne pas toucher |
| Tout le code export Word/PDF | 11276-15400 | Ne pas toucher |
| Tout le code chat/AI | 14500-16500 | Sauf le sendMsg check |

---

## 🧪 TESTS (Copier-coller dans Console F12)

### Test 1 : Popup apparaît après 20 Copilot queries
```javascript
localStorage.setItem('fixair_freemium_usage', JSON.stringify({
    weekStart: new Date().toISOString(),
    copilotChats: 20, assistantChats: 0, reportsGenerated: 0,
    bufferQueries: 0, bufferUntil: null, isPro: false,
    lastChecked: new Date().toISOString(), invitesSentThisWeek: 0
}));
location.reload();
// Envoyer un message Copilot → POPUP doit apparaître
```

### Test 2 : Popup apparaît après 3 rapports
```javascript
localStorage.setItem('fixair_freemium_usage', JSON.stringify({
    weekStart: new Date().toISOString(),
    copilotChats: 5, assistantChats: 0, reportsGenerated: 3,
    reportProjects: ['proj1','proj2','proj3'],
    bufferQueries: 0, bufferUntil: null, isPro: false,
    lastChecked: new Date().toISOString(), invitesSentThisWeek: 0
}));
location.reload();
// Envoyer un message Assistant et créer un rapport → POPUP doit apparaître
```

### Test 3 : Buffer fonctionne après invite
```javascript
// Simuler un invite envoyé avec buffer
const usage = JSON.parse(localStorage.getItem('fixair_freemium_usage'));
usage.copilotChats = 20; // At limit
usage.bufferQueries = 5; // +5 from invite
const bufferEnd = new Date();
bufferEnd.setHours(bufferEnd.getHours() + 24);
usage.bufferUntil = bufferEnd.toISOString();
localStorage.setItem('fixair_freemium_usage', JSON.stringify(usage));
location.reload();
// Messages doivent passer (buffer actif)
```

### Test 4 : Pro user bypass
```javascript
localStorage.setItem('fixair_freemium_usage', JSON.stringify({
    weekStart: new Date().toISOString(),
    copilotChats: 999, assistantChats: 999, reportsGenerated: 999,
    bufferQueries: 0, bufferUntil: null, isPro: true,
    lastChecked: new Date().toISOString(), invitesSentThisWeek: 0
}));
location.reload();
// Tout doit passer sans popup
```

### Test 5 : Bannière douce à 16 queries
```javascript
localStorage.setItem('fixair_freemium_usage', JSON.stringify({
    weekStart: new Date().toISOString(),
    copilotChats: 15, assistantChats: 0, reportsGenerated: 0,
    bufferQueries: 0, bufferUntil: null, isPro: false,
    lastChecked: new Date().toISOString(), invitesSentThisWeek: 0
}));
location.reload();
// Envoyer un message → message envoyé + bannière verte subtile apparaît
```

### Test 6 : WhatsApp s'ouvre avec le bon message
```javascript
// Cliquer "Inviter un collègue" dans le popup
// WhatsApp doit s'ouvrir avec un message en français naturel
// Le message doit contenir le lien go.fixair.ai/r/{code}
```

### Test 7 : Light theme
```javascript
document.documentElement.setAttribute('data-theme', 'light');
// Vérifier que popup + banner sont lisibles
```

---

## 📋 RÉSUMÉ COMPLET DES MODIFICATIONS

| # | Quoi | Action | Lignes |
|---|------|--------|--------|
| 1 | SQL : colonnes users | ADD | Supabase |
| 2 | SQL : trigger referral bonus | CREATE | Supabase |
| 3 | CSS : upgrade overlay + banner | REMPLACER | 5202–5430 |
| 4 | CSS : referral modal | SUPPRIMER | 5574–5700 |
| 5 | HTML : 2 modals → 1 unifié + 2 popups | REMPLACER | 5748–5840 |
| 6 | JS : FREEMIUM_CONFIG | REMPLACER | 18557 |
| 7 | JS : createFreshUsage() | REMPLACER | 18598 |
| 8 | JS : trackChatUsage() | REMPLACER | 18670 |
| 9 | JS : trackReportGeneration() | AJOUTER | après 18700 |
| 10 | JS : canSendChat() | REMPLACER | 18706 |
| 11 | JS : showUpgradeModal() | REMPLACER | 18732 |
| 12 | JS : closeUpgradeModal() | REMPLACER | 18787 |
| 13 | JS : handleUpgradeClick() | REMPLACER | 18793 |
| 14 | JS : showUpgradeBanner() | REMPLACER | 18810 |
| 15 | JS : initFreemium() | REMPLACER | 18838 |
| 16 | JS : 12 nouvelles fonctions | AJOUTER | après 18847 |
| 17 | JS : sendMsg() freemium check | MODIFIER | 16164–16178 |
| 18 | JS : showReferralModal() wrapper | REMPLACER | 18950 |
| 19 | JS : closeReferralModal() wrapper | REMPLACER | 18967 |
| 20 | JS : getWhatsAppMessage() | REMPLACER | 18879 |
| 21 | JS : showToast → toast (bugfix) | FIX | 18905,14,23,32 |
| 22 | JS : buildPartialReport() | MODIFIER | 12977 (ajouter 5 lignes au début) |

**Total : 22 modifications. 12 nouvelles fonctions. 3 nouveaux éléments HTML. 0 changement Supabase schema existant (seulement ajouts).**
