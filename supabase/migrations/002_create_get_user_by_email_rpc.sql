-- Criar função RPC no schema public para buscar usuário por email
-- (schema public é exposto via PostgREST, então a função precisa estar aqui)
-- A função acessa redirect.users usando SET search_path
CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  company_id UUID,
  role TEXT,
  password_hash TEXT,
  is_active BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = redirect, public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.company_id,
    u.role,
    u.password_hash,
    u.is_active
  FROM redirect.users u
  WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(user_email));
END;
$$;

-- Dar permissão para service_role e anon usar a função
GRANT EXECUTE ON FUNCTION public.get_user_by_email(TEXT) TO service_role, anon;

