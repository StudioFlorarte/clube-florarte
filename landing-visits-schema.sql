create table public.landing_page_visits (
  id uuid primary key,
  visited_at timestamptz not null default now()
);
create index landing_page_visits_visited_at_idx on public.landing_page_visits (visited_at);
alter table public.landing_page_visits enable row level security;
revoke all on public.landing_page_visits from anon, authenticated;
grant select on public.landing_page_visits to authenticated;
grant all on public.landing_page_visits to service_role;
create policy "Admins can read landing visits" on public.landing_page_visits
for select to authenticated using (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true));

