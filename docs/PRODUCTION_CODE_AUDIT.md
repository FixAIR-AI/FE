# FixAIR Production Code Audit

**Audit Date:** 2026-01-25
**Branch:** `main` (deployed to go.fixair.ai)
**Audited Files:**
- `/technician/index.html`
- `/admin/index.html`
- `/manager/index.html`
- `/master/index.html`
- `/auth/index.html`
- `/invite/index.html`

---

## 1. Supabase Configuration

All apps share the same Supabase instance:
```javascript
SUPABASE_URL: 'https://fwuhzraxqrvmpqxnzpqm.supabase.co'
SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

## 2. Supabase Table Queries by Application

### 2.1 Auth App (`/auth/index.html`)

| Table | Operation | Columns Selected | Purpose |
|-------|-----------|------------------|---------|
| `users` | SELECT | `id, role, status, first_name` | Check if email exists during login |
| `users` | SELECT | `*` | Get user profile after auth |
| `users` | UPSERT | `email, status, created_at, updated_at` | Progressive lead capture (incomplete users) |
| `users` | UPDATE | `role, updated_at` | Save user type selection |
| `users` | UPSERT | `auth_id, email, first_name, last_name, phone, role, member_type, status, live_status` | Create technician/enterprise account |
| `users` | SELECT | `role` | Determine redirect URL for password reset |
| `users` | SELECT | `role, status, first_name, email` | Check approval status |
| `users` | SELECT | `role, status, email` | Session check |
| `users` | SELECT | `id, status, role` | Verify user on re-entry |

### 2.2 Invite App (`/invite/index.html`)

| Table | Operation | Columns Selected | Purpose |
|-------|-----------|------------------|---------|
| `invitations` | SELECT | `*` | Validate invitation token |
| `users` | SELECT | `first_name, last_name, company_name` | Get inviter info |
| `users` | UPSERT | `auth_id, email, first_name, last_name, phone, role, member_type, manager_id, status, live_status` | Create invited user account |
| `invitations` | UPDATE | `status, accepted_at` | Mark invitation as accepted |

### 2.3 Technician App (`/technician/index.html`)

| Table | Operation | Columns Selected | Purpose |
|-------|-----------|------------------|---------|
| `app_settings` | SELECT | `value` | Get API keys |
| `users` | SELECT | `id, email, first_name, status, role` | User lookup during login |
| `users` | SELECT | `id` | Get user ID from auth_id |
| `users` | SELECT | `*` | Load full user profile |
| `users` | UPDATE | `first_name, last_name, phone, company_name, brand, updated_at` | Save profile changes |
| `users` | UPDATE | `live_status, updated_at` | Update online/idle/offline status |
| `users` | UPDATE | `onboarding_done, updated_at` | Mark onboarding complete |
| `projects` | SELECT | `original_brand, brand` | Get project brand |
| `projects` | SELECT | `id, title, brand, original_brand, status, created_at, updated_at, extracted_data` | Load projects list |
| `projects` | SELECT | `photos` | Load project photos |
| `projects` | INSERT | `user_id, title, brand, original_brand, status, created_at, updated_at` | Create new project |
| `projects` | UPDATE | `title` | Rename project |
| `projects` | UPDATE | `extracted_data` | Auto-save report data |
| `projects` | UPDATE | `status` | Mark project as completed |
| `projects` | UPDATE | `photos` | Save photos to project |
| `projects` | DELETE | - | Delete project |
| `chats` | SELECT | `id, chat_type, project_id, started_at` | Load chats list |
| `chats` | INSERT | `project_id, user_id, chat_type, started_at` | Create new chat |
| `chats` | DELETE | - | Delete chat |
| `messages` | SELECT | `*` | Load chat messages |
| `messages` | SELECT | `content, role` | Get messages for context |
| `messages` | INSERT | `chat_id, role, content, content_type, thought_process, thought_summary, created_at` | Save message |
| `messages` | DELETE | - | Delete messages |
| `reports` | INSERT | `project_id, user_id, content, created_at` | Save completed report |
| `user_actions` | INSERT | `user_id, action_type, minutes_saved, euros_saved, timestamp` | Track AI actions for ROI |
| `user_actions` | SELECT | `action_type, minutes_saved, euros_saved` | Calculate usage statistics |
| `calendar_events` | SELECT | `*` | Load calendar events |
| `calendar_events` | INSERT | `user_id, title, date, start_time, end_time, type, notes, project_id` | Create event |
| `calendar_events` | UPDATE | `title, date, start_time, end_time, type, notes, project_id` | Update event |
| `calendar_events` | DELETE | - | Delete event |

### 2.4 Manager App (`/manager/index.html`)

| Table | Operation | Columns Selected | Purpose |
|-------|-----------|------------------|---------|
| `users` | SELECT | `id, first_name, status, role` | Check manager auth |
| `users` | SELECT | `*` | Load user profile |
| `users` | SELECT | `*` | Load internal team members (where `manager_id = currentUserId`) |
| `projects` | SELECT | `id, title, client_name, status, brand` | Load projects for team |
| `team_messages` | SELECT | `*` | Load team messages |
| `availability_shares` | SELECT | `*, technician:technician_id(*)` | Load pending availability shares |
| `availability_shares` | SELECT | `id, technician_id, status, ...technician:users!technician_id(id, first_name, last_name, email, avatar_url)` | Get share with technician details |
| `availability_shares` | UPDATE | `status, accepted_at, accepted_by_manager_id` | Accept share |
| `availability_shares` | UPDATE | `status` | Reject share |
| `calendar_events` | INSERT | `user_id, title, date, start_time, end_time, type, notes, visible_to_manager_id` | Create calendar event from share |
| `team_messages` | INSERT | `sender_id, receiver_id, content, sent_at` | Send team message |
| `invitations` | INSERT | `email, first_name, last_name, phone, role, member_type, inviter_id, token, status, created_at, expires_at` | Create technician invitation |

### 2.5 Admin App (`/admin/index.html`)

| Table | Operation | Columns Selected | Purpose |
|-------|-----------|------------------|---------|
| `users` | SELECT | `id, first_name, status, role` | Check admin auth |
| `users` | SELECT | `*` | Load user profile |
| `users` | SELECT | `*` | Load internal team members (where `manager_id = currentUserId`) |
| `projects` | SELECT | `id, title, client_name, status, brand` | Load projects for team |
| `team_messages` | SELECT | `*` | Load team messages |
| `availability_shares` | SELECT | `*, technician:technician_id(*)` | Load pending availability shares |
| `availability_shares` | SELECT | `id, technician_id, status, ...technician:users!technician_id(...)` | Get share with technician details |
| `availability_shares` | UPDATE | `status, accepted_at, accepted_by_manager_id` | Accept share |
| `availability_shares` | UPDATE | `status` | Reject share |
| `calendar_events` | INSERT | `user_id, title, date, start_time, end_time, type, notes, visible_to_manager_id` | Create calendar event from share |
| `team_messages` | INSERT | `sender_id, receiver_id, content, sent_at` | Send team message |
| `invitations` | INSERT | `email, first_name, last_name, phone, role, member_type, inviter_id, token, status, created_at, expires_at` | Create technician invitation |

### 2.6 Master App (`/master/index.html`)

| Table | Operation | Columns Selected | Purpose |
|-------|-----------|------------------|---------|
| `users` | SELECT | `*` | Load all users for admin view |
| `users` | SELECT | `*` | Get specific user details |
| `users` | SELECT | `id, first_name, email, role` | Get inviter info for display |

---

## 3. n8n Webhook Endpoints

### 3.1 Technician App

| Webhook URL | Purpose |
|-------------|---------|
| `https://cherhabil.app.n8n.cloud/webhook/fixair-copilot` | Copilot AI panel (diagnosis mode) |
| `https://cherhabil.app.n8n.cloud/webhook/fixair-assistant` | Assistant AI panel (report mode) |
| `https://cherhabil.app.n8n.cloud/webhook/fixair-ocr` | OCR/Vision processing for photos |
| `https://cherhabil.app.n8n.cloud/webhook` | API base URL |

### 3.2 Master App

| Webhook URL | Purpose |
|-------------|---------|
| `https://cherhabil.app.n8n.cloud/webhook/fixair-approval` | User approval/rejection notifications |
| `https://cherhabil.app.n8n.cloud/webhook/email-send` | Send custom emails to users |

---

## 4. Real-time Subscriptions

### 4.1 Manager App

| Channel | Table | Event | Filter | Purpose |
|---------|-------|-------|--------|---------|
| `team-status` | `users` | `UPDATE` | `manager_id=eq.${currentUserId}` | Watch team member status changes |
| `project-updates` | `projects` | `*` | - | Watch project changes |
| `team-messages` | `team_messages` | `INSERT` | - | Receive new team messages |
| `availability-shares` | `availability_shares` | `INSERT` | - | New availability share requests |

### 4.2 Admin App

| Channel | Table | Event | Filter | Purpose |
|---------|-------|-------|--------|---------|
| `team-status` | `users` | `UPDATE` | `manager_id=eq.${currentUserId}` | Watch team member status changes |
| `project-updates` | `projects` | `*` | - | Watch project changes |
| `team-messages` | `team_messages` | `INSERT` | - | Receive new team messages |
| `availability-shares` | `availability_shares` | `INSERT` | - | New availability share requests |

### 4.3 Technician App

**No real-time subscriptions** - Uses polling/manual refresh.

---

## 5. Admin vs Manager Feature Comparison

| Feature | Admin | Manager | Notes |
|---------|-------|---------|-------|
| View Team Members | YES | YES | Same implementation |
| View Projects | YES | YES | Same implementation |
| Invite Technicians | YES | YES | Same implementation |
| Accept/Reject Availability Shares | YES | YES | Same implementation |
| Send Team Messages | YES | YES | Same implementation |
| Real-time Subscriptions | YES | YES | Same channels |
| View Calendar | YES | YES | Same implementation |
| **Report Preview Drawer** | **NO** | **YES** | Manager has `openReportDrawer()` function |
| Login Flow | Identical | Identical | Both check role |
| Auth Screen Access | YES (`accessDeniedScreen`) | NO (different param) | Slight difference in error handling |

**Key Observation:** Admin and Manager apps are nearly IDENTICAL. The Manager app has a few extra features:
1. `openReportDrawer(id)` and `closeReportDrawer()` - Report preview modal
2. `buildReportPreview(data)` - Report preview builder
3. Slightly different line counts (~200 more lines)

---

## 6. Technician App - Manager Integration Gaps

### 6.1 Features MISSING in Technician App

| Feature | Status | Impact |
|---------|--------|--------|
| Share Availability with Manager | **MISSING** | Technicians cannot share their calendar |
| View Manager's Team Messages | **MISSING** | No team messaging |
| Real-time Status Updates | **PARTIAL** | Updates `live_status` but no subscription to receive |
| Manager Assignment Awareness | **MISSING** | No UI showing manager relationship |
| Receive Notifications from Manager | **MISSING** | No push/real-time from manager |

### 6.2 Features WORKING in Technician App

| Feature | Status |
|---------|--------|
| Personal Calendar | WORKING |
| Projects Management | WORKING |
| AI Chat (Copilot/Assistant) | WORKING |
| Photo Upload & OCR | WORKING |
| Report Generation | WORKING |
| Live Status Tracking | WORKING |
| User Actions/ROI Tracking | WORKING |
| Profile Management | WORKING |
| Onboarding Flow | WORKING |
| Brand Selection | WORKING |

### 6.3 Integration Architecture

```
┌────────────────┐     manager_id     ┌─────────────────┐
│   Technician   │ ◄────────────────► │ Manager/Admin   │
└────────────────┘                    └─────────────────┘
        │                                      │
        │ live_status                          │ realtime subscription
        ▼                                      ▼
┌────────────────┐                    ┌─────────────────┐
│    users       │                    │    users        │
│  (updates)     │                    │  (watches)      │
└────────────────┘                    └─────────────────┘
```

---

## 7. Database Schema (Inferred from Queries)

### `users` Table
```sql
id, auth_id, email, first_name, last_name, phone, company_name,
role, member_type, status, live_status, manager_id, brand,
avatar_url, onboarding_done, created_at, updated_at
```

### `projects` Table
```sql
id, user_id, title, client_name, brand, original_brand, status,
photos, extracted_data, created_at, updated_at
```

### `chats` Table
```sql
id, project_id, user_id, chat_type, started_at
```

### `messages` Table
```sql
id, chat_id, role, content, content_type, thought_process, thought_summary, created_at
```

### `reports` Table
```sql
id, project_id, user_id, content, created_at
```

### `invitations` Table
```sql
id, email, first_name, last_name, phone, role, member_type,
inviter_id, token, status, created_at, expires_at, accepted_at
```

### `availability_shares` Table
```sql
id, technician_id, status, accepted_at, accepted_by_manager_id
```

### `calendar_events` Table
```sql
id, user_id, title, date, start_time, end_time, type, notes,
project_id, visible_to_manager_id
```

### `team_messages` Table
```sql
id, sender_id, receiver_id, content, sent_at
```

### `user_actions` Table
```sql
id, user_id, action_type, minutes_saved, euros_saved, timestamp
```

### `app_settings` Table
```sql
key, value
```

---

## 8. Security Observations

1. **Supabase Anon Key** is exposed in client-side code (expected for public client)
2. **Row Level Security (RLS)** must be enabled on all tables (not visible in code)
3. **No client-side validation** before most DB operations
4. **Email is used as identifier** for user lookup (case-normalized)
5. **Invitation tokens** are UUIDs stored in query params

---

## 9. Key Differences Summary

### Auth Flow
- Auth app routes users to appropriate app based on role
- Each app has its own login screen that redirects to `/auth/` if no session

### Role Hierarchy
```
master > admin > manager > technician
```

### Member Types
- `standalone` - Independent technician/enterprise
- `internal` - Part of a team (has `manager_id`)

### User Statuses
- `incomplete` - Lead capture, not signed up
- `pending` - Awaiting approval
- `active`/`approved` - Full access
- `rejected` - Denied access
- `suspended` - Temporarily disabled

### Live Statuses
- `online` - User is active
- `idle` - User is inactive but has app open
- `offline` - User closed app

---

## 10. Recommendations

### High Priority
1. **Add Availability Sharing to Technician App** - Missing integration feature
2. **Add Team Messaging to Technician App** - Missing integration feature
3. **Add Real-time Subscriptions to Technician App** - For receiving manager updates

### Medium Priority
4. **Consolidate Admin/Manager Apps** - Nearly identical code, could be unified with role-based features
5. **Add Push Notifications** - For cross-app communication

### Low Priority
6. **Add Error Boundaries** - Better error handling in React-like components
7. **Implement Service Workers** - For offline support

---

*This audit is read-only and no code was modified.*
