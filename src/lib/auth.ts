import { cookies } from 'next/headers'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-characters!'
)

export interface AuthUser {
  id: string
  email: string
  name: string | null
  company_id: string
  role: 'owner' | 'member'
}

export interface JWTPayload {
  sub: string
  email: string
  name: string
  company_id: string
  role: string
  iat: number
  exp: number
}

export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
  
  return token
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    // Cast seguro através de unknown
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) {
    return null
  }
  
  const payload = await verifyJWT(token)
  
  if (!payload) {
    return null
  }
  
  // Validar que o role é válido
  const role = payload.role === 'owner' || payload.role === 'member' 
    ? payload.role 
    : 'member'
  
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    company_id: payload.company_id,
    role: role as 'owner' | 'member',
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = cookies()
  
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  })
}

export async function clearAuthCookie() {
  const cookieStore = cookies()
  
  cookieStore.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

// Lista de emails de administradores
// Em produção, isso deveria vir de uma tabela no banco ou variável de ambiente
const ADMIN_EMAILS = ['admin@linkflow.com']

/**
 * Verifica se o usuário atual é um administrador
 */
export function isAdminUser(user: AuthUser | null): boolean {
  if (!user) return false
  return ADMIN_EMAILS.includes(user.email.toLowerCase())
}

/**
 * Retorna o usuário autenticado apenas se for admin
 * Retorna null se não autenticado ou não for admin
 */
export async function getAdminUser(): Promise<AuthUser | null> {
  const user = await getAuthUser()
  
  if (!user) return null
  if (!isAdminUser(user)) return null
  
  return user
}

/**
 * Interface para resposta de erro padronizada
 */
export interface AuthError {
  error: string
  status: 401 | 403
}

/**
 * Verifica se o usuário é admin e retorna erro apropriado se não for
 * Use isso para proteger rotas admin
 */
export async function requireAdmin(): Promise<{ user: AuthUser } | { error: AuthError }> {
  const user = await getAuthUser()
  
  if (!user) {
    return { error: { error: 'Unauthorized - Not authenticated', status: 401 } }
  }
  
  if (!isAdminUser(user)) {
    return { error: { error: 'Forbidden - Admin access required', status: 403 } }
  }
  
  return { user }
}

