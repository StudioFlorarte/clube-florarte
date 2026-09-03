-- Transactional integration checks: no fixture persists and no email is sent.
begin;
select set_config('test.member',gen_random_uuid()::text,true);
insert into auth.users(id,email,invited_at,raw_user_meta_data) values(current_setting('test.member')::uuid,'codex-rls-test@example.invalid',now(),'{"display_name":"Test member"}');
insert into public.drops(title,canva_url) values('Codex RLS fixture','https://www.canva.com/');
select set_config('request.jwt.claim.sub',current_setting('test.member'),true);
select set_config('request.jwt.claim.role','authenticated',true);
set local role authenticated;
do $$ begin
 if public.has_club_access() then raise exception 'unpaid account has access'; end if;
 if exists(select 1 from public.drops where title='Codex RLS fixture') then raise exception 'unpaid account reads drops'; end if;
 begin update public.profiles set is_admin=true where id=auth.uid(); raise exception 'admin escalation allowed'; exception when insufficient_privilege then null; end;
 update public.profiles set display_name='Updated name' where id=auth.uid();
 insert into public.account_details(id,phone) values(auth.uid(),'123');
 begin insert into public.palettes(title,colors) values('Forbidden',array['#000000','#FFFFFF']); raise exception 'member creates content'; exception when insufficient_privilege then null; end;
end $$;
reset role;
insert into public.subscriptions(invoice_id,user_id,email,product_id,status,current_period_end,paid_at) values('codex-rls-test',current_setting('test.member')::uuid,'codex-rls-test@example.invalid','3095513','active',now()+interval '1 day',now());
set local role authenticated;
do $$ begin
 if not public.has_club_access() then raise exception 'paid member denied'; end if;
 if not exists(select 1 from public.drops where title='Codex RLS fixture') then raise exception 'paid member cannot read'; end if;
 insert into public.comments(drop_id,author_id,body,author_name) select id,auth.uid(),'Test comment','Spoofed name' from public.drops where title='Codex RLS fixture';
 if exists(select 1 from public.comments where body='Test comment' and author_name<>'Updated name') then raise exception 'comment spoofing allowed'; end if;
end $$;
reset role;
update public.subscriptions set current_period_end=now()-interval '1 second' where invoice_id='codex-rls-test';
set local role authenticated;
do $$ begin if public.has_club_access() then raise exception 'expired member has access'; end if; end $$;
reset role;
update public.subscriptions set current_period_end=now()+interval '1 day',status='refunded' where invoice_id='codex-rls-test';
set local role authenticated;
do $$ begin if public.has_club_access() then raise exception 'refunded member has access'; end if; end $$;
reset role;
select set_config('request.jwt.claim.role','service_role',true);
set local role service_role;
select public.process_eduzz_invoice('codex-event','myeduzz.invoice_paid','codex-invoice','codex-rls-test@example.invalid','3098697',null,now(),now()+interval '1 year');
select public.process_eduzz_invoice('codex-event','myeduzz.invoice_paid','codex-invoice','codex-rls-test@example.invalid','3098697',null,now(),now()+interval '2 years');
select public.process_eduzz_invoice('codex-refund','myeduzz.invoice_refunded','codex-invoice','codex-rls-test@example.invalid','3098697',null,now(),now()+interval '1 year');
select public.process_eduzz_invoice('codex-late-paid','myeduzz.invoice_paid','codex-invoice','codex-rls-test@example.invalid','3098697',null,now(),now()+interval '1 year');
do $$ begin
 if (select count(*) from public.subscriptions where invoice_id='codex-invoice')<>1 then raise exception 'duplicate invoice'; end if;
 if (select status from public.subscriptions where invoice_id='codex-invoice')<>'refunded' then raise exception 'late event restored refunded access'; end if;
 if (select user_id from public.subscriptions where invoice_id='codex-invoice') is null then raise exception 'user association failed'; end if;
end $$;
reset role;
do $$ begin
 begin insert into auth.users(id,email) values(gen_random_uuid(),'codex-signup-test@example.invalid'); raise exception 'signup unexpectedly permitted'; exception when others then if sqlerrm<>'invite required' then raise; end if; end;
end $$;
rollback;
