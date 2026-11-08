create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb
);

create table if not exists public.libraries (
  user_id uuid primary key references auth.users (id) on delete cascade,
  books jsonb not null default '[]'::jsonb,
  revision bigint not null default 0
);

alter table public.libraries
  add column if not exists revision bigint not null default 0;

create table if not exists public.shared_shelves (
  code text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  snapshot jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.libraries enable row level security;
alter table public.shared_shelves enable row level security;

-- Rotate legacy six-character invite codes to non-enumerable 122-bit tokens.
do $$
declare
  shelf record;
  next_code text;
begin
  for shelf in
    select code, owner_id
    from public.shared_shelves
    where code !~ '^[A-F0-9]{32}$'
  loop
    loop
      next_code := upper(replace(gen_random_uuid()::text, '-', ''));
      exit when not exists (
        select 1 from public.shared_shelves where code = next_code
      );
    end loop;

    update public.shared_shelves
    set code = next_code
    where code = shelf.code;

    update public.profiles
    set data = jsonb_set(data, '{shareCode}', to_jsonb(next_code), true)
    where id = shelf.owner_id
      and data->>'shareCode' = shelf.code;
  end loop;
end
$$;

update public.profiles
set data = jsonb_set(
  data,
  '{shareCode}',
  to_jsonb(upper(replace(gen_random_uuid()::text, '-', ''))),
  true
)
where data->>'shareCode' is not null
  and data->>'shareCode' !~ '^[A-F0-9]{32}$';

alter table public.shared_shelves
  drop constraint if exists shared_shelves_code_format;
alter table public.shared_shelves
  add constraint shared_shelves_code_format
  check (code ~ '^[A-F0-9]{32}$');

drop policy if exists "Users manage their own profile" on public.profiles;
create policy "Users manage their own profile"
  on public.profiles
  for all
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users manage their own library" on public.libraries;
create policy "Users manage their own library"
  on public.libraries
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners manage their shared shelves" on public.shared_shelves;
create policy "Owners manage their shared shelves"
  on public.shared_shelves
  for all
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

grant select, insert, update, delete on public.profiles to authenticated;
-- shared_shelves writes go through publish_my_shelf(); see the hardening section.
revoke insert, update on public.shared_shelves from authenticated;
grant select, delete on public.shared_shelves to authenticated;
revoke insert, update on public.libraries from authenticated;
grant select, delete on public.libraries to authenticated;

-- save_library_snapshot() is defined in the hardening section below.

create or replace function public.get_shared_shelf(share_code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select snapshot
  from public.shared_shelves
  where share_code ~ '^[A-Fa-f0-9]{32}$'
    and code = upper(share_code)
  limit 1;
$$;

revoke all on function public.get_shared_shelf(text) from public;
grant execute on function public.get_shared_shelf(text) to anon, authenticated;

-- ===========================================================================
-- Security hardening + plans/subscriptions/admins (2026-11-07)
-- The user's plan now lives in public.subscriptions. Clients can only change
-- it through set_my_plan() (self-service plans only) or the admin API.
-- profiles.data.plan is ignored from here on.
-- ===========================================================================

create table if not exists public.plans (
  id text primary key check (id ~ '^[a-z0-9_-]{2,40}$'),
  name text not null check (char_length(name) between 1 and 80),
  description text not null default '' check (char_length(description) <= 1000),
  price_cents integer not null default 0 check (price_cents between 0 and 100000000),
  currency text not null default 'PHP' check (currency ~ '^[A-Z]{3}$'),
  billing_interval text not null default 'one_time'
    check (billing_interval in ('one_time', 'month', 'year')),
  book_limit integer check (book_limit is null or book_limit between 1 and 5000),
  can_share boolean not null default false,
  self_service boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 'starter' is the fallback plan for users without an active subscription.
-- book_limit is left empty (unlimited, up to the 5000 hard cap) because the
-- "20 slots" copy was never enforced. An admin can set it in the admin area.
insert into public.plans
  (id, name, description, price_cents, currency, billing_interval, book_limit, can_share, self_service, sort_order)
values
  ('starter', 'Starter', 'Track your library and reading.', 9900, 'PHP', 'one_time', null, false, true, 0),
  ('plus', 'Booklod Plus', 'Everything in Starter, plus Share Your Shelf.', 9900, 'PHP', 'month', null, true, true, 10)
on conflict (id) do nothing;

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan_id text not null references public.plans (id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
  current_period_end timestamptz,
  source text not null default 'demo' check (source in ('demo', 'admin', 'payment')),
  note text not null default '' check (char_length(note) <= 1000),
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_plan_id_idx on public.subscriptions (plan_id);
create index if not exists subscriptions_updated_by_idx on public.subscriptions (updated_by);

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.admins enable row level security;

-- Anyone may read the active plan catalogue (pricing page, upgrade screen).
drop policy if exists "Active plans are public" on public.plans;
create policy "Active plans are public"
  on public.plans for select to anon, authenticated
  using (is_active);
revoke all on public.plans from anon, authenticated;
grant select on public.plans to anon, authenticated;

-- Users may read their own subscription. Nobody writes it from a client.
drop policy if exists "Users read their own subscription" on public.subscriptions;
create policy "Users read their own subscription"
  on public.subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);
revoke all on public.subscriptions from anon, authenticated;
grant select on public.subscriptions to authenticated;

-- admins: no policies and no grants. Only security definer functions and the
-- service role can see it.
revoke all on public.admins from anon, authenticated;

-- Fix 2: shelves are only written through publish_my_shelf(). Owners can
-- still read and delete their own rows.
revoke insert, update on public.shared_shelves from anon, authenticated;
grant select, delete on public.shared_shelves to authenticated;

-- Profile JSON is bounded (a compressed photo is about 400KB at most).
-- "not valid" so existing rows are not checked; new writes are.
alter table public.profiles drop constraint if exists profiles_data_size;
alter table public.profiles
  add constraint profiles_data_size
  check (jsonb_typeof(data) = 'object' and pg_column_size(data) <= 600 * 1024) not valid;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Effective plan for a user. Internal: clients use my_plan().
create or replace function public.plan_for_user(p_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with active_sub as (
    select s.*
    from public.subscriptions s
    where s.user_id = p_user_id
      and s.status = 'active'
      and (s.current_period_end is null or s.current_period_end > now())
  )
  select jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'canShare', p.can_share,
    'bookLimit', p.book_limit,
    'status', 'active',
    'currentPeriodEnd', a.current_period_end,
    'source', coalesce(a.source, 'default')
  )
  from public.plans p
  left join active_sub a on a.plan_id = p.id
  where p.id = coalesce((select plan_id from active_sub), 'starter')
  limit 1;
$$;
revoke all on function public.plan_for_user(uuid) from public, anon, authenticated;
grant execute on function public.plan_for_user(uuid) to service_role;

create or replace function public.my_plan()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  return public.plan_for_user(auth.uid());
end
$$;
revoke all on function public.my_plan() from public, anon;
grant execute on function public.my_plan() to authenticated;

-- Merges share state into a profile's JSON (creates the row if needed). Internal.
create or replace function public.set_profile_share_state(p_user_id uuid, p_enabled boolean, p_code text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.profiles (id, data)
  values (
    p_user_id,
    jsonb_strip_nulls(jsonb_build_object('shareEnabled', p_enabled, 'shareCode', p_code))
  )
  on conflict (id) do update
  set data = public.profiles.data
    || jsonb_strip_nulls(jsonb_build_object('shareEnabled', p_enabled, 'shareCode', p_code));
$$;
revoke all on function public.set_profile_share_state(uuid, boolean, text) from public, anon, authenticated;
grant execute on function public.set_profile_share_state(uuid, boolean, text) to service_role;

-- Demo self-upgrade/downgrade. Only plans marked self_service are allowed.
-- Everything else must come from an admin or a payment webhook.
create or replace function public.set_my_plan(p_plan_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  target public.plans%rowtype;
begin
  if uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  -- Serialise plan changes and publishing for this user.
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));

  select * into target from public.plans where id = p_plan_id;
  if not found or not target.is_active then
    raise exception 'That plan is not available' using errcode = '22023';
  end if;
  if not target.self_service then
    raise exception 'That plan cannot be chosen from the app' using errcode = '42501';
  end if;

  insert into public.subscriptions (user_id, plan_id, status, current_period_end, source, updated_by, updated_at)
  values (uid, target.id, 'active', null, 'demo', uid, now())
  on conflict (user_id) do update
  set plan_id = excluded.plan_id,
      status = 'active',
      current_period_end = null,
      source = 'demo',
      updated_by = uid,
      updated_at = now();

  if not target.can_share then
    delete from public.shared_shelves where owner_id = uid;
    perform public.set_profile_share_state(uid, false, null);
  end if;

  return public.plan_for_user(uid);
end
$$;
revoke all on function public.set_my_plan(text) from public, anon;
grant execute on function public.set_my_plan(text) to authenticated;

-- Publishes (or refreshes) the caller's shelf. The plan check and the
-- snapshot are both done here, so clients cannot store arbitrary JSON.
-- The code comes from the caller's existing shelf row or is generated here;
-- the user-editable profiles.data.shareCode is never trusted.
create or replace function public.publish_my_shelf()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  share_code text;
  owner_name text;
  shelf_books jsonb;
begin
  if uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  -- Serialise plan changes and publishing for this user.
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
  if not coalesce((public.plan_for_user(uid)->>'canShare')::boolean, false) then
    raise exception 'Share Your Shelf is a Booklod Plus feature' using errcode = '42501';
  end if;

  select code into share_code from public.shared_shelves where owner_id = uid limit 1;
  if share_code is null then
    loop
      share_code := upper(replace(gen_random_uuid()::text, '-', ''));
      exit when not exists (select 1 from public.shared_shelves where code = share_code);
    end loop;
  end if;

  select left(coalesce(nullif(trim(data->>'name'), ''), 'A Booklod reader'), 100)
  into owner_name
  from public.profiles where id = uid;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'title', left(coalesce(e.book->>'title', ''), 500),
      'author', left(coalesce(e.book->>'author', ''), 500),
      'format', left(coalesce(e.book->>'format', ''), 20),
      'readingStatus', left(coalesce(e.book->>'readingStatus', ''), 20),
      'ownershipStatus', left(coalesce(e.book->>'ownershipStatus', ''), 20)
    ) order by e.ord), '[]'::jsonb)
  into shelf_books
  from public.libraries l
  cross join lateral jsonb_array_elements(
    case when jsonb_typeof(l.books) = 'array' then l.books else '[]'::jsonb end
  ) with ordinality as e(book, ord)
  where l.user_id = uid and e.ord <= 200;

  insert into public.shared_shelves (code, owner_id, snapshot, updated_at)
  values (
    share_code,
    uid,
    jsonb_build_object(
      'ownerName', coalesce(owner_name, 'A Booklod reader'),
      'updatedAt', (extract(epoch from now()) * 1000)::bigint,
      'books', coalesce(shelf_books, '[]'::jsonb)
    ),
    now()
  )
  on conflict (code) do update
  set snapshot = excluded.snapshot,
      updated_at = excluded.updated_at
  where public.shared_shelves.owner_id = uid;

  perform public.set_profile_share_state(uid, true, share_code);
  return share_code;
end
$$;
revoke all on function public.publish_my_shelf() from public, anon;
grant execute on function public.publish_my_shelf() to authenticated;

create or replace function public.unpublish_my_shelf()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  delete from public.shared_shelves where owner_id = uid;
  perform public.set_profile_share_state(uid, false, null);
end
$$;
revoke all on function public.unpublish_my_shelf() from public, anon;
grant execute on function public.unpublish_my_shelf() to authenticated;

-- Fix 3: hard caps on library size, plus the plan's book limit. The plan
-- limit only blocks growth, so users over it can still edit and delete.
create or replace function public.save_library_snapshot(
  p_user_id uuid,
  p_expected_revision bigint,
  p_books jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_revision bigint;
  new_count integer;
  old_count integer;
  plan_limit integer;
begin
  -- Only the API calls this, with the service role (no auth.uid()) and the user
  -- id from the verified token. The check still guards against a future re-grant.
  if auth.uid() is not null and auth.uid() is distinct from p_user_id then
    raise exception 'Cannot save another user''s library'
      using errcode = '42501';
  end if;

  if jsonb_typeof(p_books) is distinct from 'array' then
    raise exception 'Library books must be a JSON array'
      using errcode = '22023';
  end if;

  new_count := jsonb_array_length(p_books);
  if new_count > 5000 then
    raise exception 'A library can hold at most 5000 books'
      using errcode = '22023';
  end if;
  if pg_column_size(p_books) > 25 * 1024 * 1024 then
    raise exception 'Your library is too large to save. Try removing some cover images.'
      using errcode = '22023';
  end if;

  plan_limit := (public.plan_for_user(p_user_id)->>'bookLimit')::integer;
  if plan_limit is not null and new_count > plan_limit then
    select jsonb_array_length(books) into old_count
    from public.libraries where user_id = p_user_id;
    if new_count > coalesce(old_count, 0) then
      raise exception 'Your plan allows up to % books. Upgrade to add more.', plan_limit
        using errcode = '22023';
    end if;
  end if;

  -- Optimistic concurrency: returns null when the revision is stale.
  -- (The previous INSERT ... SELECT ... WHERE p_expected_revision = 0 form
  -- never reached ON CONFLICT for revisions > 0, so every save after the
  -- first one was reported as a conflict.)
  if p_expected_revision = 0 then
    insert into public.libraries (user_id, books, revision)
    values (p_user_id, p_books, 1)
    on conflict (user_id) do update
    set books = excluded.books,
        revision = public.libraries.revision + 1
    where public.libraries.revision = 0
    returning revision into saved_revision;
  else
    update public.libraries
    set books = p_books,
        revision = revision + 1
    where user_id = p_user_id
      and revision = p_expected_revision
    returning revision into saved_revision;
  end if;

  return saved_revision;
end
$$;

-- Library writes go through the API only, so its validation can't be skipped.
revoke all on function public.save_library_snapshot(uuid, bigint, jsonb) from public, anon, authenticated;
grant execute on function public.save_library_snapshot(uuid, bigint, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- API rate limits, shared across server instances (service role only)
-- ---------------------------------------------------------------------------
create unlogged table if not exists public.rate_limits (
  key text primary key,
  count integer not null,
  reset_at timestamptz not null
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from public, anon, authenticated;

-- Counts one request. Returns 0 if allowed, otherwise the seconds to wait.
create or replace function public.rate_limit_hit(p_key text, p_limit integer, p_window_ms integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  hits integer;
  resets timestamptz;
begin
  insert into public.rate_limits as r (key, count, reset_at)
  values (p_key, 1, now() + p_window_ms * interval '1 millisecond')
  on conflict (key) do update
  set count = case when r.reset_at <= now() then 1 else r.count + 1 end,
      reset_at = case when r.reset_at <= now() then excluded.reset_at else r.reset_at end
  returning r.count, r.reset_at into hits, resets;

  -- Occasional cleanup so expired keys don't pile up.
  if random() < 0.01 then
    delete from public.rate_limits where reset_at < now() - interval '1 hour';
  end if;

  if hits <= p_limit then
    return 0;
  end if;
  return greatest(1, ceil(extract(epoch from resets - now()))::integer);
end
$$;
revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Admin listing (service role only; the API checks is_admin() first)
-- ---------------------------------------------------------------------------
create or replace function public.admin_list_users(p_search text, p_limit integer, p_offset integer)
returns table (
  id uuid,
  email text,
  name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  plan_id text,
  status text,
  current_period_end timestamptz,
  source text,
  is_admin boolean,
  book_count integer,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    u.id,
    u.email::text,
    coalesce(p.data->>'name', ''),
    u.created_at,
    u.last_sign_in_at,
    coalesce(s.plan_id, 'starter'),
    coalesce(s.status, 'active'),
    s.current_period_end,
    coalesce(s.source, 'default'),
    (a.user_id is not null),
    coalesce(jsonb_array_length(case when jsonb_typeof(l.books) = 'array' then l.books end), 0),
    count(*) over ()
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join public.subscriptions s on s.user_id = u.id
  left join public.admins a on a.user_id = u.id
  left join public.libraries l on l.user_id = u.id
  where coalesce(p_search, '') = ''
     or u.email ilike '%' || p_search || '%'
     or (p.data->>'name') ilike '%' || p_search || '%'
  order by u.created_at desc
  limit least(greatest(coalesce(p_limit, 50), 1), 200)
  offset greatest(coalesce(p_offset, 0), 0);
$$;
revoke all on function public.admin_list_users(text, integer, integer) from public, anon, authenticated;
grant execute on function public.admin_list_users(text, integer, integer) to service_role;

-- Bootstrap the first admin (run once in the SQL editor, with your email):
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'you@example.com';

-- ---------------------------------------------------------------------------
-- Admin-editable catalogue and app settings
-- ---------------------------------------------------------------------------
alter table public.plans add column if not exists features jsonb not null default '[]'::jsonb;
alter table public.plans add column if not exists kind text not null default 'plan';
alter table public.plans drop constraint if exists plans_kind_check;
alter table public.plans add constraint plans_kind_check check (kind in ('plan', 'addon'));
alter table public.plans drop constraint if exists plans_features_check;
alter table public.plans add constraint plans_features_check
  check (jsonb_typeof(features) = 'array' and jsonb_array_length(features) <= 20 and pg_column_size(features) <= 8192);

insert into public.plans
  (id, name, description, price_cents, currency, billing_interval, book_limit, can_share, self_service, sort_order, kind)
values
  ('plus_yearly', 'Booklod Plus (yearly)', 'Everything in Plus, billed once a year.', 89900, 'PHP', 'year', null, true, true, 11, 'plan'),
  ('capacity_pack', 'Capacity Pack', '+100 permanent slots. Stack as many as you need.', 34900, 'PHP', 'one_time', null, false, false, 20, 'addon')
on conflict (id) do nothing;

update public.plans set features = '["All core tracking: read status, ownership, notes","Title search & auto-fill","Reading digest & Books by Month","Slots never expire, never re-billed"]'::jsonb
where id = 'starter' and features = '[]'::jsonb;
update public.plans set features = '["Unlimited book slots","Cover photos synced across devices","Full digest history & export","Share Your Shelf: invite-only, no public feed","Coming soon: shareable digest cards, reading streaks"]'::jsonb
where id in ('plus', 'plus_yearly') and features = '[]'::jsonb;
update public.plans set features = '["Same core tracking as Starter","Cheapest way to grow past 20 books","Stackable: buy again anytime","No subscription required"]'::jsonb
where id = 'capacity_pack' and features = '[]'::jsonb;

-- Add-ons are listed on the pricing page but are never a user's plan.
create or replace function public.plan_is_assignable(p_plan_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.plans where id = p_plan_id and kind = 'plan');
$$;
revoke all on function public.plan_is_assignable(text) from public, anon, authenticated;
grant execute on function public.plan_is_assignable(text) to service_role;

alter table public.subscriptions drop constraint if exists subscriptions_plan_kind;
-- (enforced in set_my_plan and the admin API; a CHECK cannot reference another table)

create or replace function public.set_my_plan(p_plan_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  target public.plans%rowtype;
begin
  if uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  -- Serialise plan changes and publishing for this user.
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));

  select * into target from public.plans where id = p_plan_id;
  if not found or not target.is_active or target.kind <> 'plan' then
    raise exception 'That plan is not available' using errcode = '22023';
  end if;
  if not target.self_service then
    raise exception 'That plan cannot be chosen from the app' using errcode = '42501';
  end if;

  insert into public.subscriptions (user_id, plan_id, status, current_period_end, source, updated_by, updated_at)
  values (uid, target.id, 'active', null, 'demo', uid, now())
  on conflict (user_id) do update
  set plan_id = excluded.plan_id,
      status = 'active',
      current_period_end = null,
      source = 'demo',
      updated_by = uid,
      updated_at = now();

  if not target.can_share then
    delete from public.shared_shelves where owner_id = uid;
    perform public.set_profile_share_state(uid, false, null);
  end if;

  return public.plan_for_user(uid);
end
$$;
revoke all on function public.set_my_plan(text) from public, anon;
grant execute on function public.set_my_plan(text) to authenticated;

create table if not exists public.app_settings (
  key text primary key check (key in (
    'announcement_enabled',
    'announcement_text',
    'support_email',
    'pricing_footnote'
  )),
  value jsonb not null check (pg_column_size(value) <= 4096),
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);
create index if not exists app_settings_updated_by_idx on public.app_settings (updated_by);

insert into public.app_settings (key, value) values
  ('announcement_enabled', 'false'::jsonb),
  ('announcement_text', '""'::jsonb),
  ('support_email', '""'::jsonb),
  ('pricing_footnote', '"This preview simulates purchases and subscriptions for demo purposes. No real payment is processed. Prices shown in Philippine pesos."'::jsonb)
on conflict (key) do nothing;

alter table public.app_settings enable row level security;
drop policy if exists "App settings are public" on public.app_settings;
create policy "App settings are public"
  on public.app_settings for select to anon, authenticated
  using (true);
revoke all on public.app_settings from anon, authenticated;
grant select on public.app_settings to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Review fixes (2026-11-07)
-- ---------------------------------------------------------------------------
-- A shelf is only visible while its owner's effective plan includes sharing,
-- so it disappears automatically when a subscription expires.
create or replace function public.get_shared_shelf(share_code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select s.snapshot
  from public.shared_shelves s
  where share_code ~ '^[A-Fa-f0-9]{32}$'
    and s.code = upper(share_code)
    and coalesce((public.plan_for_user(s.owner_id)->>'canShare')::boolean, false)
  limit 1;
$$;
revoke all on function public.get_shared_shelf(text) from public;
grant execute on function public.get_shared_shelf(text) to anon, authenticated;
