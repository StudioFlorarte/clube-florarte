alter table public.subscriptions add column delivery_locale text check (delivery_locale in ('pt','en'));
update public.subscriptions set delivery_locale=case when product_id='3098697' then 'en' else 'pt' end where delivery_locale is null;

drop function public.process_stripe_checkout(text,text,text,text,timestamptz,timestamptz);
create function public.process_stripe_checkout(p_event_id text,p_invoice text,p_email text,p_product text,p_locale text,p_paid_at timestamptz,p_end timestamptz)
returns void language plpgsql security invoker set search_path='' as $$
declare v_user uuid;
begin
 if p_product not in ('prod_VGg95UwxDmMZ8w','prod_VGgOzAJYZplZ8y','prod_VGgPZhHflXlyZo') or p_locale not in ('pt','en') or p_invoice not like 'stripe:sub_%' or p_end<=p_paid_at then raise exception 'invalid checkout'; end if;
 insert into public.stripe_events(id,event) values(p_event_id,'checkout.paid') on conflict do nothing;
 if not found then return; end if;
 v_user := private.user_for_email(p_email);
 insert into public.subscriptions(invoice_id,user_id,email,product_id,contract_id,status,paid_at,current_period_end,delivery_locale)
 values(p_invoice,v_user,lower(p_email),p_product,null,'active',p_paid_at,p_end,p_locale)
 on conflict(invoice_id) do update set
   status=case when public.subscriptions.status in ('refunded','chargeback') then public.subscriptions.status else 'active' end,
   user_id=coalesce(public.subscriptions.user_id,excluded.user_id),
   delivery_locale=coalesce(public.subscriptions.delivery_locale,excluded.delivery_locale),
   updated_at=now();
end $$;
revoke all on function public.process_stripe_checkout(text,text,text,text,text,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.process_stripe_checkout(text,text,text,text,text,timestamptz,timestamptz) to service_role;

create function public.process_stripe_renewal(p_event_id text,p_invoice text,p_end timestamptz)
returns void language plpgsql security invoker set search_path='' as $$
begin
 if p_invoice not like 'stripe:sub_%' or p_end<=now() then raise exception 'invalid renewal'; end if;
 insert into public.stripe_events(id,event) values(p_event_id,'invoice.paid') on conflict do nothing;
 if not found then return; end if;
 update public.subscriptions set current_period_end=greatest(current_period_end,p_end),status='active',updated_at=now()
 where invoice_id=p_invoice and status not in ('refunded','chargeback');
 if not found then raise exception 'subscription not found'; end if;
end $$;
revoke all on function public.process_stripe_renewal(text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.process_stripe_renewal(text,text,timestamptz) to service_role;

