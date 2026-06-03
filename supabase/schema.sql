-- SYNTH.FM cloud sync schema.
-- Run this in the Supabase dashboard → SQL Editor → New query → Run.
--
-- Stores each user's library (liked tracks, playlists, genre prefs) as JSON,
-- one row per user, protected by Row Level Security so a user can only ever
-- read/write their own row.

create table if not exists public.user_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  liked      jsonb not null default '[]'::jsonb,
  playlists  jsonb not null default '[]'::jsonb,
  genres     jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

-- A user may only touch their own row.
create policy "own row - select" on public.user_state
  for select using (auth.uid() = user_id);

create policy "own row - insert" on public.user_state
  for insert with check (auth.uid() = user_id);

create policy "own row - update" on public.user_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
