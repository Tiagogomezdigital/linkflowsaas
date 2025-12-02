import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verificar se é admin
    let isAdmin = false
    try {
      const supabase = createServiceRoleClient()
      const { data: adminCheck } = await supabase.rpc('is_admin_user', {
        user_email: user.email,
        user_company_id: user.company_id,
      })
      isAdmin = adminCheck === true || user.email === 'admin@linkflow.com'
    } catch (error) {
      // Fallback: verificar apenas pelo email
      isAdmin = user.email === 'admin@linkflow.com'
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company_id: user.company_id,
        is_admin: isAdmin,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/auth/me:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

