import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    const supabase = createServiceRoleClient()

    let query = supabase
      .from('whatsapp_numbers')
      .select(`
        *,
        groups (
          id,
          name,
          slug
        )
      `)
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

    // Renomear 'groups' para 'group' no response
    const formattedNumbers = numbers.map((num: any) => ({
      ...num,
      group: num.groups,
      groups: undefined,
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

    const supabase = createServiceRoleClient()

    // Verificar se o grupo pertence à empresa
    const { data: group } = await supabase
      .from('groups')
      .select('id, company_id')
      .eq('id', group_id)
      .eq('company_id', user.company_id)
      .single()

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Criar número
    const { data: number, error } = await supabase
      .from('whatsapp_numbers')
      .insert({
        company_id: user.company_id,
        group_id,
        phone: phone.replace(/\D/g, ''),
        name,
        custom_message,
        is_active,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating number:', error)
      return NextResponse.json({ error: 'Failed to create number' }, { status: 500 })
    }

    return NextResponse.json(number, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/numbers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

