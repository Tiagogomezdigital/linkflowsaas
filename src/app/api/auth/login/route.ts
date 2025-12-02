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

    // Buscar usuário pelo email
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, company_id, role, password_hash, is_active')
      .eq('email', email.toLowerCase().trim())
      .single()

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

