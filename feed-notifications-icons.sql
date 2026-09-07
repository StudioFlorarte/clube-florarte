create table public.feed_posts (
 id uuid primary key default gen_random_uuid(), author_id uuid not null references public.profiles(id),
 locale text not null check(locale in ('pt','en','fr','es')), body text not null default '' check(length(body)<=12000),
 attachments jsonb not null default '[]' check(jsonb_typeof(attachments)='array' and jsonb_array_length(attachments)<=10),
 published boolean not null default true, created_at timestamptz not null default now(),
 check(length(trim(body))>0 or jsonb_array_length(attachments)>0)
);
create index feed_posts_locale_date on public.feed_posts(locale,created_at desc) where published;
create index feed_posts_author on public.feed_posts(author_id);
create table public.feed_likes(post_id uuid not null references public.feed_posts(id) on delete cascade,user_id uuid not null references public.profiles(id) on delete cascade,created_at timestamptz not null default now(),primary key(post_id,user_id));
create index feed_likes_user on public.feed_likes(user_id);
create table public.feed_comments(id uuid primary key default gen_random_uuid(),post_id uuid not null references public.feed_posts(id) on delete cascade,author_id uuid not null references public.profiles(id) on delete cascade,author_name text not null default '',body text not null check(length(trim(body)) between 1 and 3000),created_at timestamptz not null default now());
create index feed_comments_post_date on public.feed_comments(post_id,created_at);
create index feed_comments_author on public.feed_comments(author_id);
create table public.club_notifications(id uuid primary key default gen_random_uuid(),source_type text not null,source_id uuid not null,locale text not null check(locale in ('pt','en','fr','es')),title text not null,href text not null check(href ~ '^/(dashboard|library|drops|icons|palettes|estrategia)(/|#|$)'),created_at timestamptz not null default now(),unique(source_type,source_id,locale));
create index club_notifications_locale_date on public.club_notifications(locale,created_at desc);
create table public.notification_reads(user_id uuid not null references public.profiles(id) on delete cascade,notification_id uuid not null references public.club_notifications(id) on delete cascade,read_at timestamptz not null default now(),primary key(user_id,notification_id));
create index notification_reads_notification on public.notification_reads(notification_id);
alter table public.icon_packs add column assets jsonb not null default '[]',add column zip_path text;
alter table public.feed_posts enable row level security;
alter table public.feed_likes enable row level security;
alter table public.feed_comments enable row level security;
alter table public.club_notifications enable row level security;
alter table public.notification_reads enable row level security;
grant select,insert,update,delete on public.feed_posts to authenticated;
grant select,insert,delete on public.feed_likes to authenticated;
grant select,insert,delete on public.feed_comments to authenticated;
grant update(body) on public.feed_comments to authenticated;
grant select,insert,update,delete on public.club_notifications to authenticated;
grant select,insert on public.notification_reads to authenticated;
create policy feed_read on public.feed_posts for select to authenticated using ((select private.has_access()) and (published or (select private.is_admin())));
create policy feed_create on public.feed_posts for insert to authenticated with check ((select private.is_admin()) and author_id=(select auth.uid()));
create policy feed_edit on public.feed_posts for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy feed_remove on public.feed_posts for delete to authenticated using ((select private.is_admin()));
create policy likes_read on public.feed_likes for select to authenticated using ((select private.has_access()) and exists(select 1 from public.feed_posts p where p.id=post_id and p.published));
create policy likes_insert on public.feed_likes for insert to authenticated with check ((select private.has_access()) and user_id=(select auth.uid()) and exists(select 1 from public.feed_posts p where p.id=post_id and p.published));
create policy likes_delete on public.feed_likes for delete to authenticated using(user_id=(select auth.uid()) and (select private.has_access()));
create policy comments_read on public.feed_comments for select to authenticated using ((select private.has_access()) and exists(select 1 from public.feed_posts p where p.id=post_id and p.published));
create policy comments_create on public.feed_comments for insert to authenticated with check ((select private.has_access()) and author_id=(select auth.uid()) and exists(select 1 from public.feed_posts p where p.id=post_id and p.published));
create policy comments_edit on public.feed_comments for update to authenticated using(author_id=(select auth.uid()) and (select private.has_access())) with check(author_id=(select auth.uid()) and (select private.has_access()));
create policy comments_remove on public.feed_comments for delete to authenticated using((select private.has_access()) and (author_id=(select auth.uid()) or (select private.is_admin())));
create policy notifications_read on public.club_notifications for select to authenticated using((select private.has_access()));
create policy notifications_create on public.club_notifications for insert to authenticated with check((select private.is_admin()));
create policy notifications_update on public.club_notifications for update to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create policy notifications_remove on public.club_notifications for delete to authenticated using((select private.is_admin()));
create policy reads_read on public.notification_reads for select to authenticated using(user_id=(select auth.uid()) and (select private.has_access()));
create policy reads_create on public.notification_reads for insert to authenticated with check(user_id=(select auth.uid()) and (select private.has_access()));
create function private.feed_comment_name() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 new.author_name:=coalesce((select display_name from public.profiles where id=auth.uid()),'Membro');
 return new;
end; $$;
create trigger feed_comment_author before insert on public.feed_comments for each row execute function private.feed_comment_name();
create function private.notify_club_content() returns trigger language plpgsql security invoker set search_path='' as $$
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
  insert into public.club_notifications(source_type,source_id,locale,title,href) values(TG_TABLE_NAME,new.id,new.locale,heading,'/dashboard#post-'||new.id) on conflict(source_type,source_id,locale) do update set title=excluded.title,href=excluded.href;
 else
  destination:=case TG_TABLE_NAME when 'drops' then '/drops/'||new.id when 'icon_packs' then '/icons#pack-'||new.id else '/palettes' end;
  foreach l in array array['pt','en','fr','es'] loop
   heading:=coalesce(nullif(record_data->'translations'->l->>'title',''),record_data->>'title');
   insert into public.club_notifications(source_type,source_id,locale,title,href) values(TG_TABLE_NAME,new.id,l,heading,destination) on conflict(source_type,source_id,locale) do update set title=excluded.title,href=excluded.href;
  end loop;
 end if;
 return new;
end; $$;
create trigger feed_notification after insert or update or delete on public.feed_posts for each row execute function private.notify_club_content();
create trigger drop_notification after insert or update or delete on public.drops for each row execute function private.notify_club_content();
create trigger palette_notification after insert or update or delete on public.palettes for each row execute function private.notify_club_content();
create trigger icons_notification after insert or update or delete on public.icon_packs for each row execute function private.notify_club_content();
revoke all on function private.feed_comment_name(),private.notify_club_content() from public,anon;
grant execute on function private.feed_comment_name(),private.notify_club_content() to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('feed-assets','feed-assets',false,52428800,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/plain']),
('club-icons','club-icons',false,52428800,array['image/png','application/zip','application/x-zip-compressed']);
create policy feed_files_read on storage.objects for select to authenticated using(bucket_id='feed-assets' and (select private.has_access()) and ((select private.is_admin()) or exists(select 1 from public.feed_posts p where p.published and p.attachments @> jsonb_build_array(jsonb_build_object('path',name)))));
create policy feed_files_upload on storage.objects for insert to authenticated with check(bucket_id='feed-assets' and (select private.is_admin()) and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy feed_files_delete on storage.objects for delete to authenticated using(bucket_id='feed-assets' and (select private.is_admin()));
create policy icon_files_read on storage.objects for select to authenticated using(bucket_id='club-icons' and (select private.has_access()));
create policy icon_files_upload on storage.objects for insert to authenticated with check(bucket_id='club-icons' and (select private.is_admin()));
create policy icon_files_delete on storage.objects for delete to authenticated using(bucket_id='club-icons' and (select private.is_admin()));
