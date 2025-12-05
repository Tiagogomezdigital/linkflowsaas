import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Verificar se é admin - retorna 401 ou 403 se não for
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error.error }, { status: auth.error.status })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const companyId = searchParams.get('company_id')
    const search = searchParams.get('search')

    const supabase = createAdminClient()

    let query = supabase
      .from('users_view')
      .select('*')
      .order('created_at', { ascending: false })

    if (role) {
      query = query.eq('role', role)
    }

    if (status) {
      query = query.eq('is_active', status === 'active')
    }

    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Buscar informações da empresa para cada usuário e remover password_hash
    const sanitizedUsers = await Promise.all(
      (users || []).map(async (u: any) => {
        const { data: company } = await supabase
          .schema('public')
          .from('companies_view')
          .select('id, name, slug')
          .eq('id', u.company_id)
          .single()

        return {
          ...u,
          company: company || null,
          password_hash: undefined,
        }
      })
    )

    return NextResponse.json(sanitizedUsers)
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se é admin
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error.error }, { status: auth.error.status })
    }

    const body = await request.json()
    const { email, name, company_id, role = 'member', password } = body

    if (!email || !name || !company_id || !password) {
      return NextResponse.json(
        { error: 'Email, name, company_id and password are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verificar se email já existe
    const { data: existingEmail } = await supabase
      .from('users_view')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    // Verificar se empresa existe
    const { data: company } = await supabase
      .from('companies_view')
      .select('id')
      .eq('id', company_id)
      .single()

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Hash da senha
    const bcrypt = require('bcryptjs')
    const password_hash = await bcrypt.hash(password, 10)

    // Usar RPC para inserir usuário
    const { data: newUser, error } = await supabase
      .rpc('insert_user', {
        p_email: email.toLowerCase(),
        p_name: name,
        p_company_id: company_id,
        p_role: role,
        p_password_hash: password_hash,
        p_is_active: true,
      })

    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Remover password_hash do response
    return NextResponse.json({
      ...newUser,
      password_hash: undefined,
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

