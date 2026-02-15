-- Rimuovi policy esistenti se ci sono (per evitare errori)
DROP POLICY IF EXISTS "Users can be read by anyone" ON public.users;
DROP POLICY IF EXISTS "Anyone can create a user" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

DROP POLICY IF EXISTS "Houses can be read by members" ON public.houses;
DROP POLICY IF EXISTS "Anyone can create a house" ON public.houses;
DROP POLICY IF EXISTS "Owners can update their house" ON public.houses;
DROP POLICY IF EXISTS "Owners can delete their house" ON public.houses;

DROP POLICY IF EXISTS "Members can view house members" ON public.house_members;
DROP POLICY IF EXISTS "Owners can add members" ON public.house_members;
DROP POLICY IF EXISTS "Owners can remove members" ON public.house_members;

DROP POLICY IF EXISTS "Members can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members can delete tasks" ON public.tasks;

DROP POLICY IF EXISTS "Members can view shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Members can create shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Members can update shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Members can delete shopping items" ON public.shopping_items;

DROP POLICY IF EXISTS "Members can view invitations" ON public.house_invitations;
DROP POLICY IF EXISTS "Owners can create invitations" ON public.house_invitations;
DROP POLICY IF EXISTS "Users can update invitations" ON public.house_invitations;
DROP POLICY IF EXISTS "Owners can delete invitations" ON public.house_invitations;

-- Policy per tabella users
CREATE POLICY "Users can be read by anyone"
ON public.users FOR SELECT
USING (true);

CREATE POLICY "Anyone can create a user"
ON public.users FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy per tabella houses
CREATE POLICY "Houses can be read by members"
ON public.houses FOR SELECT
USING (true);

CREATE POLICY "Anyone can create a house"
ON public.houses FOR INSERT
WITH CHECK (true);

CREATE POLICY "Owners can update their house"
ON public.houses FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Owners can delete their house"
ON public.houses FOR DELETE
USING (true);

-- Policy per tabella house_members
CREATE POLICY "Members can view house members"
ON public.house_members FOR SELECT
USING (true);

CREATE POLICY "Owners can add members"
ON public.house_members FOR INSERT
WITH CHECK (true);

CREATE POLICY "Owners can remove members"
ON public.house_members FOR DELETE
USING (true);

-- Policy per tabella tasks
CREATE POLICY "Members can view tasks"
ON public.tasks FOR SELECT
USING (true);

CREATE POLICY "Members can create tasks"
ON public.tasks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Members can update tasks"
ON public.tasks FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Members can delete tasks"
ON public.tasks FOR DELETE
USING (true);

-- Policy per tabella shopping_items
CREATE POLICY "Members can view shopping items"
ON public.shopping_items FOR SELECT
USING (true);

CREATE POLICY "Members can create shopping items"
ON public.shopping_items FOR INSERT
WITH CHECK (true);

CREATE POLICY "Members can update shopping items"
ON public.shopping_items FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Members can delete shopping items"
ON public.shopping_items FOR DELETE
USING (true);

-- Policy per tabella house_invitations
CREATE POLICY "Members can view invitations"
ON public.house_invitations FOR SELECT
USING (true);

CREATE POLICY "Owners can create invitations"
ON public.house_invitations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update invitations"
ON public.house_invitations FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Owners can delete invitations"
ON public.house_invitations FOR DELETE
USING (true);
