import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { signJWT, setAuthCookie } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Buscar usuário pelo email usando RPC no schema public (acessível via PostgREST)
    const emailNormalized = email.toLowerCase().trim()
    
    console.log('Attempting to login with email:', emailNormalized)
    
    // Usar função RPC no schema public que acessa redirect.users
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_user_by_email', { user_email: emailNormalized })
    
    let user: any = null
    let error: any = null
    
    if (rpcError) {
      console.error('RPC error:', rpcError)
      error = rpcError
    } else if (rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
      user = rpcData[0]
      console.log('User found via RPC:', user.email)
    } else {
      console.log('User not found via RPC')
      error = { message: 'User not found' }
    }

    if (error) {
      console.error('Error fetching user:', error)
      return NextResponse.json(
        { error: 'Invalid credentials', details: error.message },
        { status: 401 }
      )
    }

    if (!user) {
      console.error('User not found:', email.toLowerCase().trim())
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      )
    }

    // Verificar senha com bcrypt
    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Suporta tanto hash bcrypt quanto senha em texto (para migração)
    let isValid = false
    if (user.password_hash && user.password_hash.startsWith('$2')) {
      // Hash bcrypt
      isValid = await bcrypt.compare(password, user.password_hash)
      if (!isValid) {
        console.error('Password comparison failed for user:', user.email)
      }
    } else {
      // Fallback para senha em texto (migração)
      isValid = user.password_hash === password
    }

    if (!isValid) {
      console.error('Invalid password for user:', user.email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Gerar JWT
    const token = await signJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      company_id: user.company_id,
      role: user.role,
    })

    // Definir cookie
    await setAuthCookie(token)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

