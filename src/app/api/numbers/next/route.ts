import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Rota pública para rotação de números
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupSlug = searchParams.get('groupSlug')

    if (!groupSlug) {
      return NextResponse.json(
        { error: 'groupSlug is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Buscar grupo pelo slug
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name, default_message, is_active, company_id')
      .eq('slug', groupSlug)
      .single()

    if (groupError || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (!group.is_active) {
      return NextResponse.json({ error: 'Group is inactive' }, { status: 403 })
    }

    // Buscar próximo número ativo (round-robin por last_used_at)
    const { data: numbers, error: numbersError } = await supabase
      .from('whatsapp_numbers')
      .select('id, phone, custom_message, last_used_at')
      .eq('group_id', group.id)
      .eq('is_active', true)
      .order('last_used_at', { ascending: true, nullsFirst: true })
      .limit(1)

    if (numbersError) {
      console.error('Error fetching numbers:', numbersError)
      return NextResponse.json({ error: 'Failed to fetch numbers' }, { status: 500 })
    }

    if (!numbers || numbers.length === 0) {
      return NextResponse.json({ error: 'No active numbers in group' }, { status: 404 })
    }

    const selectedNumber = numbers[0]

    // Atualizar last_used_at
    await supabase
      .from('whatsapp_numbers')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', selectedNumber.id)

    // Montar mensagem final
    const finalMessage = [group.default_message, selectedNumber.custom_message]
      .filter(Boolean)
      .join(' ')

    return NextResponse.json({
      number_id: selectedNumber.id,
      phone: selectedNumber.phone,
      final_message: finalMessage,
      group_id: group.id,
      company_id: group.company_id,
    })
  } catch (error) {
    console.error('Error in GET /api/numbers/next:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

