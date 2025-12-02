import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company_id: user.company_id,
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

