import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Schema padrão para as tabelas da aplicação
const DB_SCHEMA = 'redirect'

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // O cookie `set` pode falhar em Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // O cookie `remove` pode falhar em Server Components
          }
        },
      },
      db: {
        schema: DB_SCHEMA,
      },
    }
  )
}

export function createServiceRoleClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Pode falhar em Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Pode falhar em Server Components
          }
        },
      },
      db: {
        schema: DB_SCHEMA,
      },
    }
  )
}

// Cliente específico para acessar views no schema public
// Usa ANON_KEY com políticas RLS - mais seguro que SERVICE_ROLE
export function createPublicSchemaClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: {
        schema: 'public',
      },
    }
  )
}

// Cliente com SERVICE_ROLE para operações administrativas
// ⚠️ USE COM CUIDADO - ignora RLS e tem acesso total ao banco
// Deve ser usado APENAS em:
// - APIs de admin protegidas por requireAdmin()
// - Operações de sistema (cron jobs, webhooks)
// - Casos onde RLS impede operações legítimas
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: {
        schema: 'public',
      },
    }
  )
}

