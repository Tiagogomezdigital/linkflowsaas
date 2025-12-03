import { NextRequest, NextResponse } from 'next/server'
import { createPublicSchemaClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    const supabase = createPublicSchemaClient()

    // Buscar números usando view
    let query = supabase
      .from('whatsapp_numbers_view')
      .select('*')
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: false })

    if (groupId) {
      query = query.eq('group_id', groupId)
    }

    const { data: numbers, error } = await query

    if (error) {
      console.error('Error fetching numbers:', error)
      return NextResponse.json({ error: 'Failed to fetch numbers' }, { status: 500 })
    }

    // Buscar grupos para cada número
    const groupIds = [...new Set((numbers || []).map((n: any) => n.group_id))]
    const { data: groups } = await supabase
      .from('groups_view')
      .select('id, name, slug')
      .in('id', groupIds)

    const groupMap = new Map((groups || []).map((g: any) => [g.id, g]))

    // Formatar resposta
    const formattedNumbers = (numbers || []).map((num: any) => ({
      ...num,
      group: groupMap.get(num.group_id) || null,
    }))

    return NextResponse.json(formattedNumbers)
  } catch (error) {
    console.error('Error in GET /api/numbers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, name, custom_message, group_id, is_active = true } = body

    if (!phone || !group_id) {
      return NextResponse.json(
        { error: 'Phone and group_id are required' },
        { status: 400 }
      )
    }

    const supabase = createPublicSchemaClient()

    // Verificar se o grupo pertence à empresa
    const { data: group } = await supabase
      .from('groups_view')
      .select('id, company_id')
      .eq('id', group_id)
      .eq('company_id', user.company_id)
      .single()

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Criar número usando RPC
    const { data: numberResult, error } = await supabase
      .rpc('insert_whatsapp_number', {
        p_company_id: user.company_id,
        p_group_id: group_id,
        p_phone: phone.replace(/\D/g, ''),
        p_name: name,
        p_custom_message: custom_message,
        p_is_active: is_active,
      })

    if (error) {
      console.error('Error creating number:', error)
      return NextResponse.json({ error: 'Failed to create number' }, { status: 500 })
    }

    const numberData = Array.isArray(numberResult) ? numberResult[0] : numberResult

    return NextResponse.json(numberData, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/numbers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

