-- =============================================================================
-- SETUP AREA BAMBINI – Tabelle children e child_events
-- =============================================================================
-- Esegui in Supabase → SQL Editor
-- PREREQUISITO: devono esistere le tabelle users e houses (esegui supabase-fix-schema.sql)
-- =============================================================================

-- 1) Tabella children (bambini/neonati per casa)
CREATE TABLE IF NOT EXISTS public.children (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id      uuid NOT NULL REFERENCES public.houses(id) ON DELETE CASCADE,
  name          text NOT NULL,
  birth_date    date NOT NULL,
  child_type    text NOT NULL CHECK (child_type IN ('neonato', 'bambino')) DEFAULT 'bambino',
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  created_by_id uuid NOT NULL REFERENCES public.users(id)
);

-- 2) Tabella child_events (eventi: latte, allattamento, sonno, pannolino, peso, nota)
CREATE TABLE IF NOT EXISTS public.child_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id          uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  house_id          uuid NOT NULL REFERENCES public.houses(id) ON DELETE CASCADE,
  event_type        text NOT NULL CHECK (event_type IN ('latte', 'allattamento', 'sonno', 'pannolino', 'peso', 'nota')),
  quantity          numeric(10, 2),
  duration_minutes  integer,
  note              text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  created_by_id     uuid NOT NULL REFERENCES public.users(id)
);

CREATE INDEX IF NOT EXISTS idx_child_events_child_id ON public.child_events (child_id);
CREATE INDEX IF NOT EXISTS idx_child_events_child_date ON public.child_events (child_id, created_at);
CREATE INDEX IF NOT EXISTS idx_child_events_house_id ON public.child_events (house_id);

-- 3) RLS policies (se RLS è attivo sulle tabelle)
DROP POLICY IF EXISTS "Members can view children" ON public.children;
DROP POLICY IF EXISTS "Members can manage children" ON public.children;

CREATE POLICY "Members can view children"
  ON public.children FOR SELECT USING (true);

CREATE POLICY "Members can manage children"
  ON public.children FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Members can view child events" ON public.child_events;
DROP POLICY IF EXISTS "Members can manage child events" ON public.child_events;

CREATE POLICY "Members can view child events"
  ON public.child_events FOR SELECT USING (true);

CREATE POLICY "Members can manage child events"
  ON public.child_events FOR ALL USING (true) WITH CHECK (true);
