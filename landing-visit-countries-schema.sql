alter table public.landing_page_visits add column country_code text check (country_code is null or country_code ~ '^[A-Z]{2}$');
create or replace function public.landing_visit_countries(since_time timestamptz default null, until_time timestamptz default now())
returns table(country_code text, visits bigint)
language sql stable security invoker set search_path = public, pg_temp
as $$
 select v.country_code, count(*) as visits from public.landing_page_visits v
 where (since_time is null or v.visited_at >= since_time) and v.visited_at < until_time
 group by v.country_code order by visits desc, v.country_code nulls last;
$$;
revoke all on function public.landing_visit_countries(timestamptz,timestamptz) from public, anon;
grant execute on function public.landing_visit_countries(timestamptz,timestamptz) to authenticated;

