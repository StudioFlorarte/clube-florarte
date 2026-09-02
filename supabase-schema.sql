-- Clube Florarte — schema inicial
-- Rode isso em: Supabase > SQL Editor > New query > Run

-- Perfis (1 por membro, criado automaticamente no cadastro)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Drops (coleções de templates)
create table if not exists drops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  description text,
  canva_url text not null,
  cover_url text,
  created_at timestamptz not null default now()
);

-- Comentários dos membros em cada drop
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  drop_id uuid not null references drops(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- Feedback geral (aba "Feedback")
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

-- Cria o perfil automaticamente quando uma nova pessoa se cadastra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Segurança: só membros logados enxergam os dados; só você edita drops
alter table profiles enable row level security;
alter table drops enable row level security;
alter table comments enable row level security;
alter table feedback enable row level security;

create policy "members read own profile" on profiles for select using (auth.uid() = id);
create policy "members read all profiles (for comment names)" on profiles for select using (true);

create policy "members read drops" on drops for select using (auth.role() = 'authenticated');
create policy "only admins write drops" on drops for insert with check (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
create policy "only admins update drops" on drops for update using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

create policy "members read comments" on comments for select using (auth.role() = 'authenticated');
create policy "members write own comments" on comments for insert with check (auth.uid() = author_id);

create policy "members write own feedback" on feedback for insert with check (auth.uid() = author_id);
create policy "only admins read feedback" on feedback for select using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Depois de criar sua própria conta de membro (via tela de login ou Supabase Auth),
-- rode este comando trocando o e-mail para se tornar admin:
-- update profiles set is_admin = true where id = (select id from auth.users where email = 'seu-email@exemplo.com');
