-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- USERS (extends auth.users)
-- ============================================================
create table if not exists public.users (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  age_range text check (age_range in ('18-24', '25-34', '35-44', '45+')),
  interests text[],
  budget_range text check (budget_range in ('low', 'medium', 'high', 'unlimited')),
  is_public boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- BUCKET ITEMS
-- ============================================================
create table if not exists public.bucket_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  category text check (category in ('adventure', 'travel', 'food', 'skill', 'life')),
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'done')),
  difficulty int check (difficulty between 1 and 5),
  estimated_cost numeric,
  target_date date,
  completed_at timestamptz,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- JOURNAL ENTRIES
-- ============================================================
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.bucket_items(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  content text,
  photo_url text,
  vibe text check (vibe in ('excited', 'nervous', 'proud', 'grateful', 'adventurous')),
  created_at timestamptz default now()
);

-- ============================================================
-- AI PLANS
-- ============================================================
create table if not exists public.ai_plans (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.bucket_items(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  plan jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- AI SUGGESTIONS
-- ============================================================
create table if not exists public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text,
  reason text,
  category text check (category in ('adventure', 'travel', 'food', 'skill', 'life')),
  status text default 'pending' check (status in ('pending', 'accepted', 'dismissed')),
  created_at timestamptz default now()
);

-- ============================================================
-- FOLLOWS
-- ============================================================
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references public.users(id) on delete cascade,
  following_id uuid references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

-- ============================================================
-- REACTIONS
-- ============================================================
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.bucket_items(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  type text default 'inspired',
  created_at timestamptz default now(),
  unique(item_id, user_id)
);

-- ============================================================
-- FIRSTS
-- ============================================================
create table if not exists public.firsts (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.bucket_items(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  scope text check (scope in ('school', 'city', 'global')),
  scope_value text,
  created_at timestamptz default now()
);

-- ============================================================
-- COMPLETION CARDS
-- ============================================================
create table if not exists public.completion_cards (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.bucket_items(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  card_url text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.bucket_items enable row level security;
alter table public.journal_entries enable row level security;
alter table public.ai_plans enable row level security;
alter table public.ai_suggestions enable row level security;
alter table public.follows enable row level security;
alter table public.reactions enable row level security;
alter table public.firsts enable row level security;
alter table public.completion_cards enable row level security;

-- Users: anyone can read public profiles, owners can do anything
create policy "Public profiles are viewable" on public.users
  for select using (is_public = true or auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Bucket items
create policy "Public items viewable" on public.bucket_items
  for select using (is_public = true or auth.uid() = user_id);

create policy "Owners manage items" on public.bucket_items
  for all using (auth.uid() = user_id);

-- Journal entries
create policy "Journal: owners manage" on public.journal_entries
  for all using (auth.uid() = user_id);

-- AI plans
create policy "AI plans: owners only" on public.ai_plans
  for all using (auth.uid() = user_id);

-- AI suggestions
create policy "Suggestions: owners only" on public.ai_suggestions
  for all using (auth.uid() = user_id);

-- Follows
create policy "Follows: viewable by all" on public.follows
  for select using (true);

create policy "Follows: manage own" on public.follows
  for all using (auth.uid() = follower_id);

-- Reactions
create policy "Reactions: viewable by all" on public.reactions
  for select using (true);

create policy "Reactions: manage own" on public.reactions
  for all using (auth.uid() = user_id);

-- Firsts
create policy "Firsts: viewable by all" on public.firsts
  for select using (true);

-- Completion cards
create policy "Cards: owners manage" on public.completion_cards
  for all using (auth.uid() = user_id);

create policy "Cards: public viewable" on public.completion_cards
  for select using (true);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "Avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Users can upload own avatar" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own avatar" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
