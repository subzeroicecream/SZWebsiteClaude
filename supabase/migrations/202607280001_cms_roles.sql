-- CMS roles: admin = users/roles + all stores, editor = store changes, viewer = read-only.
-- Authentication and rate limiting are provided by Supabase Auth.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'editor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';

CREATE OR REPLACE FUNCTION public.has_cms_role(required_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text = ANY(required_roles)
  );
$$;

REVOKE ALL ON FUNCTION public.has_cms_role(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_cms_role(text[]) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_list_cms_users()
RETURNS TABLE(user_id uuid, email text, role text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.has_cms_role(ARRAY['admin']) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
    SELECT users.id, users.email::text, COALESCE(user_roles.role::text, 'viewer')
    FROM auth.users AS users
    LEFT JOIN public.user_roles AS user_roles ON user_roles.user_id = users.id
    ORDER BY users.email;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_cms_role(target_user uuid, next_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_cms_role(ARRAY['admin']) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  IF next_role NOT IN ('admin', 'editor', 'viewer') THEN
    RAISE EXCEPTION 'Invalid CMS role';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user) THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = target_user;
  INSERT INTO public.user_roles(user_id, role) VALUES (target_user, next_role::public.app_role);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_cms_users() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_cms_role(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_cms_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_cms_role(uuid, text) TO authenticated;

DROP POLICY IF EXISTS "CMS roles can view stores" ON public.stores;
CREATE POLICY "CMS roles can view stores" ON public.stores FOR SELECT TO authenticated
USING (public.has_cms_role(ARRAY['admin', 'editor', 'viewer']));

DROP POLICY IF EXISTS "CMS editors can insert stores" ON public.stores;
CREATE POLICY "CMS editors can insert stores" ON public.stores FOR INSERT TO authenticated
WITH CHECK (public.has_cms_role(ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS "CMS editors can update stores" ON public.stores;
CREATE POLICY "CMS editors can update stores" ON public.stores FOR UPDATE TO authenticated
USING (public.has_cms_role(ARRAY['admin', 'editor']))
WITH CHECK (public.has_cms_role(ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS "CMS admins can delete stores" ON public.stores;
CREATE POLICY "CMS admins can delete stores" ON public.stores FOR DELETE TO authenticated
USING (public.has_cms_role(ARRAY['admin']));
