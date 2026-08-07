-- Drop old table if you want fresh start
-- drop table if not exists public.tradeposts;

create table if not exists public.tradeposts (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists tradeposts_created_at_idx on public.tradeposts (created_at desc);
create index if not exists tradeposts_updated_at_idx on public.tradeposts (updated_at desc);

-- Auto-update the updated_at timestamp
create or replace function update_tradeposts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tradeposts_update_timestamp on public.tradeposts;
create trigger tradeposts_update_timestamp
  before update on public.tradeposts
  for each row
  execute function update_tradeposts_updated_at();