-- Apply once through a tracked Supabase migration, after supabase-schema.sql.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

alter table public.profiles add column if not exists avatar_url text;
alter table public.drops add column if not exists translations jsonb not null default '{}';
alter table public.comments add column if not exists author_name text;
alter table public.feedback add column if not exists email_sent_at timestamptz;
update public.comments c set author_name = case when p.display_name like '%@%' then 'Membro' else coalesce(p.display_name,'Membro') end from public.profiles p where c.author_id=p.id and c.author_name is null;

create table public.account_details (
 id uuid primary key references public.profiles(id) on delete cascade,
 phone text check(length(phone)<=30), instagram text check(length(instagram)<=200)
);
create table public.subscriptions (
 invoice_id text primary key,
 user_id uuid references public.profiles(id) on delete cascade,
 email text not null,
 product_id text not null check(product_id in ('3095513','3098697')),
 contract_id text,
 status text not null check(status in ('active','cancelled','refunded','chargeback')),
 current_period_end timestamptz not null,
 paid_at timestamptz not null,
 invite_sent_at timestamptz,
 updated_at timestamptz not null default now()
);
create index subscriptions_user_end on public.subscriptions(user_id,current_period_end);
create index subscriptions_email on public.subscriptions(lower(email));
create index subscriptions_contract on public.subscriptions(contract_id);
create table public.eduzz_events (id text primary key, event text not null, processed_at timestamptz not null default now());
create table public.palettes (id uuid primary key default gen_random_uuid(), title text not null, description text, colors text[] not null, translations jsonb not null default '{}', created_at timestamptz not null default now());
create table public.font_pairs (id uuid primary key default gen_random_uuid(), title text not null, description text, heading_font text not null, body_font text not null, url text, translations jsonb not null default '{}', created_at timestamptz not null default now());
create table public.icon_packs (id uuid primary key default gen_random_uuid(), title text not null, description text, cover_url text, canva_url text not null, translations jsonb not null default '{}', created_at timestamptz not null default now());

-- Private predicates avoid recursive profile policies. No caller-supplied user ID.
create function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.profiles where id=auth.uid() and is_admin);
$$;
create function private.has_access() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (private.is_admin() or exists(select 1 from public.subscriptions where user_id=auth.uid() and status in ('active','cancelled') and current_period_end>now()));
$$;
revoke all on function private.is_admin(),private.has_access() from public,anon;
grant execute on function private.is_admin(),private.has_access() to authenticated;

create function public.has_club_access() returns boolean language sql stable security invoker set search_path='' as $$ select private.has_access(); $$;
revoke all on function public.has_club_access() from public,anon;
grant execute on function public.has_club_access() to authenticated;

-- Replace permissive original policies, including publicly readable profiles.
do $$ declare p record; begin
 for p in select policyname,tablename from pg_policies where schemaname='public' and tablename in ('profiles','drops','comments','feedback') loop
  execute format('drop policy %I on public.%I',p.policyname,p.tablename);
 end loop;
end $$;
create policy profile_read on public.profiles for select to authenticated using(id=(select auth.uid()) or (select private.is_admin()));
create policy profile_edit on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
revoke update on public.profiles from authenticated,anon;
grant update(display_name,avatar_url) on public.profiles to authenticated;
grant select on public.profiles to authenticated;

alter table public.account_details enable row level security;
create policy details_read on public.account_details for select to authenticated using(id=(select auth.uid()));
create policy details_insert on public.account_details for insert to authenticated with check(id=(select auth.uid()));
create policy details_update on public.account_details for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
grant select,insert,update on public.account_details to authenticated;
alter table public.subscriptions enable row level security;
create policy subscription_read on public.subscriptions for select to authenticated using(user_id=(select auth.uid()) or (select private.is_admin()));
grant select on public.subscriptions to authenticated;
revoke insert,update,delete on public.subscriptions from anon,authenticated;
alter table public.eduzz_events enable row level security;
revoke all on public.eduzz_events from anon,authenticated;
grant all on public.eduzz_events,public.subscriptions to service_role;

do $$ declare tbl text; begin
 foreach tbl in array array['drops','palettes','font_pairs','icon_packs'] loop
  execute format('alter table public.%I enable row level security',tbl);
  execute format('create policy content_read on public.%I for select to authenticated using ((select private.has_access()))',tbl);
  execute format('create policy content_insert on public.%I for insert to authenticated with check ((select private.is_admin()))',tbl);
  execute format('create policy content_update on public.%I for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',tbl);
  execute format('create policy content_delete on public.%I for delete to authenticated using ((select private.is_admin()))',tbl);
  execute format('grant select,insert,update,delete on public.%I to authenticated',tbl);
 end loop;
end $$;
create policy comments_read on public.comments for select to authenticated using((select private.has_access()));
create policy comments_insert on public.comments for insert to authenticated with check(author_id=(select auth.uid()) and (select private.has_access()) and length(trim(body)) between 1 and 3000);
create index if not exists comments_drop_created on public.comments(drop_id,created_at desc);
create index if not exists comments_author on public.comments(author_id);
create index if not exists feedback_author on public.feedback(author_id);
create policy feedback_insert on public.feedback for insert to authenticated with check(author_id=(select auth.uid()) and (select private.has_access()) and length(trim(message)) between 1 and 5000);
create policy feedback_admin_read on public.feedback for select to authenticated using((select private.is_admin()));
grant select,insert on public.comments to authenticated;
grant insert on public.feedback to authenticated;

-- Assign comment names on the server, so authors cannot impersonate another member.
create function private.comment_author() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or new.author_id<>auth.uid() then raise exception 'unauthorized'; end if;
 select case when display_name like '%@%' then 'Membro' else coalesce(nullif(trim(display_name),''),'Membro') end into new.author_name from public.profiles where id=auth.uid();
 return new;
end $$;
revoke all on function private.comment_author() from public,anon,authenticated;
create trigger comment_author before insert on public.comments for each row execute function private.comment_author();

-- Accept account creation by invitation/admin only. An arbitrary signup never grants membership.
create function private.handle_invited_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.invited_at is null then raise exception 'invite required'; end if;
 insert into public.profiles(id,display_name) values(new.id,coalesce(nullif(new.raw_user_meta_data->>'display_name',''),'Membro'));
 update public.subscriptions set user_id=new.id where lower(email)=lower(new.email) and user_id is null;
 return new;
end $$;
revoke all on function private.handle_invited_user() from public,anon,authenticated;
drop trigger on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_invited_user();
drop function public.handle_new_user();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('club-media','club-media',false,5242880,array['image/jpeg','image/png','image/webp']);
create policy club_media_read on storage.objects for select to authenticated using(bucket_id='club-media' and ((select private.has_access()) or (storage.foldername(name))[2]=(select auth.uid())::text));
create policy club_media_insert on storage.objects for insert to authenticated with check(bucket_id='club-media' and (storage.foldername(name))[2]=(select auth.uid())::text and (((storage.foldername(name))[1]='covers' and (select private.is_admin())) or (storage.foldername(name))[1]='avatars'));

-- Atomic, idempotent invoice processing; refunds are terminal for an invoice.
create function private.user_for_email(p_email text) returns uuid language sql stable security definer set search_path='' as $$
 select id from auth.users where lower(email)=lower(p_email) and auth.role()='service_role';
$$;
revoke all on function private.user_for_email(text) from public,anon,authenticated;
grant usage on schema private to service_role;
grant execute on function private.user_for_email(text) to service_role;
create function public.process_eduzz_invoice(p_event_id text,p_event text,p_invoice text,p_email text,p_product text,p_contract text,p_paid_at timestamptz,p_end timestamptz) returns void language plpgsql security invoker set search_path='' as $$
declare v_user uuid; v_status text;
begin
 insert into public.eduzz_events(id,event) values(p_event_id,p_event) on conflict do nothing;
 if not found then return; end if;
 if p_product not in ('3095513','3098697') then raise exception 'unknown product'; end if;
 v_user := private.user_for_email(p_email);
 v_status := case p_event when 'myeduzz.invoice_paid' then 'active' when 'myeduzz.invoice_refunded' then 'refunded' when 'myeduzz.invoice_chargeback' then 'chargeback' else null end;
 if v_status is null then raise exception 'unsupported event'; end if;
 insert into public.subscriptions(invoice_id,user_id,email,product_id,contract_id,status,paid_at,current_period_end)
 values(p_invoice,v_user,lower(p_email),p_product,p_contract,v_status,p_paid_at,p_end)
 on conflict(invoice_id) do update set
 status=case when subscriptions.status in ('refunded','chargeback') then subscriptions.status else excluded.status end,
 user_id=coalesce(subscriptions.user_id,excluded.user_id), updated_at=now();
end $$;
revoke all on function public.process_eduzz_invoice(text,text,text,text,text,text,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.process_eduzz_invoice(text,text,text,text,text,text,timestamptz,timestamptz) to service_role;
