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

    const emailNormalized = email.toLowerCase().trim()
    
    console.log('Attempting to login with email:', emailNormalized)
    
    // Usar view no schema public que aponta para redirect.users
    const supabase = createServiceRoleClient()
    
    let user: any = null
    let error: any = null
    
    // Tentar usar view no schema public primeiro
    const { data: viewData, error: viewError } = await supabase
      .from('users_view')
      .select('id, email, name, company_id, role, password_hash, is_active')
      .eq('email', emailNormalized)
      .single()
    
    if (!viewError && viewData) {
      user = viewData
      console.log('User found via view:', user.email)
    } else {
      // Fallback: tentar função RPC via HTTP direto
      console.log('View query failed, trying direct RPC call')
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        
        if (!supabaseUrl || !serviceRoleKey) {
          throw new Error('Supabase configuration missing')
        }
        
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_user_by_email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ user_email: emailNormalized }),
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }))
          console.error('RPC HTTP error:', response.status, errorData)
          error = { message: errorData.message || 'Failed to fetch user', code: response.status }
        } else {
          const data = await response.json()
          if (Array.isArray(data) && data.length > 0) {
            user = data[0]
            console.log('User found via direct RPC call:', user.email)
          } else {
            console.log('User not found via RPC')
            error = { message: 'User not found' }
          }
        }
      } catch (fetchError: any) {
        console.error('Fetch error:', fetchError)
        error = { message: fetchError.message || 'Failed to connect to database' }
      }
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

