-- Tabella child_events per eventi neonato (latte, sonno, pannolini, peso)
-- Esegui in Supabase → SQL Editor

CREATE TABLE IF NOT EXISTS public.child_events (
  id            uuid primary key default gen_random_uuid(),
  child_id      uuid not null references public.children(id) on delete cascade,
  house_id      uuid not null references public.houses(id) on delete cascade,
  event_type    text not null check (event_type in ('latte', 'allattamento', 'sonno', 'pannolino', 'peso', 'nota')),
  quantity      numeric(10, 2),
  duration_minutes integer,
  note          text,
  created_at    timestamptz not null default now(),
  created_by_id uuid not null references public.users(id)
);

CREATE INDEX IF NOT EXISTS idx_child_events_child_date ON public.child_events (child_id, created_at);

DROP POLICY IF EXISTS "Members can view child events" ON public.child_events;
DROP POLICY IF EXISTS "Members can manage child events" ON public.child_events;

CREATE POLICY "Members can view child events" ON public.child_events FOR SELECT USING (true);
CREATE POLICY "Members can manage child events" ON public.child_events FOR ALL USING (true) WITH CHECK (true);
