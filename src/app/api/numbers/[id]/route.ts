import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    const { data: number, error } = await supabase
      .from('whatsapp_numbers')
      .select('*, groups(id, name, slug)')
      .eq('id', params.id)
      .eq('company_id', user.company_id)
      .single()

    if (error || !number) {
      return NextResponse.json({ error: 'Number not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...number,
      group: number.groups,
      groups: undefined,
    })
  } catch (error) {
    console.error('Error in GET /api/numbers/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, name, custom_message, group_id, is_active } = body

    const supabase = createServiceRoleClient()

    // Verificar se número pertence à empresa
    const { data: existingNumber } = await supabase
      .from('whatsapp_numbers')
      .select('id')
      .eq('id', params.id)
      .eq('company_id', user.company_id)
      .single()

    if (!existingNumber) {
      return NextResponse.json({ error: 'Number not found' }, { status: 404 })
    }

    // Se group_id foi alterado, verificar se novo grupo pertence à empresa
    if (group_id) {
      const { data: group } = await supabase
        .from('groups')
        .select('id')
        .eq('id', group_id)
        .eq('company_id', user.company_id)
        .single()

      if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }
    }

    const { data: number, error } = await supabase
      .from('whatsapp_numbers')
      .update({
        phone: phone?.replace(/\D/g, ''),
        name,
        custom_message,
        group_id,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating number:', error)
      return NextResponse.json({ error: 'Failed to update number' }, { status: 500 })
    }

    return NextResponse.json(number)
  } catch (error) {
    console.error('Error in PUT /api/numbers/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    // Verificar se número pertence à empresa
    const { data: existingNumber } = await supabase
      .from('whatsapp_numbers')
      .select('id')
      .eq('id', params.id)
      .eq('company_id', user.company_id)
      .single()

    if (!existingNumber) {
      return NextResponse.json({ error: 'Number not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('whatsapp_numbers')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting number:', error)
      return NextResponse.json({ error: 'Failed to delete number' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/numbers/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

