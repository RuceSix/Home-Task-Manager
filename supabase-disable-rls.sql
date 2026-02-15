-- Disabilita RLS temporaneamente per test (solo sviluppo)
-- ATTENZIONE: Questo è meno sicuro, usa solo per test!

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.houses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_invitations DISABLE ROW LEVEL SECURITY;
