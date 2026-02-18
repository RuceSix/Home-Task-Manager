-- Elimina TUTTI i dati da Supabase (per reset dopo i test)
-- Esegui in Supabase → SQL Editor
-- ATTENZIONE: azione irreversibile!

TRUNCATE
  public.child_events,
  public.house_invitations,
  public.shopping_items,
  public.tasks,
  public.house_members,
  public.children,
  public.houses,
  public.users
RESTART IDENTITY CASCADE;
