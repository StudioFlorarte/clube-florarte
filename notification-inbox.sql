create or replace function private.notify_club_content() returns trigger language plpgsql security invoker set search_path='' as $$
declare l text; destination text; heading text; record_data jsonb;
begin
 if TG_OP='DELETE' then
  delete from public.club_notifications where source_type=TG_TABLE_NAME and source_id=old.id;
  return old;
 end if;
 record_data:=to_jsonb(new);
 if TG_TABLE_NAME='feed_posts' then
  if not new.published then
   delete from public.club_notifications where source_type=TG_TABLE_NAME and source_id=new.id;
   return new;
  end if;
  delete from public.club_notifications where source_type=TG_TABLE_NAME and source_id=new.id and locale<>new.locale;
  heading:=case new.locale when 'pt' then 'Nova publicação no Clube' when 'en' then 'New Club post' when 'fr' then 'Nouvelle publication du Club' else 'Nueva publicación del Club' end;
  insert into public.club_notifications(source_type,source_id,locale,title,href) values(TG_TABLE_NAME,new.id,new.locale,heading,'/dashboard/'||new.id) on conflict(source_type,source_id,locale) do update set title=excluded.title,href=excluded.href;
 else
  destination:=case TG_TABLE_NAME when 'drops' then '/drops/'||new.id when 'icon_packs' then '/icons/'||new.id else '/palettes' end;
  foreach l in array array['pt','en','fr','es'] loop
   heading:=coalesce(nullif(record_data->'translations'->l->>'title',''),record_data->>'title');
   insert into public.club_notifications(source_type,source_id,locale,title,href) values(TG_TABLE_NAME,new.id,l,heading,destination) on conflict(source_type,source_id,locale) do update set title=excluded.title,href=excluded.href;
  end loop;
 end if;
 return new;
end; $$;

update public.club_notifications set href='/dashboard/'||source_id where source_type='feed_posts';
update public.club_notifications set href='/icons/'||source_id where source_type='icon_packs';
create or replace function public.notification_inbox(request_locale text, page_number integer default 0)
returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('unread',(select count(*) from public.club_notifications n where n.locale=request_locale and not exists(select 1 from public.notification_reads r where r.notification_id=n.id and r.user_id=(select auth.uid()))),
 'items',coalesce((select jsonb_agg(to_jsonb(items) order by items.created_at desc,items.id desc) from (select n.*,exists(select 1 from public.notification_reads r where r.notification_id=n.id and r.user_id=(select auth.uid())) as is_read from public.club_notifications n where n.locale=request_locale order by n.created_at desc,n.id desc limit 20 offset greatest(0,least(page_number,10000))*20) items),'[]'::jsonb));
$$;
create or replace function public.read_all_notifications(request_locale text) returns void language sql security invoker set search_path='' as $$
 insert into public.notification_reads(user_id,notification_id) select (select auth.uid()),n.id from public.club_notifications n where n.locale=request_locale and not exists(select 1 from public.notification_reads r where r.notification_id=n.id and r.user_id=(select auth.uid())) on conflict do nothing;
$$;
revoke all on function public.notification_inbox(text,integer),public.read_all_notifications(text) from public,anon;
grant execute on function public.notification_inbox(text,integer),public.read_all_notifications(text) to authenticated;
