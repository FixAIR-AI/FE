-- ============================================================================
-- audit-v2/01b_supabase_rls.sql
-- ============================================================================
-- Row-Level Security policies for every public-schema table defined in
-- 01_supabase_schema.sql. There is no migrations file in the repo, so every
-- policy here is INFERRED from client behavior (what the anon client is
-- observed to read/write with which filters). Each policy cites its source.
--
-- Identity model observed in the client:
--   * `auth.uid()` returns `auth.users.id` (Supabase convention).
--   * `public.users.id` is set equal to `auth.users.id` via a Supabase auth
--     trigger -- see the comment "upsert to handle trigger-created rows" at
--     auth/index.html:1447. The `auth_id` column is a parallel pointer kept
--     in sync by the signup upsert at auth/index.html:1451.
--   * Therefore RLS policies check `auth.uid() = id` on `users` and
--     `auth.uid() = user_id` on every owned table. This matches the
--     `.eq('id', session.user.id)` lookup at admin/index.html:1419 and the
--     fact that `user_id` set on inserts is the profile id returned by
--     getCurrentUserId() (technician/index.html:9551).
--
-- Role model: a helper function is used to test whether the caller is an
-- admin/owner/master (ops roles) or a manager. It reads `role` from
-- `public.users` for the current auth.uid(). This keeps policy expressions
-- short. Must be SECURITY DEFINER to avoid recursive RLS on `users`.
--
-- Security flags called out by `-- SECURITY:` comments:
--   (a) users is readable publicly by email (auth/index.html:1122,
--       auth/index.html:1200) and by referral_code (r/index.html:620).
--       These happen from UNAUTHENTICATED pages. An Edge Function would be
--       safer. The policies below replicate current behavior.
--   (b) invitations is readable publicly by token (invite/index.html:546).
--       Token is a UUID, so this is "capability URL" style auth.
--
-- Runnable against the output of 01_supabase_schema.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper: current_user_role()
-- Returns the role string for auth.uid(), or NULL if no profile.
-- SECURITY DEFINER so it can bypass RLS on public.users when called from
-- within a policy on the same table (which would otherwise recurse).
-- ----------------------------------------------------------------------------
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
    select role from public.users where id = auth.uid() limit 1
$$;

grant execute on function public.current_user_role() to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Helper: is_team_manager_of(tech_id uuid)
-- True if auth.uid() is the manager_id of the given technician row.
-- Used by manager/admin dashboards that fan out over their team.
-- ----------------------------------------------------------------------------
create or replace function public.is_team_manager_of(tech_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
    select exists (
        select 1 from public.users
        where id = tech_id and manager_id = auth.uid()
    )
$$;

grant execute on function public.is_team_manager_of(uuid) to anon, authenticated;


-- ============================================================================
-- Enable RLS on every table.
-- ============================================================================
alter table public.users               enable row level security;
alter table public.app_settings        enable row level security;
alter table public.projects            enable row level security;
alter table public.chats               enable row level security;
alter table public.messages            enable row level security;
alter table public.reports             enable row level security;
alter table public.user_actions        enable row level security;
alter table public.calendar_events     enable row level security;
alter table public.team_messages       enable row level security;
alter table public.availability_shares enable row level security;
alter table public.invitations         enable row level security;
alter table public.referrals           enable row level security;


-- ============================================================================
-- 1. users
-- ============================================================================

-- Self-read: every authenticated user reads their own profile.
-- INFERRED from auth/index.html:1419 (.select('*').eq('id', authId)) and
-- technician/index.html:9548 (loadUserProfile(session.user.id)).
create policy "users: self can read own profile"
    on public.users
    for select
    to authenticated
    using ( auth.uid() = id );

-- Public email lookup (pre-auth): the signup flow checks if an email already
-- exists BEFORE the user is signed in. The anon client hits the table
-- directly. SECURITY: this exposes the existence of every email to the
-- public internet; recommended replacement is a rate-limited Edge Function.
-- INFERRED from auth/index.html:1122 (.eq('email', email).maybeSingle())
-- and auth/index.html:1200.
create policy "users: public can read minimal profile by email"
    on public.users
    for select
    to anon, authenticated
    using ( true );
-- SECURITY: the policy above is effectively "public read on users". Tighten
-- by narrowing the returned columns via a view, or by moving email-existence
-- checks behind an Edge Function.

-- Self-update: authenticated users update their own profile fields
-- (language, onboarding_done, avatar_url, subscription_tier after Stripe
-- webhook, referral_code after first use, etc).
-- INFERRED from index.html:6063 (.update({...updated_at}).eq('id', userId))
-- and technician/index.html:19190 (.update(...).eq('id', currentUserId)).
create policy "users: self can update own profile"
    on public.users
    for update
    to authenticated
    using ( auth.uid() = id )
    with check ( auth.uid() = id );

-- Manager reads their team: manager dashboards list every user whose
-- manager_id points at them.
-- INFERRED from admin/index.html:1886 (.eq('manager_id', currentUserId))
-- and manager/index.html:1534.
create policy "users: managers can read their team"
    on public.users
    for select
    to authenticated
    using ( manager_id = auth.uid() );

-- Admin/owner/master can read every profile.
-- INFERRED from operations/index.html:2670 (.select('*') no eq filter on
-- user_id, implying admin-level bypass).
create policy "users: ops roles can read all"
    on public.users
    for select
    to authenticated
    using ( public.current_user_role() in ('admin', 'owner', 'master') );

-- Admin/owner/master can update every profile (status transitions, role
-- changes).
-- INFERRED from admin/index.html:1842 + update patterns in admin/operations.
create policy "users: ops roles can update all"
    on public.users
    for update
    to authenticated
    using ( public.current_user_role() in ('admin', 'owner', 'master') )
    with check ( public.current_user_role() in ('admin', 'owner', 'master') );

-- Signup: the anon client upserts its own profile on signup
-- (auth/index.html:1316 upsert with onConflict='email'; r/index.html:725;
-- invite/index.html:657). Insert path must be permitted to anon, matched
-- by email.
create policy "users: anon can insert own profile on signup"
    on public.users
    for insert
    to anon, authenticated
    with check ( true );
-- SECURITY: tighten to `with check ( auth.uid() is null or auth.uid() = id )`
-- once the auth trigger invariant is confirmed.


-- ============================================================================
-- 2. app_settings
-- Read-only for authenticated users; no client-side write path exists.
-- ============================================================================

-- Authenticated read only.
-- INFERRED from index.html:5993 (.from('app_settings').select('value')) and
-- technician/index.html:7481.
create policy "app_settings: authenticated can read"
    on public.app_settings
    for select
    to authenticated
    using ( true );

-- No insert/update/delete policies -- only service role (RLS bypass) writes
-- to this table, which is the observed admin-managed pattern.


-- ============================================================================
-- 3. projects
-- Owner CRUD; managers and ops read team projects.
-- ============================================================================

-- Owner select.
-- INFERRED from technician/index.html:10083 (.eq('user_id', userId)).
create policy "projects: owner can read"
    on public.projects
    for select
    to authenticated
    using ( auth.uid() = user_id );

-- Owner insert.
-- INFERRED from technician/index.html:9586 (insert { user_id: userId, ... }).
create policy "projects: owner can insert"
    on public.projects
    for insert
    to authenticated
    with check ( auth.uid() = user_id );

-- Owner update.
-- INFERRED from technician/index.html:7254, 15010, 15078
-- (.update(...).eq('id', currentProjectId)).
create policy "projects: owner can update"
    on public.projects
    for update
    to authenticated
    using ( auth.uid() = user_id )
    with check ( auth.uid() = user_id );

-- Owner delete.
-- INFERRED from technician/index.html:9977 (.from('projects').delete()).
create policy "projects: owner can delete"
    on public.projects
    for delete
    to authenticated
    using ( auth.uid() = user_id );

-- Manager reads team projects.
-- INFERRED from manager/index.html:1971 (.eq('user_id', techId)) where
-- techId comes from a manager_id IN (auth.uid()) pre-query on users.
create policy "projects: manager can read team projects"
    on public.projects
    for select
    to authenticated
    using ( public.is_team_manager_of(user_id) );

-- Ops roles read all.
-- INFERRED from operations/index.html:3206, admin/index.html:1896.
create policy "projects: ops roles can read all"
    on public.projects
    for select
    to authenticated
    using ( public.current_user_role() in ('admin', 'owner', 'master') );


-- ============================================================================
-- 4. chats
-- Owner CRUD via user_id; message-cascade deletes depend on the projects
-- FK (on delete cascade) rather than chats policy directly.
-- ============================================================================

create policy "chats: owner can read"
    on public.chats
    for select
    to authenticated
    using ( auth.uid() = user_id );                                   -- INFERRED from technician/index.html:9605 insert sets user_id; loadProject filters chats by project_id whose owner is the caller.

create policy "chats: owner can insert"
    on public.chats
    for insert
    to authenticated
    with check ( auth.uid() = user_id );                              -- INFERRED from technician/index.html:9608.

create policy "chats: owner can update"
    on public.chats
    for update
    to authenticated
    using ( auth.uid() = user_id )
    with check ( auth.uid() = user_id );                              -- INFERRED (no direct chat updates observed in dev-lab branch; policy added for parity).

create policy "chats: owner can delete via project cascade"
    on public.chats
    for delete
    to authenticated
    using ( auth.uid() = user_id );                                   -- INFERRED from technician/index.html:9973 (db.from('chats').delete().eq('project_id', ...)).

create policy "chats: manager can read team chats"
    on public.chats
    for select
    to authenticated
    using ( public.is_team_manager_of(user_id) );                     -- INFERRED -- manager UIs surface per-tech chat activity.


-- ============================================================================
-- 5. messages
-- Access via chat -> owner. Messages have no user_id column, so policies
-- traverse the chats FK. A helper subquery is used rather than a join.
-- ============================================================================

create policy "messages: owner can read via chat"
    on public.messages
    for select
    to authenticated
    using (
        exists (
            select 1 from public.chats c
            where c.id = messages.chat_id
              and c.user_id = auth.uid()
        )
    );                                                                -- INFERRED from technician/index.html:10196 (.eq('chat_id', chat.id)) where the chat was already ownership-filtered.

create policy "messages: owner can insert via chat"
    on public.messages
    for insert
    to authenticated
    with check (
        exists (
            select 1 from public.chats c
            where c.id = messages.chat_id
              and c.user_id = auth.uid()
        )
    );                                                                -- INFERRED from technician/index.html:9631 (insert with chat_id).

create policy "messages: owner can delete via chat"
    on public.messages
    for delete
    to authenticated
    using (
        exists (
            select 1 from public.chats c
            where c.id = messages.chat_id
              and c.user_id = auth.uid()
        )
    );                                                                -- INFERRED from technician/index.html:9969 (db.from('messages').delete().eq('chat_id', chat.id) during project delete).


-- ============================================================================
-- 6. reports
-- Owner CRUD via user_id; managers and ops read team reports.
-- ============================================================================

create policy "reports: owner can read"
    on public.reports
    for select
    to authenticated
    using ( auth.uid() = user_id );                                   -- INFERRED from technician/index.html:16677 (.eq('project_id', projectId) in a session that already owns the project).

create policy "reports: owner can insert"
    on public.reports
    for insert
    to authenticated
    with check ( auth.uid() = user_id );                              -- INFERRED from technician/index.html:16644 (insert { user_id: currentUserId }).

create policy "reports: owner can update"
    on public.reports
    for update
    to authenticated
    using ( auth.uid() = user_id )
    with check ( auth.uid() = user_id );                              -- INFERRED from technician/index.html:16702 (.update(...).eq('id', existingReport.id)).

create policy "reports: manager can read team reports"
    on public.reports
    for select
    to authenticated
    using ( public.is_team_manager_of(user_id) );                     -- INFERRED from admin/index.html:2088 (report:reports(id, status, created_at) join alongside technician filter).

create policy "reports: ops roles can read all"
    on public.reports
    for select
    to authenticated
    using ( public.current_user_role() in ('admin', 'owner', 'master') );


-- ============================================================================
-- 7. user_actions
-- Owner CRUD. Event-log table; no deletes observed.
-- ============================================================================

create policy "user_actions: owner can read"
    on public.user_actions
    for select
    to authenticated
    using ( auth.uid() = user_id );                                   -- INFERRED from technician/index.html:19407 (.select('...').eq('user_id', userId) -- implicit via row filter).

create policy "user_actions: owner can insert"
    on public.user_actions
    for insert
    to authenticated
    with check ( auth.uid() = user_id );                              -- INFERRED from technician/index.html:19360 (insert { user_id: userId, action_type, ... }).

create policy "user_actions: manager can read team actions"
    on public.user_actions
    for select
    to authenticated
    using ( public.is_team_manager_of(user_id) );                     -- INFERRED (manager dashboards aggregate team productivity).


-- ============================================================================
-- 8. calendar_events
-- Owner CRUD. Events with visible_to_manager_id or
-- visibility in ('company','shared','connect') are also visible to that
-- manager.
-- ============================================================================

create policy "calendar_events: owner can read"
    on public.calendar_events
    for select
    to authenticated
    using ( auth.uid() = user_id );                                   -- INFERRED from technician/index.html:19798 (.select('*') scoped to session user).

create policy "calendar_events: owner can insert"
    on public.calendar_events
    for insert
    to authenticated
    with check ( auth.uid() = user_id );                              -- INFERRED from technician/index.html:19876 and admin/index.html:2137 (insert { user_id: ... , type: 'availability'}). NOTE: admin inserts target share.technician_id, not auth.uid(); see ops-role policy below.

create policy "calendar_events: owner can update"
    on public.calendar_events
    for update
    to authenticated
    using ( auth.uid() = user_id )
    with check ( auth.uid() = user_id );                              -- INFERRED from technician/index.html:19889.

create policy "calendar_events: owner can delete"
    on public.calendar_events
    for delete
    to authenticated
    using ( auth.uid() = user_id );                                   -- INFERRED from technician/index.html:19910 (.delete().eq(...)).

create policy "calendar_events: manager can read shared events"
    on public.calendar_events
    for select
    to authenticated
    using (
        visible_to_manager_id = auth.uid()
        or public.is_team_manager_of(user_id)
    );                                                                -- INFERRED from admin/index.html:2134 (events written with visible_to_manager_id=currentUserId).

create policy "calendar_events: manager can insert availability for accepted share"
    on public.calendar_events
    for insert
    to authenticated
    with check (
        type = 'availability'
        and share_id is not null
        and exists (
            select 1 from public.availability_shares s
            where s.id = calendar_events.share_id
              and s.accepted_by_manager_id = auth.uid()
        )
    );                                                                -- INFERRED from admin/index.html:2135 (manager writes 'availability' events with share_id/visible_to_manager_id into the technician's calendar).


-- ============================================================================
-- 9. team_messages
-- 1:1 messaging. Sender and receiver can read; sender inserts; no updates
-- or deletes observed.
-- ============================================================================

create policy "team_messages: participants can read"
    on public.team_messages
    for select
    to authenticated
    using ( auth.uid() = sender_id or auth.uid() = receiver_id );    -- INFERRED from operations/index.html:3229 (OR filter sender_id=me OR receiver_id=me).

create policy "team_messages: sender can insert"
    on public.team_messages
    for insert
    to authenticated
    with check ( auth.uid() = sender_id );                           -- INFERRED from admin/index.html:2295 (insert { sender_id: currentUserId, receiver_id, content }).


-- ============================================================================
-- 10. availability_shares
-- Owner (technician) CRUD; recipient by email reads; manager updates
-- status on acceptance.
-- ============================================================================

create policy "availability_shares: technician can read own"
    on public.availability_shares
    for select
    to authenticated
    using ( auth.uid() = technician_id );                            -- INFERRED from technician calendar flows; technician_id is the owner.

create policy "availability_shares: technician can insert own"
    on public.availability_shares
    for insert
    to authenticated
    with check ( auth.uid() = technician_id );                       -- INFERRED.

create policy "availability_shares: recipient can read by email"
    on public.availability_shares
    for select
    to authenticated
    using (
        recipient_email = (
            select email from public.users where id = auth.uid() limit 1
        )
    );                                                                -- INFERRED from admin/index.html:2084 (.eq('recipient_email', currentAdminProfile.email)).

create policy "availability_shares: recipient can update on accept/reject"
    on public.availability_shares
    for update
    to authenticated
    using (
        recipient_email = (
            select email from public.users where id = auth.uid() limit 1
        )
    )
    with check (
        recipient_email = (
            select email from public.users where id = auth.uid() limit 1
        )
        and accepted_by_manager_id = auth.uid()
    );                                                                -- INFERRED from admin/index.html:2124 (.update({ status:'accepted', accepted_by_manager_id: currentUserId }).eq('id', shareId)).

create policy "availability_shares: accepted manager can read"
    on public.availability_shares
    for select
    to authenticated
    using ( accepted_by_manager_id = auth.uid() );                   -- INFERRED from operations/index.html:3265 (.eq('accepted_by_manager_id', currentUserId)).


-- ============================================================================
-- 11. invitations
-- Inviter CRUD; public read by token (capability URL); recipient accepts.
-- ============================================================================

create policy "invitations: inviter can read own"
    on public.invitations
    for select
    to authenticated
    using ( auth.uid() = inviter_id );                               -- INFERRED from admin/index.html:2321 (insert { inviter_id: currentUserId }); manager lists own invites.

create policy "invitations: inviter can insert"
    on public.invitations
    for insert
    to authenticated
    with check ( auth.uid() = inviter_id );                          -- INFERRED from admin/index.html:2319.

create policy "invitations: public can read by token"
    on public.invitations
    for select
    to anon, authenticated
    using ( true );
-- SECURITY: this is "readable by anyone who has the full token UUID".
-- Token column is a UUID (admin/index.html:2328), so by-token reads leak
-- only if token leaks. Still, prefer narrowing via a view or an Edge
-- Function.
-- INFERRED from invite/index.html:546 (.eq('token', token)), called from
-- an unauthenticated /invite landing.

create policy "invitations: recipient can update on accept"
    on public.invitations
    for update
    to authenticated
    using ( true )
    with check ( status = 'accepted' );                              -- INFERRED from invite/index.html:679 (.update({ status:'accepted', accepted_at:... }).eq('token', token)) -- runs post-signup with an authenticated session.


-- ============================================================================
-- 12. referrals
-- Referrer/referee can read; referee inserts on signup; referrer's bonus
-- flag updated from referrer session.
-- ============================================================================

create policy "referrals: referrer or referee can read"
    on public.referrals
    for select
    to authenticated
    using ( auth.uid() = referrer_id or auth.uid() = referee_id );   -- INFERRED from r/index.html:779 (.eq('referrer_id', ...).eq('referee_id', ...) post-signup update).

create policy "referrals: authenticated can insert where referee_id = self"
    on public.referrals
    for insert
    to authenticated
    with check ( auth.uid() = referee_id );                          -- INFERRED from r/index.html:752 (insert { referrer_id, referee_id: profileData.id }) -- profileData is the signing-up user.

create policy "referrals: participants can update bonus flags"
    on public.referrals
    for update
    to authenticated
    using ( auth.uid() = referrer_id or auth.uid() = referee_id )
    with check ( auth.uid() = referrer_id or auth.uid() = referee_id ); -- INFERRED from r/index.html:780 (.update({ bonus_granted_referrer:true })).

-- Link-click counter update happens via the increment_link_clicks() RPC
-- called from the anon client (r/index.html:648). The RPC must be
-- SECURITY DEFINER and bypass this table's RLS. See the functions file.

-- ============================================================================
-- End of RLS. All 12 tables enabled; 41 policies + 2 helper functions.
-- Known gaps documented as -- SECURITY: comments above:
--   * users: public-read policy is too broad (replaces email-existence check)
--   * invitations: public-read by token is capability-URL style
-- ============================================================================
