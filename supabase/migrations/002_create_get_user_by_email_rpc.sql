-- Criar função RPC para buscar usuário por email (garantindo schema redirect)
CREATE OR REPLACE FUNCTION redirect.get_user_by_email(user_email TEXT)
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

-- Dar permissão para service_role usar a função
GRANT EXECUTE ON FUNCTION redirect.get_user_by_email(TEXT) TO service_role;

