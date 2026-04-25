-- Kjør dette i Supabase SQL Editor

create table workers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null unique,
  wage numeric not null default 200,
  color text not null default '#a8d878',
  paid_minutes numeric not null default 0
);

create table entries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  worker_id uuid references workers(id) on delete cascade,
  date date not null,
  category text not null,
  start_time time not null,
  end_time time not null,
  duration_minutes numeric not null,
  description text
);

-- Tillat åpen lesing og skriving (siden alle bruker samme konto)
alter table workers enable row level security;
alter table entries enable row level security;

create policy "Alle kan lese workers" on workers for select using (true);
create policy "Alle kan endre workers" on workers for all using (true);
create policy "Alle kan lese entries" on entries for select using (true);
create policy "Alle kan endre entries" on entries for all using (true);
