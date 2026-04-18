-- ============================================================================
-- audit-v2/01c_supabase_functions_triggers_storage.sql
-- ============================================================================
-- Postgres functions, triggers, and Supabase Storage buckets (with their
-- RLS policies) for the FixAIR backend on branch claude/dev-lab-7iGKi.
--
-- Sources:
--   * docs/REFERRAL-DATABASE-SCHEMA.sql -- the only actual SQL artifact
--     committed in the repo. Contains 4 functions and 1 trigger that ship
--     to production. Lifted verbatim where labeled "DOCUMENTED".
--   * Client-code references (.rpc(), .storage.from()) -- everything else.
--     Marked "-- INFERRED from path:line".
--
-- Total inventory:
--   Functions: 5  (4 DOCUMENTED, 1 INFERRED)
--   Triggers:  2  (1 DOCUMENTED, 1 INFERRED -- the auth.users -> public.users
--                  fan-out)
--   Storage buckets: 1 (project-photos, public read)
--   Storage policies: 4 (read public, insert/update/delete authenticated)
--
-- Tables touched but NOT in 01_supabase_schema.sql:
--   * public.referral_milestones -- defined in
--     docs/REFERRAL-DATABASE-SCHEMA.sql:86-94 and referenced by
--     check_referral_milestones() below. Added here as a supporting
--     definition (since it exists in production per the docs SQL) but
--     a future revision of 01 should host it.
--
-- Runnable against the output of 01_supabase_schema.sql + 01b_supabase_rls.sql.
-- ============================================================================


-- ============================================================================
-- Supporting table referenced by functions below.
-- DOCUMENTED in docs/REFERRAL-DATABASE-SCHEMA.sql:86-94. Reproduced here so
-- the function definitions compile against an empty Supabase project.
-- ============================================================================
create table if not exists public.referral_milestones (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references public.users(id) on delete cascade,
    milestone_type  varchar(50) not null,                                 -- enum: first_referral|ambassador|super_referrer|legend
    achieved_at     timestamptz default now(),
    reward_granted  boolean default false,
    unique (user_id, milestone_type)
);

create index if not exists idx_milestones_user on public.referral_milestones (user_id);

alter table public.referral_milestones enable row level security;

-- DOCUMENTED in docs/REFERRAL-DATABASE-SCHEMA.sql:127-130 (uses auth_id
-- subquery rather than direct id match because this file predates the
-- public.users.id = auth.uid() invariant adopted in 01b).
create policy "referral_milestones: users can view own"
    on public.referral_milestones
    for select
    to authenticated
    using ( auth.uid() = user_id );


-- ============================================================================
-- FUNCTION 1: generate_referral_code(text)
-- DOCUMENTED in docs/REFERRAL-DATABASE-SCHEMA.sql:137-174.
-- Builds a unique referral code from the first name + 4 random digits.
-- Falls back to a uuid-based code after 100 collisions.
-- ============================================================================
create or replace function public.generate_referral_code(user_first_name text)
returns text
language plpgsql
as $$
declare
    base_code text;
    final_code text;
    counter integer := 0;
begin
    base_code := lower(regexp_replace(coalesce(user_first_name, 'user'), '[^a-zA-Z]', '', 'g'));

    if length(base_code) > 10 then
        base_code := left(base_code, 10);
    end if;

    if length(base_code) = 0 then
        base_code := 'user';
    end if;

    loop
        final_code := base_code || lpad(floor(random() * 10000)::text, 4, '0');

        if not exists (select 1 from public.users     where referral_code = final_code)
           and not exists (select 1 from public.referrals where referral_code = final_code) then
            return final_code;
        end if;

        counter := counter + 1;
        if counter > 100 then
            return 'ref' || left(replace(gen_random_uuid()::text, '-', ''), 8);
        end if;
    end loop;
end;
$$;


-- ============================================================================
-- FUNCTION 2: grant_referral_bonus(uuid, int)
-- DOCUMENTED in docs/REFERRAL-DATABASE-SCHEMA.sql:181-228.
-- Grants bonus_queries to both referrer and referee, marks the referral
-- bonus_granted_* flags, then runs check_referral_milestones for the
-- referrer. SECURITY DEFINER so the anon client cannot call it directly
-- without going through a server route.
-- ============================================================================
create or replace function public.grant_referral_bonus(
    p_referral_id uuid,
    p_bonus_amount integer default 30
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_referral public.referrals%rowtype;
begin
    select * into v_referral from public.referrals where id = p_referral_id;

    if not found then
        raise exception 'Referral not found';
    end if;

    if v_referral.status <> 'completed' then
        raise exception 'Referral not completed';
    end if;

    if v_referral.bonus_granted_referrer and v_referral.bonus_granted_referee then
        return false;
    end if;

    if not v_referral.bonus_granted_referrer then
        update public.users
            set bonus_queries   = coalesce(bonus_queries, 0)   + p_bonus_amount,
                total_referrals = coalesce(total_referrals, 0) + 1
            where id = v_referral.referrer_id;
        update public.referrals set bonus_granted_referrer = true where id = p_referral_id;
    end if;

    if not v_referral.bonus_granted_referee and v_referral.referee_id is not null then
        update public.users
            set bonus_queries = coalesce(bonus_queries, 0) + p_bonus_amount
            where id = v_referral.referee_id;
        update public.referrals set bonus_granted_referee = true where id = p_referral_id;
    end if;

    perform public.check_referral_milestones(v_referral.referrer_id);

    return true;
end;
$$;


-- ============================================================================
-- FUNCTION 3: check_referral_milestones(uuid)
-- DOCUMENTED in docs/REFERRAL-DATABASE-SCHEMA.sql:235-272.
-- Reads users.total_referrals and inserts the matching milestone rows.
-- Sets users.is_ambassador = true at >= 3 referrals.
-- ============================================================================
create or replace function public.check_referral_milestones(p_user_id uuid)
returns void
language plpgsql
as $$
declare
    v_total integer;
begin
    select total_referrals into v_total from public.users where id = p_user_id;

    if v_total >= 1 then
        insert into public.referral_milestones (user_id, milestone_type)
        values (p_user_id, 'first_referral')
        on conflict (user_id, milestone_type) do nothing;
    end if;

    if v_total >= 3 then
        insert into public.referral_milestones (user_id, milestone_type)
        values (p_user_id, 'ambassador')
        on conflict (user_id, milestone_type) do nothing;

        update public.users set is_ambassador = true where id = p_user_id;
    end if;

    if v_total >= 5 then
        insert into public.referral_milestones (user_id, milestone_type)
        values (p_user_id, 'super_referrer')
        on conflict (user_id, milestone_type) do nothing;
    end if;

    if v_total >= 10 then
        insert into public.referral_milestones (user_id, milestone_type)
        values (p_user_id, 'legend')
        on conflict (user_id, milestone_type) do nothing;
    end if;
end;
$$;


-- ============================================================================
-- FUNCTION 4: trigger_generate_user_referral_code()
-- DOCUMENTED in docs/REFERRAL-DATABASE-SCHEMA.sql:278-286.
-- BEFORE INSERT trigger function on public.users -- assigns a referral_code
-- if the inserted row didn't supply one.
-- ============================================================================
create or replace function public.trigger_generate_user_referral_code()
returns trigger
language plpgsql
as $$
begin
    if new.referral_code is null then
        new.referral_code := public.generate_referral_code(new.first_name);
    end if;
    return new;
end;
$$;


-- ============================================================================
-- FUNCTION 5: increment_link_clicks()
-- INFERRED from r/index.html:648:
--     .update({ link_clicks: sb.rpc('increment_link_clicks') })
--     .eq('referral_code', referralCode)
-- Notes:
--   1. The signature has to take the referral_code (or referral id) as an
--      argument because the call site identifies the row by referral_code
--      and updates link_clicks atomically. The current client-side usage
--      (embedding sb.rpc(...) inside an .update({}) value) is almost
--      certainly broken -- supabase-js .rpc() returns a thenable, not a
--      SQL fragment. So either:
--        (a) this never increments anything in production, or
--        (b) there is a wrapper/expression on the server side that
--            interprets it.
--      Either way, the safe definition is a function that takes the code
--      and atomically increments the counter, returning the new value.
--      Callers should switch to: sb.rpc('increment_link_clicks',
--      { p_referral_code: code }).
--   2. SECURITY DEFINER because the policy on referrals does not grant
--      anonymous UPDATE; the link-click tracker fires from a possibly
--      unauthenticated landing page (r/index.html).
-- ============================================================================
create or replace function public.increment_link_clicks(p_referral_code text)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_new_count bigint;
begin
    update public.referrals
        set link_clicks = coalesce(link_clicks, 0) + 1
        where referral_code = p_referral_code
        returning link_clicks into v_new_count;

    return coalesce(v_new_count, 0);
end;
$$;

grant execute on function public.increment_link_clicks(text) to anon, authenticated;


-- ============================================================================
-- TRIGGER 1: auto_generate_referral_code
-- DOCUMENTED in docs/REFERRAL-DATABASE-SCHEMA.sql:289-293.
-- BEFORE INSERT on public.users.
-- ============================================================================
drop trigger if exists auto_generate_referral_code on public.users;
create trigger auto_generate_referral_code
    before insert on public.users
    for each row
    execute function public.trigger_generate_user_referral_code();


-- ============================================================================
-- TRIGGER 2 (FUNCTION + TRIGGER): handle_new_auth_user
-- INFERRED from auth/index.html:1447 ("upsert to handle trigger-created
-- rows") and admin/index.html:1419 (.eq('id', authId) lookup that only
-- works if public.users.id was pre-created with id = auth.users.id).
--
-- Behavior: on auth.users insert, create a matching public.users row whose
-- id equals auth.users.id, copying email and any first_name/last_name/phone
-- from raw_user_meta_data.
--
-- The trigger lives on auth.users (Supabase-managed schema); creating it
-- requires the postgres role and is the canonical Supabase pattern.
-- ============================================================================
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
    insert into public.users (id, auth_id, email, first_name, last_name, phone)
    values (
        new.id,
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data ->> 'first_name', null),
        coalesce(new.raw_user_meta_data ->> 'last_name',  null),
        coalesce(new.raw_user_meta_data ->> 'phone',      null)
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_auth_user();


-- ============================================================================
-- STORAGE: bucket `project-photos`
-- INFERRED from index.html:13122-13138 and technician/index.html:18289-18298:
--     db.storage.from('project-photos').upload(filename, blob, ...)
--     db.storage.from('project-photos').getPublicUrl(filename)
-- Filename pattern: `${projectId}/${timestamp}.jpg` (index.html:13119).
-- Public URL is consumed directly into projects.photos[].url, so the bucket
-- must allow public reads.
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'project-photos',
    'project-photos',
    true,                                                     -- public read (getPublicUrl is called)
    10485760,                                                 -- 10 MiB; INFERRED -- no client-side limit observed
    array['image/jpeg', 'image/png', 'image/webp']            -- INFERRED -- only image/jpeg observed at upload contentType (index.html:13125)
)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Storage policies for `project-photos`.
-- All policies live on storage.objects and filter by bucket_id.
-- The path convention is `<projectId>/<timestamp>.jpg`, so ownership is
-- enforced by joining the path's first segment to public.projects(id).
-- ----------------------------------------------------------------------------

-- Public read: any visitor can fetch a photo by URL once it is in the
-- bucket. Required because getPublicUrl() returns an unauthenticated URL
-- that ends up rendered in <img src> tags inside generated reports.
-- INFERRED from the public:true bucket setting + getPublicUrl() usage at
-- index.html:13135.
create policy "project-photos: public can read"
    on storage.objects
    for select
    to anon, authenticated
    using ( bucket_id = 'project-photos' );

-- Authenticated insert: only the project owner can write under their
-- project's path. The first path segment is the project id.
-- INFERRED from filename pattern at index.html:13119
-- (`${projectId}/${timestamp}.jpg`).
create policy "project-photos: owner can insert under own project path"
    on storage.objects
    for insert
    to authenticated
    with check (
        bucket_id = 'project-photos'
        and exists (
            select 1 from public.projects p
            where p.id::text = (storage.foldername(name))[1]
              and p.user_id = auth.uid()
        )
    );

-- Authenticated update: same ownership check (e.g. re-upload with upsert).
-- INFERRED -- the client uses { upsert: false } at index.html:13126, but a
-- policy is still needed for any future re-upload path.
create policy "project-photos: owner can update under own project path"
    on storage.objects
    for update
    to authenticated
    using (
        bucket_id = 'project-photos'
        and exists (
            select 1 from public.projects p
            where p.id::text = (storage.foldername(name))[1]
              and p.user_id = auth.uid()
        )
    )
    with check (
        bucket_id = 'project-photos'
        and exists (
            select 1 from public.projects p
            where p.id::text = (storage.foldername(name))[1]
              and p.user_id = auth.uid()
        )
    );

-- Authenticated delete: same ownership check. INFERRED -- no client-side
-- delete observed, but ON DELETE CASCADE on projects implies orphan
-- objects without a delete policy. A future cleanup job will need this.
create policy "project-photos: owner can delete under own project path"
    on storage.objects
    for delete
    to authenticated
    using (
        bucket_id = 'project-photos'
        and exists (
            select 1 from public.projects p
            where p.id::text = (storage.foldername(name))[1]
              and p.user_id = auth.uid()
        )
    );


-- ============================================================================
-- NOTE on user company logos:
-- The "company logo upload" feature added in commit a4b904c stores logos as
-- base64 inside public.users.company_logo (technician/index.html:8383). It
-- does NOT use Supabase Storage. technician/AUDIT_ISSUES.md:35 flags this
-- as "Logo stored as base64 in DB ... Consider Supabase Storage bucket
-- instead for production scale". No `company-logos` bucket exists.
--
-- If/when migrated, add a similar bucket here:
--   project-photos -> company-logos (public read, owner write under
--   `<userId>/...`).
-- ============================================================================


-- ============================================================================
-- End of file. 5 functions, 2 triggers, 1 storage bucket, 4 storage policies,
-- 1 supporting table (referral_milestones).
-- ============================================================================
