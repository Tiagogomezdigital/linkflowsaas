import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export async function POST() {
  try {
    await clearAuthCookie()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/auth/logout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

