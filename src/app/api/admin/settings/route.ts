import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Transformar array em objeto
    const settingsObj: Record<string, any> = {}
    settings?.forEach((setting: any) => {
      settingsObj[setting.key] = setting.value
    })

    return NextResponse.json(settingsObj)
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createServiceRoleClient()

    // Salvar cada configuração
    const updates = Object.entries(body).map(async ([key, value]) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key'
        })

      if (error) {
        console.error(`Error updating setting ${key}:`, error)
        throw error
      }
    })

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/admin/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

