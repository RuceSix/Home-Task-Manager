-- Aggiunge le colonne category, assignee e unit alla tabella shopping_items
-- Esegui in Supabase → SQL Editor se la tabella esiste già senza queste colonne

ALTER TABLE public.shopping_items
ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Altro';

ALTER TABLE public.shopping_items
ADD COLUMN IF NOT EXISTS assignee text;

ALTER TABLE public.shopping_items
ADD COLUMN IF NOT EXISTS assignee_id uuid REFERENCES public.users(id);

ALTER TABLE public.shopping_items
ADD COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT 'pezzi';

ALTER TABLE public.shopping_items
ADD COLUMN IF NOT EXISTS checked_at timestamptz;

ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS completed_at timestamptz;
