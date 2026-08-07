create table if not exists public.tradeposts (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz default now()
);

create index if not exists tradeposts_created_at_idx on public.tradeposts (created_at desc);
