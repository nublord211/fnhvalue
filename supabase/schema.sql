-- Tradeposts storage
-- Safe to re-run: every statement is idempotent.

create table if not exists public.tradeposts (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- If an older version of this table stored payload as text, promote it to jsonb.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tradeposts'
      and column_name = 'payload' and data_type <> 'jsonb'
  ) then
    alter table public.tradeposts
      alter column payload type jsonb using payload::jsonb;
  end if;
end $$;

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

/* --------------------------------------------------------------------------
   Row Level Security
   --------------------------------------------------------------------------
   RLS was enabled on this table with NO policies, which is why the API kept
   returning an empty list: the service-role key bypasses RLS so inserts worked,
   but reads went through the anon key and were silently filtered to 0 rows.

   The board is a public feed, so anon may read. All writes go through the
   Next.js API routes using the service role key (which bypasses RLS), so no
   INSERT/UPDATE/DELETE policy is granted to anon.
-------------------------------------------------------------------------- */

alter table public.tradeposts enable row level security;

drop policy if exists "Tradeposts are publicly readable" on public.tradeposts;
create policy "Tradeposts are publicly readable"
  on public.tradeposts
  for select
  to anon, authenticated
  using (true);

-- Reload the PostgREST schema cache so the changes are picked up immediately.
notify pgrst, 'reload schema';
