-- ============================================================
-- GhostRSVP Schema
-- Safe to run MULTIPLE times (idempotent).
-- Run via Supabase Dashboard → SQL Editor → New query → Run.
--
-- Covers:
--  1. Tables (events, rsvps) + indexes
--  2. RLS & Permissions (allows guests & admins to submit RSVPs)
--  3. Optional email trigger (self-guarding and fail-safe)
-- ============================================================

-- ------------------------------------------------------------
-- 1. CLEAN SLATE (Drops previous triggers & policies)
-- ------------------------------------------------------------
drop trigger if exists on_rsvp_created on rsvps;
drop function if exists notify_new_rsvp() cascade;

-- Clean existing policies on events
drop policy if exists "Public can read events"    on events;
drop policy if exists "Admins can read events"     on events;
drop policy if exists "Admins can insert events"   on events;
drop policy if exists "Admins can update events"   on events;
drop policy if exists "Admins can delete events"   on events;
drop policy if exists "Anyone can read events"     on events;

-- Clean existing policies on rsvps
drop policy if exists "Public can submit rsvp"     on rsvps;
drop policy if exists "Anyone can submit rsvp"     on rsvps;
drop policy if exists "Admins can read rsvps"      on rsvps;
drop policy if exists "Admins can delete rsvps"    on rsvps;
drop policy if exists "Admins can update rsvps"    on rsvps;

-- ------------------------------------------------------------
-- 2. TABLES & COLUMNS
-- ------------------------------------------------------------
create table if not exists events (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  event_date date not null,
  venue      text not null,
  host       text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists rsvps (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  name       text not null,
  email      text not null,
  phone      text not null,
  source     text,
  created_at timestamptz not null default now()
);

-- Ensure 'source' column exists if table was created previously without it
alter table rsvps add column if not exists source text;

-- Index for event lookup performance
create index if not exists rsvps_event_id_idx on rsvps(event_id);

-- ------------------------------------------------------------
-- 3. PERMISSIONS & ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------
-- Ensure RLS is active
alter table events enable row level security;
alter table rsvps  enable row level security;

-- Grant schema and table privileges to anon and authenticated roles
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table events to anon, authenticated;
grant select, insert, update, delete on table rsvps  to anon, authenticated;

-- [EVENTS POLICIES]
-- Anyone (guests or logged-in admins) can read event details to display the RSVP page
create policy "Anyone can read events"
  on events for select
  to anon, authenticated
  using (true);

-- Admin only: create events
create policy "Admins can insert events"
  on events for insert
  to authenticated
  with check (true);

-- Admin only: update events (toggle active status / edit details)
create policy "Admins can update events"
  on events for update
  to authenticated
  using (true);

-- Admin only: delete events
create policy "Admins can delete events"
  on events for delete
  to authenticated
  using (true);

-- [RSVPS POLICIES]
-- Anyone (both anonymous guests AND logged-in admins testing the form) can submit an RSVP
create policy "Anyone can submit rsvp"
  on rsvps for insert
  to anon, authenticated
  with check (true);

-- Admin only: view RSVP lists and counts on the dashboard
create policy "Admins can read rsvps"
  on rsvps for select
  to authenticated
  using (true);

-- Admin only: delete RSVPs
create policy "Admins can delete rsvps"
  on rsvps for delete
  to authenticated
  using (true);

-- ------------------------------------------------------------
-- 4. EMAIL PER RSVP (Optional Edge Function Webhook)
--    If configured, triggers edge function on each new RSVP.
--    Includes exception handling so email failures NEVER block
--    or fail the guest's RSVP submission!
-- ------------------------------------------------------------
do $$
declare
  fn_url text := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/notify-rsvp';
  fn_key text := '<YOUR_SUPABASE_ANON_KEY>';
begin
  begin
    create extension if not exists pg_net;
  exception when others then
    raise notice 'RSVP: pg_net unavailable on this project — skipping email trigger.';
  end;

  if exists (select 1 from pg_extension where extname = 'pg_net')
     and position('<YOUR_PROJECT_REF>' in fn_url) = 0
     and position('<YOUR_SUPABASE_ANON_KEY>' in fn_key) = 0 then

    execute format(
      'create or replace function notify_new_rsvp()
       returns trigger as $trigger$
       begin
         begin
           perform net.http_post(
             url := %L,
             headers := jsonb_build_object(
               ''Content-Type'', ''application/json'',
               ''Authorization'', ''Bearer %s''
             ),
             body := jsonb_build_object(
               ''id'', new.id,
               ''event_id'', new.event_id,
               ''name'', new.name,
               ''email'', new.email,
               ''phone'', new.phone,
               ''source'', new.source
             )
           );
         exception when others then
           -- Fail-safe: if the webhook/email fails, do NOT roll back the guest RSVP!
           raise warning ''notify_new_rsvp error: %'', sqlerrm;
         end;
         return new;
       end;
       $trigger$ language plpgsql security definer',
       fn_url, fn_key);

    execute 'create trigger on_rsvp_created
             after insert on rsvps
             for each row execute function notify_new_rsvp()';

    raise notice 'RSVP: email trigger enabled.';
  else
    raise notice 'RSVP: email trigger skipped (configure URL + key to enable).';
  end if;
end $$;