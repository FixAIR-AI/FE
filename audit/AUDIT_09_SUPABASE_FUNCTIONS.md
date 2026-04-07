# AUDIT_09 - Supabase Functions

## Edge Functions

### send-invite
**Called from:** admin/index.html:2338, manager/index.html:2411
**Endpoint:** `${SUPABASE_URL}/functions/v1/send-invite`
**Purpose:** Send team invitation emails to new users
**Authentication:** Bearer token (SUPABASE_ANON_KEY)
**Payload:**
```json
{
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "companyId": "string",
  "invitedBy": "string"
}
```

---

## Database Functions (RPC)

### increment_link_clicks
**Called from:** r/index.html:648
**Purpose:** Atomically increment the link_clicks counter on a referral record
**Usage:** `sb.rpc('increment_link_clicks')`

### generate_referral_code(user_first_name TEXT) → TEXT
**Source:** docs/REFERRAL-DATABASE-SCHEMA.sql:137-174
**Purpose:** Creates a unique referral code from user's first name + random 4 digits
**Logic:**
1. Clean first name to lowercase alpha only
2. Truncate to 10 chars max
3. Append random 4-digit number
4. Check uniqueness, retry if collision
5. Fallback to UUID-based code after 100 retries

### grant_referral_bonus(p_referral_id UUID, p_bonus_amount INTEGER = 30) → BOOLEAN
**Source:** docs/REFERRAL-DATABASE-SCHEMA.sql:181-228
**Purpose:** Grant bonus queries to both referrer and referee
**Security:** SECURITY DEFINER (runs with elevated privileges)
**Logic:**
1. Verify referral exists and is 'completed'
2. Grant bonus_queries to referrer (+30)
3. Grant bonus_queries to referee (+30)
4. Increment referrer's total_referrals
5. Check milestone achievements

### check_referral_milestones(p_user_id UUID) → VOID
**Source:** docs/REFERRAL-DATABASE-SCHEMA.sql:235-272
**Purpose:** Check and grant milestone achievements based on referral count
**Milestones:**
| Count | Milestone | Reward |
|-------|-----------|--------|
| 1+ | first_referral | Badge |
| 3+ | ambassador | is_ambassador = true |
| 5+ | super_referrer | Badge |
| 10+ | legend | Badge |

---

## Database Triggers

### auto_generate_referral_code
**Source:** docs/REFERRAL-DATABASE-SCHEMA.sql:278-293
**Table:** users
**Event:** BEFORE INSERT
**Function:** trigger_generate_user_referral_code()
**Purpose:** Auto-generate a referral code when a new user is created

---

## Note on Database Functions

The frontend code primarily interacts with Supabase through the JS client library's `.from().select()/insert()/update()/delete()` methods. Very few RPC calls are made directly. Most business logic runs either:
1. **In the browser** (mergeReportData, buildPartialReport, etc.)
2. **In n8n webhooks** (AI processing, email sending, approval workflow)
3. **In Supabase Edge Functions** (send-invite)

This means there is limited server-side validation of data. The frontend is responsible for data integrity, which is a significant architectural concern.
