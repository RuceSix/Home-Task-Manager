-- Fix schema: cambia users.id da bigint a uuid
-- ATTENZIONE: Questo script elimina i dati esistenti nelle tabelle collegate!

-- 1. Elimina le tabelle dipendenti (se esistono)
DROP TABLE IF EXISTS public.house_invitations CASCADE;
DROP TABLE IF EXISTS public.shopping_items CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.house_members CASCADE;
DROP TABLE IF EXISTS public.houses CASCADE;

-- 2. Elimina la tabella users (se esiste)
DROP TABLE IF EXISTS public.users CASCADE;

-- 3. Ricrea la tabella users con UUID
CREATE TABLE public.users (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null unique,
  created_at  timestamptz not null default now()
);

-- 4. Ricrea la tabella houses con UUID
CREATE TABLE public.houses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_id    uuid not null references public.users(id) on delete cascade,
  owner_name  text not null,
  created_at  timestamptz not null default now()
);

-- 5. Ricrea la tabella house_members
CREATE TYPE public.house_role as enum ('owner', 'member');

CREATE TABLE public.house_members (
  id          uuid primary key default gen_random_uuid(),
  house_id    uuid not null references public.houses(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  user_name   text not null,
  user_email  text not null,
  role        public.house_role not null default 'member',
  joined_at   timestamptz not null default now(),
  unique (house_id, user_id)
);

-- 6. Ricrea la tabella tasks
CREATE TABLE public.tasks (
  id            bigserial primary key,
  title         text not null,
  assignee      text not null,
  assignee_id   uuid not null references public.users(id),
  due_date      date not null,
  completed     boolean not null default false,
  completed_at  timestamptz,
  category      text not null default 'generale',
  house_id      uuid not null references public.houses(id) on delete cascade,
  created_by    text not null,
  created_by_id uuid not null references public.users(id),
  created_at    timestamptz not null default now()
);

-- 7. Ricrea la tabella shopping_items
CREATE TABLE public.shopping_items (
  id          bigserial primary key,
  item        text not null,
  quantity    integer not null default 1,
  unit        text not null default 'pezzi',
  checked     boolean not null default false,
  checked_at  timestamptz,
  category    text not null default 'Altro',
  house_id    uuid not null references public.houses(id) on delete cascade,
  added_by    text not null,
  added_by_id uuid not null references public.users(id),
  assignee    text,
  assignee_id uuid references public.users(id),
  created_at  timestamptz not null default now()
);

-- 8. Ricrea la tabella house_invitations
CREATE TYPE public.invitation_status as enum ('pending', 'accepted', 'rejected');

CREATE TABLE public.house_invitations (
  id            uuid primary key default gen_random_uuid(),
  house_id      uuid not null references public.houses(id) on delete cascade,
  house_name    text not null,
  invited_email text not null,
  invited_by    text not null,
  status        public.invitation_status not null default 'pending',
  created_at    timestamptz not null default now()
);
