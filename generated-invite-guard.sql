-- generateLink inserts the Auth user before setting invited_at.
-- Keep public signup disabled. Only server-owned, live invitation leases
-- backed by a valid subscription can provision a user through this path.
create or replace function private.handle_invited_user()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.invited_at is null and not exists (
  select 1 from public.club_invitation_links l
  where l.email=lower(new.email) and l.lease_id is not null and l.locked_until>now()
  and exists(select 1 from public.subscriptions s where lower(s.email)=lower(new.email)
   and s.status='active' and s.current_period_end>now() and s.invite_sent_at is null)
 ) then raise exception 'invite required'; end if;
 insert into public.profiles(id,display_name) values(new.id,coalesce(nullif(new.raw_user_meta_data->>'display_name',''),'Membro'));
 update public.subscriptions set user_id=new.id where lower(email)=lower(new.email) and user_id is null;
 return new;
end;
$$;

