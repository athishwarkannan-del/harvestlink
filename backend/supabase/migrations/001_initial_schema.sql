-- ============================================================
-- HarvestLink — Initial Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Enable UUID extension ──────────────────────────────────
create extension if not exists "pgcrypto";

-- ── profiles ──────────────────────────────────────────────
-- Extends Supabase auth.users with HarvestLink-specific fields
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null check (role in ('consumer', 'farmer', 'admin')),
  location    text,
  phone       text,
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, location)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'consumer'),
    coalesce(new.raw_user_meta_data->>'location', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── demands ───────────────────────────────────────────────
-- Community posts: "I need X kg of crop Y by date Z"
create table if not exists public.demands (
  id           uuid primary key default gen_random_uuid(),
  consumer_id  uuid not null references public.profiles(id) on delete cascade,
  crop_name    text not null,
  quantity_kg  numeric(10,2) not null check (quantity_kg > 0),
  needed_by    date,
  location     text,
  notes        text,
  status       text not null default 'open'
                 check (status in ('open', 'partially_fulfilled', 'fulfilled', 'cancelled')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── allocations ───────────────────────────────────────────
-- Farmer responds to a demand with a crop allocation offer
create table if not exists public.allocations (
  id             uuid primary key default gen_random_uuid(),
  demand_id      uuid not null references public.demands(id) on delete cascade,
  farmer_id      uuid not null references public.profiles(id) on delete cascade,
  allocated_kg   numeric(10,2) not null check (allocated_kg > 0),
  price_per_kg   numeric(10,2) not null check (price_per_kg >= 0),
  message        text,
  status         text not null default 'pending'
                   check (status in ('pending', 'confirmed', 'rejected', 'cancelled')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (demand_id, farmer_id)
);

-- ── subscriptions ─────────────────────────────────────────
-- Consumer subscribes to a farmer for recurring crop delivery
create table if not exists public.subscriptions (
  id           uuid primary key default gen_random_uuid(),
  consumer_id  uuid not null references public.profiles(id) on delete cascade,
  farmer_id    uuid not null references public.profiles(id) on delete cascade,
  crop_name    text not null,
  quantity_kg  numeric(10,2) not null check (quantity_kg > 0),
  frequency    text not null default 'weekly'
                 check (frequency in ('weekly', 'biweekly', 'monthly')),
  status       text not null default 'active'
                 check (status in ('active', 'paused', 'cancelled')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── harvests ──────────────────────────────────────────────
-- Farmer logs and tracks their crop harvest progress
create table if not exists public.harvests (
  id             uuid primary key default gen_random_uuid(),
  farmer_id      uuid not null references public.profiles(id) on delete cascade,
  crop_name      text not null,
  field_name     text,
  estimated_kg   numeric(10,2) check (estimated_kg > 0),
  actual_kg      numeric(10,2) check (actual_kg >= 0),
  harvest_date   date,
  notes          text,
  status         text not null default 'growing'
                   check (status in ('growing', 'ready', 'harvested', 'sold')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── updated_at triggers ───────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at    before update on public.profiles    for each row execute procedure public.set_updated_at();
create trigger set_demands_updated_at     before update on public.demands     for each row execute procedure public.set_updated_at();
create trigger set_allocations_updated_at before update on public.allocations for each row execute procedure public.set_updated_at();
create trigger set_subscriptions_updated_at before update on public.subscriptions for each row execute procedure public.set_updated_at();
create trigger set_harvests_updated_at    before update on public.harvests    for each row execute procedure public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────
alter table public.profiles     enable row level security;
alter table public.demands      enable row level security;
alter table public.allocations  enable row level security;
alter table public.subscriptions enable row level security;
alter table public.harvests     enable row level security;

-- profiles: users can read any profile, only update their own
create policy "profiles_select_all"  on public.profiles for select using (true);
create policy "profiles_insert_own"  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"  on public.profiles for update using (auth.uid() = id);

-- demands: anyone can read open demands; only owner can mutate
create policy "demands_select_all"   on public.demands for select using (true);
create policy "demands_insert_own"   on public.demands for insert with check (auth.uid() = consumer_id);
create policy "demands_update_own"   on public.demands for update using (auth.uid() = consumer_id);
create policy "demands_delete_own"   on public.demands for delete using (auth.uid() = consumer_id);

-- allocations: farmer sees their own; consumer sees allocations on their demands
create policy "allocations_select"   on public.allocations for select
  using (
    auth.uid() = farmer_id
    or auth.uid() = (select consumer_id from public.demands where id = demand_id)
  );
create policy "allocations_insert_farmer" on public.allocations for insert with check (auth.uid() = farmer_id);
create policy "allocations_update"   on public.allocations for update
  using (
    auth.uid() = farmer_id
    or auth.uid() = (select consumer_id from public.demands where id = demand_id)
  );

-- subscriptions: each party sees their own
create policy "subscriptions_select" on public.subscriptions for select
  using (auth.uid() = consumer_id or auth.uid() = farmer_id);
create policy "subscriptions_insert_consumer" on public.subscriptions for insert with check (auth.uid() = consumer_id);
create policy "subscriptions_update" on public.subscriptions for update using (auth.uid() = consumer_id);
create policy "subscriptions_delete" on public.subscriptions for delete using (auth.uid() = consumer_id);

-- harvests: farmer manages their own; others can view
create policy "harvests_select_all"  on public.harvests for select using (true);
create policy "harvests_insert_own"  on public.harvests for insert with check (auth.uid() = farmer_id);
create policy "harvests_update_own"  on public.harvests for update using (auth.uid() = farmer_id);
create policy "harvests_delete_own"  on public.harvests for delete using (auth.uid() = farmer_id);

-- ── Indexes ───────────────────────────────────────────────
create index if not exists demands_consumer_id_idx       on public.demands(consumer_id);
create index if not exists demands_status_idx            on public.demands(status);
create index if not exists demands_crop_name_idx         on public.demands(crop_name);
create index if not exists allocations_demand_id_idx     on public.allocations(demand_id);
create index if not exists allocations_farmer_id_idx     on public.allocations(farmer_id);
create index if not exists subscriptions_consumer_id_idx on public.subscriptions(consumer_id);
create index if not exists subscriptions_farmer_id_idx   on public.subscriptions(farmer_id);
create index if not exists harvests_farmer_id_idx        on public.harvests(farmer_id);
create index if not exists harvests_status_idx           on public.harvests(status);
