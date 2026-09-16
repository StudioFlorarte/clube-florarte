-- Run once before activating the Stripe webhook.
alter table public.subscriptions drop constraint subscriptions_product_id_check;
alter table public.subscriptions add constraint subscriptions_product_id_check check
  (product_id in ('3095513','3098697','prod_VGg95UwxDmMZ8w','prod_VGgOzAJYZplZ8y','prod_VGgPZhHflXlyZo'));

create table public.stripe_events (
  id text primary key,
  event text not null,
  processed_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;
revoke all on public.stripe_events from public,anon,authenticated;
grant select,insert on public.stripe_events to service_role;

create function public.process_stripe_checkout(p_event_id text,p_invoice text,p_email text,p_product text,p_paid_at timestamptz,p_end timestamptz)
returns void language plpgsql security invoker set search_path='' as $$
declare v_user uuid;
begin
 if p_product not in ('prod_VGg95UwxDmMZ8w','prod_VGgOzAJYZplZ8y','prod_VGgPZhHflXlyZo') or p_invoice not like 'stripe:sub_%' or p_end<=p_paid_at then raise exception 'invalid checkout'; end if;
 insert into public.stripe_events(id,event) values(p_event_id,'checkout.paid') on conflict do nothing;
 if not found then return; end if;
 v_user := private.user_for_email(p_email);
 insert into public.subscriptions(invoice_id,user_id,email,product_id,contract_id,status,paid_at,current_period_end)
 values(p_invoice,v_user,lower(p_email),p_product,null,'active',p_paid_at,p_end)
 on conflict(invoice_id) do update set
   status=case when public.subscriptions.status in ('refunded','chargeback') then public.subscriptions.status else 'active' end,
   user_id=coalesce(public.subscriptions.user_id,excluded.user_id),
   updated_at=now();
end $$;
revoke all on function public.process_stripe_checkout(text,text,text,text,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.process_stripe_checkout(text,text,text,text,timestamptz,timestamptz) to service_role;

create function public.process_stripe_cancellation(p_event_id text,p_invoice text)
returns void language plpgsql security invoker set search_path='' as $$
begin
 if p_invoice not like 'stripe:sub_%' then raise exception 'invalid subscription'; end if;
 insert into public.stripe_events(id,event) values(p_event_id,'subscription.deleted') on conflict do nothing;
 if not found then return; end if;
 update public.subscriptions set status='cancelled',updated_at=now()
 where invoice_id=p_invoice and status='active';
end $$;
revoke all on function public.process_stripe_cancellation(text,text) from public,anon,authenticated;
grant execute on function public.process_stripe_cancellation(text,text) to service_role;

