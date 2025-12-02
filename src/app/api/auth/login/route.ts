import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { signJWT, setAuthCookie } from '@/lib/auth'

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
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
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

    // Verificar senha (em produção, usar bcrypt.compare)
    // Por simplicidade, estamos comparando direto (NÃO fazer isso em produção!)
    // Em produção: const isValid = await bcrypt.compare(password, user.password_hash)
    const isValid = user.password_hash === password // APENAS PARA DEMO

    if (!isValid) {
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

