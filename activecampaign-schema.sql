-- Access links are credentials. This table has no client/admin-dashboard access.
create table public.club_invitation_links (
 email text primary key,
 token_hash text,
 token_type text check(token_type in ('invite','recovery')),
 generated_at timestamptz,
 lease_id uuid,
 locked_until timestamptz
);
alter table public.club_invitation_links enable row level security;
revoke all on public.club_invitation_links from public,anon,authenticated;
grant select,insert,update,delete on public.club_invitation_links to service_role;

create function public.claim_club_invitation(p_email text,p_lease uuid)
returns boolean language plpgsql security invoker set search_path='' as $$
declare claimed integer;
begin
 insert into public.club_invitation_links(email) values(p_email) on conflict do nothing;
 update public.club_invitation_links set lease_id=p_lease,locked_until=now()+interval '2 minutes'
 where email=p_email and (locked_until is null or locked_until<now());
 get diagnostics claimed=row_count;
 return claimed=1;
end;
$$;
revoke all on function public.claim_club_invitation(text,uuid) from public,anon,authenticated;
grant execute on function public.claim_club_invitation(text,uuid) to service_role;
