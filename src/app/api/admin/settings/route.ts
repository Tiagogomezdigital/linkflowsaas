import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Verificar se é admin
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error.error }, { status: auth.error.status })
    }

    const supabase = createAdminClient()

    const { data: settings, error } = await supabase
      .from('system_settings_view')
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
    // Verificar se é admin
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error.error }, { status: auth.error.status })
    }

    const body = await request.json()
    const supabase = createAdminClient()

    // Salvar cada configuração usando RPC
    const updates = Object.entries(body).map(async ([key, value]) => {
      const { error } = await supabase
        .rpc('upsert_system_setting', {
          p_key: key,
          p_value: value,
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

