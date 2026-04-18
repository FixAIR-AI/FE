-- ============================================================================
-- audit-v2/01_supabase_schema.sql
-- ============================================================================
-- Scope: CREATE TABLE statements for every Supabase public-schema table used
-- by the FixAIR FE on branch claude/dev-lab-7iGKi, inferred from client code
-- (no migrations file exists in the repo). No RLS, no functions, no triggers
-- here -- those live in separate files.
--
-- Total tables: 12
--   1.  users                  ~10^3   (one row per human; small org)
--   2.  app_settings           ~10^1   (key-value store; a handful of keys)
--   3.  projects               ~10^4   (one row per intervention/report; grows
--                                       linearly with technician activity)
--   4.  chats                  ~10^4   (1-2 rows per project; "assistant" and
--                                       legacy "copilot")
--   5.  messages               ~10^6   (per-turn chat rows; largest table)
--   6.  reports                ~10^4   (one row per completed project; mirrors
--                                       projects.extracted_data denormalised)
--   7.  user_actions           ~10^5   (gamification event log)
--   8.  calendar_events        ~10^4   (technician schedule)
--   9.  team_messages          ~10^4   (manager <-> technician 1:1 messages)
--   10. availability_shares    ~10^3   (technician offers availability to
--                                       managers)
--   11. invitations            ~10^3   (team invitation tokens)
--   12. referrals              ~10^3   (referral relationships)
--
-- Inferred lines are tagged `-- INFERRED from path/to/file.html:LINE`.
-- Columns with no direct evidence but required for the schema to be coherent
-- (e.g. primary keys, created_at on tables that read them via .order) are
-- also tagged INFERRED.
--
-- Convention: every `id` is uuid with default gen_random_uuid(). Every
-- `*_at` is timestamptz. Every jsonb blob is nullable and defaults to NULL
-- (not '{}') because the client code null-checks rather than empty-object-
-- checks.
--
-- Runnable against an empty Supabase project (requires pgcrypto + the
-- supabase-managed `auth.users` table, which all Supabase projects have).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. users
-- Public-schema mirror of auth.users with app-level profile, role, plan,
-- referral and team fields. One row per human user across all role-apps.
-- ============================================================================
create table if not exists public.users (
    id                 uuid primary key default gen_random_uuid(),
    auth_id            uuid references auth.users(id) on delete set null,           -- auth/index.html:1451
    email              text not null unique,                                         -- auth/index.html:1122, upsert onConflict=email
    first_name         text,                                                         -- auth/index.html:1453
    last_name          text,                                                         -- auth/index.html:1454
    phone              text,                                                         -- auth/index.html:1455
    company_name       text,                                                         -- INFERRED from auth/index.html:1557 (enterprise signup only)
    role               text not null default 'technician',                           -- auth/index.html:1456; enum: technician|admin|owner|manager|master
    member_type        text default 'standalone',                                    -- auth/index.html:1457; enum: standalone|internal
    status             text not null default 'pending',                              -- auth/index.html:1319; enum: incomplete|pending|approved|active|rejected
    live_status        text default 'offline',                                       -- auth/index.html:1459; enum: online|offline|idle
    language           text default 'fr',                                            -- index.html:6096; enum: fr|en
    onboarding_done    boolean default false,                                        -- index.html:6101
    subscription_tier  text default 'free',                                          -- technician/index.html:18596; enum: free|pro|enterprise  -- INFERRED default
    manager_id         uuid references public.users(id) on delete set null,         -- manager/index.html:1959 (self-FK, team hierarchy)
    avatar_url         text,                                                         -- INFERRED from admin/index.html:2082 (select only, never inserted)
    referred_by        uuid references public.users(id) on delete set null,         -- r/index.html:734
    referral_code      text unique,                                                  -- r/index.html:736; technician/index.html:19263  -- INFERRED unique
    bonus_queries      integer default 0,                                            -- r/index.html:735
    total_referrals    integer default 0,                                            -- r/index.html:769; technician/index.html:19201
    completed_referrals integer default 0,                                           -- technician/index.html:18953
    is_ambassador      boolean default false,                                        -- technician/index.html:18961
    week_free_granted_at timestamptz,                                                -- technician/index.html:18953 (Pro trial start)
    created_at         timestamptz not null default now(),                           -- INFERRED (standard; read via order in admin views)
    updated_at         timestamptz not null default now()                            -- index.html:6063 (set manually from JS on every update)
);

-- ============================================================================
-- 2. app_settings
-- Key-value store for server-held config (API keys etc.) read by the client
-- via a single `.select('value').eq('key', ...)` lookup. Admin-managed; no
-- insert/update path visible in the FE.
-- ============================================================================
create table if not exists public.app_settings (
    key         text primary key,                                                   -- index.html:5995 (.eq('key', keyName))
    value       text,                                                               -- index.html:6001 (.select('value'))  -- INFERRED text (only API keys observed)
    created_at  timestamptz not null default now(),                                 -- INFERRED standard
    updated_at  timestamptz not null default now()                                  -- INFERRED standard
);

-- ============================================================================
-- 3. projects
-- One row per intervention. Holds the full report JSON (`extracted_data`),
-- progress, completion status, and the equipment brand. Primary write target
-- for the technician app.
-- ============================================================================
create table if not exists public.projects (
    id                 uuid primary key default gen_random_uuid(),
    user_id            uuid not null references public.users(id) on delete cascade, -- technician/index.html:9586
    title              text not null default 'Nouvelle intervention',                -- technician/index.html:9587
    brand              text,                                                         -- technician/index.html:9588; enum of HVAC brand keys (DAIKIN, MITSUBISHI, etc.)
    original_brand     text,                                                         -- technician/index.html:9006 (pre-normalisation brand string)
    status             text not null default 'active',                               -- technician/index.html:9589; enum: active|completed
    completion_status  text default 'in_progress',                                   -- technician/index.html:7250; enum: in_progress|completed
    progress           integer default 0,                                            -- technician/index.html:7251 (0-100)
    extracted_data     jsonb,                                                        -- technician/index.html:15069; see technician/AUDIT_DATA_SCHEMA.md for full shape
    photos             jsonb,                                                        -- technician/index.html:10096; array of {url,data,caption,name}
    completed_at       timestamptz,                                                  -- technician/index.html:7252
    created_at         timestamptz not null default now(),                           -- technician/index.html:10083 (.select('...created_at,updated_at...'))
    updated_at         timestamptz not null default now()                            -- technician/index.html:15070 (set manually from JS)
);

create index if not exists projects_user_id_idx        on public.projects (user_id);                       -- technician/index.html:10083 (.eq('user_id', ...))
create index if not exists projects_updated_at_idx     on public.projects (updated_at desc);               -- technician/index.html:10083 (ORDER BY updated_at)
create index if not exists projects_status_idx         on public.projects (status);                        -- technician/index.html:16658 (.eq('status', ...))

-- ============================================================================
-- 4. chats
-- One chat per (project, chat_type). Historically chat_type included
-- 'copilot'; post-removal (commit 1254900) only 'assistant' is produced, but
-- legacy 'copilot' rows are still read and routed to the assistant view
-- (technician/index.html:10190).
-- ============================================================================
create table if not exists public.chats (
    id           uuid primary key default gen_random_uuid(),
    project_id   uuid not null references public.projects(id) on delete cascade,   -- technician/index.html:9607
    user_id      uuid not null references public.users(id) on delete cascade,      -- technician/index.html:9608
    chat_type    text not null default 'assistant',                                 -- technician/index.html:9609; enum: assistant|copilot (legacy)
    is_active    boolean not null default true,                                     -- technician/index.html:9610
    started_at   timestamptz not null default now(),                                -- technician/index.html:10184 (.select('...started_at'))
    created_at   timestamptz not null default now()                                 -- INFERRED standard
);

create index if not exists chats_project_id_idx on public.chats (project_id);       -- technician/index.html:9965 (.eq('project_id', ...))
create index if not exists chats_user_id_idx    on public.chats (user_id);          -- INFERRED (standard per-user queries)

-- ============================================================================
-- 5. messages
-- Per-turn chat messages. Supports text, image (data: URL), and OCR JSON
-- content types. `thought_process` / `thought_summary` store Claude's
-- extended thinking output for assistant messages.
-- ============================================================================
create table if not exists public.messages (
    id               uuid primary key default gen_random_uuid(),
    chat_id          uuid not null references public.chats(id) on delete cascade,  -- technician/index.html:9632
    role             text not null,                                                  -- technician/index.html:9633; enum: user|assistant|ai|system
    content          text not null,                                                  -- technician/index.html:9634
    content_type     text not null default 'text',                                   -- technician/index.html:9635; enum: text|image|ocr
    thought_process  text,                                                           -- technician/index.html:9636
    thought_summary  text,                                                           -- technician/index.html:9637
    created_at       timestamptz not null default now()                              -- technician/index.html:9664 (ORDER BY created_at)
);

create index if not exists messages_chat_id_created_at_idx on public.messages (chat_id, created_at);  -- technician/index.html:10199 (.eq('chat_id').order('created_at'))

-- ============================================================================
-- 6. reports
-- Denormalised copy of the final report, one row per completed project.
-- Written by saveReportData() whenever progress >= 80% (draft) or complete.
-- Fields are extracted from projects.extracted_data for queryability.
-- ============================================================================
create table if not exists public.reports (
    id                   uuid primary key default gen_random_uuid(),
    project_id           uuid not null references public.projects(id) on delete cascade unique,  -- technician/index.html:16677 (.eq('project_id').maybeSingle())  -- INFERRED unique (one report per project)
    user_id              uuid not null references public.users(id) on delete cascade,            -- technician/index.html:16683
    status               text not null default 'draft',                                           -- technician/index.html:16684; enum: draft|completed
    title                text,                                                                    -- technician/index.html:16685
    report_type          text,                                                                    -- technician/index.html:16686; enum: MAINT|SAV|MES
    equipment_brand      text,                                                                    -- technician/index.html:16687
    equipment_model      text,                                                                    -- technician/index.html:16688
    equipment_type       text,                                                                    -- technician/index.html:16689
    problem_reported     text,                                                                    -- technician/index.html:16690
    problem_identified   text,                                                                    -- technician/index.html:16691
    solution_description text,                                                                    -- technician/index.html:16692
    error_codes          jsonb default '[]'::jsonb,                                               -- technician/index.html:16693 (array of {code,description,resolution})
    actions_performed    jsonb default '[]'::jsonb,                                               -- technician/index.html:16694 (array of {titre,texte,status})
    client_name          text,                                                                    -- technician/index.html:16695
    client_address       text,                                                                    -- technician/index.html:16696
    created_at           timestamptz not null default now(),                                      -- technician/index.html:16711
    updated_at           timestamptz not null default now()                                       -- technician/index.html:16697 (set manually from JS)
);

create index if not exists reports_user_id_idx    on public.reports (user_id);                   -- INFERRED (standard per-user queries)
create index if not exists reports_project_id_idx on public.reports (project_id);                -- technician/index.html:16677

-- ============================================================================
-- 7. user_actions
-- Gamification event log -- one row per value-creating action. Feeds the
-- weekly "minutes/euros saved" counter on the home screen.
-- ============================================================================
create table if not exists public.user_actions (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references public.users(id) on delete cascade,    -- index.html:13613; technician/index.html:19360
    action_type     text not null,                                                    -- index.html:13614; enum: report|ocr|photo|voice|copilot_session
    minutes_saved   numeric,                                                          -- index.html:13615  -- INFERRED numeric (fractional minutes possible)
    euros_saved     numeric,                                                          -- index.html:13616  -- INFERRED numeric (fractional euros possible)
    project_id      uuid references public.projects(id) on delete set null,          -- index.html:13617
    created_at      timestamptz not null default now()                                -- index.html:13661 (.gte('created_at', monday))
);

create index if not exists user_actions_user_id_created_at_idx on public.user_actions (user_id, created_at desc);  -- index.html:13661

-- ============================================================================
-- 8. calendar_events
-- Technician scheduling. Before copilot removal, event types included
-- 'copilot' and 'connect'. Post-removal, defaults land on 'assistant'
-- (commit 6c7c0ad). Old 'copilot' rows are still readable.
-- ============================================================================
create table if not exists public.calendar_events (
    id                      uuid primary key default gen_random_uuid(),
    user_id                 uuid not null references public.users(id) on delete cascade,  -- index.html:14112
    title                   text not null,                                                  -- index.html:14113
    type                    text not null default 'assistant',                              -- index.html:14114; enum: assistant|copilot (legacy)|connect (legacy)|personal|availability
    date                    date not null,                                                  -- index.html:14115
    start_time              time,                                                           -- index.html:14116  -- INFERRED time (HH:MM string)
    end_time                time,                                                           -- index.html:14117
    all_day                 boolean default false,                                          -- index.html:14118
    location                text,                                                           -- index.html:14119
    client                  text,                                                           -- index.html:14120
    notes                   text,                                                           -- index.html:14121
    project_id              uuid references public.projects(id) on delete set null,        -- index.html:14122
    repeat_type             text,                                                           -- index.html:14065; enum: none|daily|weekly|monthly
    reminder                text,                                                           -- index.html:14066; enum: none|15|30|60|1440  -- INFERRED text (string minutes)
    visibility              text default 'private',                                         -- index.html:14067; enum: private|company|connect|shared
    job_id                  text,                                                           -- index.html:14070  -- INFERRED text (legacy Connect job reference)
    share_id                uuid references public.availability_shares(id) on delete set null,  -- admin/index.html:2144
    visible_to_manager_id   uuid references public.users(id) on delete set null,           -- admin/index.html:2145
    created_at              timestamptz not null default now()                              -- INFERRED standard
);

create index if not exists calendar_events_user_id_date_idx on public.calendar_events (user_id, date);  -- INFERRED from calendar load patterns

-- ============================================================================
-- 9. team_messages
-- 1:1 messaging between manager and technician (either direction).
-- Queried with an OR filter on (sender, receiver).
-- ============================================================================
create table if not exists public.team_messages (
    id            uuid primary key default gen_random_uuid(),
    sender_id     uuid not null references public.users(id) on delete cascade,     -- admin/index.html:2295
    receiver_id   uuid not null references public.users(id) on delete cascade,     -- admin/index.html:2296
    content       text not null,                                                    -- admin/index.html:2297
    content_type  text not null default 'text',                                     -- admin/index.html:2298; enum: text|image|ocr
    created_at    timestamptz not null default now(),                               -- admin/index.html:3256 (.order('created_at'))
    updated_at    timestamptz not null default now()                                -- INFERRED standard
);

create index if not exists team_messages_sender_receiver_idx   on public.team_messages (sender_id, receiver_id);    -- operations/index.html:3229 (OR filter)
create index if not exists team_messages_receiver_sender_idx   on public.team_messages (receiver_id, sender_id);    -- symmetric for the other direction
create index if not exists team_messages_created_at_idx        on public.team_messages (created_at desc);

-- ============================================================================
-- 10. availability_shares
-- A technician offers their open slots to a manager by email. Manager then
-- accepts (which also writes calendar_events rows referencing this share).
-- ============================================================================
create table if not exists public.availability_shares (
    id                       uuid primary key default gen_random_uuid(),
    technician_id            uuid not null references public.users(id) on delete cascade,   -- operations/index.html:3264 (join technician:technician_id(*))  -- INFERRED column name
    recipient_email          text not null,                                                  -- admin/index.html:2084 (.eq('recipient_email', ...))
    status                   text not null default 'pending',                                -- admin/index.html:2085; enum: pending|accepted|rejected
    time_slots               jsonb,                                                          -- admin/index.html:2132 (array of {date,start,end})
    accepted_by_manager_id   uuid references public.users(id) on delete set null,           -- admin/index.html:2124
    accepted_at              timestamptz,                                                    -- admin/index.html:2125
    created_at               timestamptz not null default now()                              -- INFERRED standard
);

create index if not exists availability_shares_recipient_email_idx on public.availability_shares (recipient_email);  -- admin/index.html:2084
create index if not exists availability_shares_technician_id_idx   on public.availability_shares (technician_id);    -- operations/index.html:3264
create index if not exists availability_shares_status_idx          on public.availability_shares (status);            -- admin/index.html:2085

-- ============================================================================
-- 11. invitations
-- Time-limited token links for inviting internal team members. Pre-fills
-- the signup form via the /invite landing.
-- ============================================================================
create table if not exists public.invitations (
    id           uuid primary key default gen_random_uuid(),
    inviter_id   uuid not null references public.users(id) on delete cascade,       -- admin/index.html:2321
    email        text not null,                                                      -- admin/index.html:2322
    token        text not null unique,                                               -- admin/index.html:2328; invite/index.html:546 (.eq('token', ...))  -- INFERRED unique
    first_name   text,                                                               -- admin/index.html:2324
    last_name    text,                                                               -- admin/index.html:2325
    phone        text,                                                               -- admin/index.html:2323
    member_type  text not null default 'internal',                                   -- admin/index.html:2326; enum: internal|external
    role         text not null default 'technician',                                 -- admin/index.html:2327
    status       text not null default 'pending',                                    -- admin/index.html:2329; enum: pending|accepted|expired
    accepted_at  timestamptz,                                                        -- invite/index.html:681
    created_at   timestamptz not null default now()                                  -- INFERRED standard
);

create index if not exists invitations_email_idx      on public.invitations (email);           -- INFERRED (lookup on invite landing)
create index if not exists invitations_inviter_id_idx on public.invitations (inviter_id);      -- INFERRED standard

-- ============================================================================
-- 12. referrals
-- One row per successful referral relationship (referrer -> referee).
-- link_clicks is atomically incremented via the increment_link_clicks() RPC.
-- ============================================================================
create table if not exists public.referrals (
    id                        uuid primary key default gen_random_uuid(),
    referrer_id               uuid not null references public.users(id) on delete cascade,  -- r/index.html:751
    referee_id                uuid not null references public.users(id) on delete cascade,  -- r/index.html:752
    referral_code             text not null,                                                 -- r/index.html:753; r/index.html:649 (.eq('referral_code', ...))
    status                    text not null default 'completed',                             -- r/index.html:754; enum: completed (pending|rejected inferred but unused)
    link_clicks               bigint default 0,                                              -- r/index.html:648 (.rpc('increment_link_clicks'))
    source                    text default 'whatsapp',                                       -- r/index.html:757 (only value observed)
    bonus_granted_referee     boolean default false,                                         -- r/index.html:756
    bonus_granted_referrer    boolean default false,                                         -- r/index.html:780
    completed_at              timestamptz not null default now(),                            -- r/index.html:755
    created_at                timestamptz not null default now()                             -- INFERRED standard
);

create index if not exists referrals_referral_code_idx on public.referrals (referral_code);   -- r/index.html:649
create index if not exists referrals_referrer_id_idx   on public.referrals (referrer_id);     -- INFERRED standard
create index if not exists referrals_referee_id_idx    on public.referrals (referee_id);      -- INFERRED standard

-- ============================================================================
-- End of schema. 12 tables. Next files in the series:
--   02 (proposed) storage buckets  03 RLS policies  04 RPCs & triggers
-- ============================================================================
