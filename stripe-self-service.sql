create table public.stripe_access_requests (
  email text primary key,
  requested_at timestamptz not null default now()
);
alter table public.stripe_access_requests enable row level security;
revoke all on public.stripe_access_requests from public, anon, authenticated;
grant select, insert, update on public.stripe_access_requests to service_role;

create function public.request_stripe_access(p_email text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare v_allowed boolean;
begin
  if p_email is null or length(p_email)>254 or p_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then return false; end if;
  if not exists (
    select 1 from public.subscriptions
    where email=lower(p_email) and status='active' and current_period_end>now()
      and product_id in ('prod_VGg95UwxDmMZ8w','prod_VGgOzAJYZplZ8y','prod_VGgPZhHflXlyZo')
  ) then return false; end if;
  insert into public.stripe_access_requests(email,requested_at) values(lower(p_email),now())
  on conflict(email) do update set requested_at=excluded.requested_at
    where public.stripe_access_requests.requested_at < now()-interval '5 minutes'
  returning true into v_allowed;
  return coalesce(v_allowed,false);
end $$;
revoke all on function public.request_stripe_access(text) from public,anon,authenticated;
grant execute on function public.request_stripe_access(text) to service_role;

