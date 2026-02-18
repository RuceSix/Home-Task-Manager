-- Tabella children per l'area neonati e bambini
-- Esegui in Supabase → SQL Editor

CREATE TABLE IF NOT EXISTS public.children (
  id            uuid primary key default gen_random_uuid(),
  house_id      uuid not null references public.houses(id) on delete cascade,
  name          text not null,
  birth_date    date not null,
  child_type    text not null check (child_type in ('neonato', 'bambino')) default 'bambino',
  notes         text,
  created_at    timestamptz not null default now(),
  created_by_id uuid not null references public.users(id)
);

-- RLS (se usi le policy)
DROP POLICY IF EXISTS "Members can view children" ON public.children;
DROP POLICY IF EXISTS "Members can manage children" ON public.children;

CREATE POLICY "Members can view children"
ON public.children FOR SELECT
USING (true);

CREATE POLICY "Members can manage children"
ON public.children FOR ALL
USING (true)
WITH CHECK (true);
