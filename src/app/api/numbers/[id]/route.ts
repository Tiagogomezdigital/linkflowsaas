import { NextRequest, NextResponse } from 'next/server'
import { createPublicSchemaClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createPublicSchemaClient()

    const { data: number, error } = await supabase
      .from('whatsapp_numbers_view')
      .select('*')
      .eq('id', params.id)
      .eq('company_id', user.company_id)
      .single()

    if (error || !number) {
      return NextResponse.json({ error: 'Number not found' }, { status: 404 })
    }

    // Buscar grupo
    const { data: group } = await supabase
      .from('groups_view')
      .select('id, name, slug')
      .eq('id', number.group_id)
      .single()

    return NextResponse.json({
      ...number,
      group: group || null,
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

    const supabase = createPublicSchemaClient()

    // Verificar se número pertence à empresa
    const { data: existingNumber } = await supabase
      .from('whatsapp_numbers_view')
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
        .from('groups_view')
        .select('id')
        .eq('id', group_id)
        .eq('company_id', user.company_id)
        .single()

      if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }
    }

    // Atualizar usando RPC
    const { data: numberResult, error } = await supabase
      .rpc('update_whatsapp_number', {
        p_id: params.id,
        p_phone: phone?.replace(/\D/g, ''),
        p_name: name,
        p_custom_message: custom_message,
        p_group_id: group_id,
        p_is_active: is_active,
      })

    if (error) {
      console.error('Error updating number:', error)
      return NextResponse.json({ error: 'Failed to update number' }, { status: 500 })
    }

    const numberData = Array.isArray(numberResult) ? numberResult[0] : numberResult

    return NextResponse.json(numberData)
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

    const supabase = createPublicSchemaClient()

    // Verificar se número pertence à empresa
    const { data: existingNumber } = await supabase
      .from('whatsapp_numbers_view')
      .select('id')
      .eq('id', params.id)
      .eq('company_id', user.company_id)
      .single()

    if (!existingNumber) {
      return NextResponse.json({ error: 'Number not found' }, { status: 404 })
    }

    // Deletar usando RPC
    const { data: deleted, error } = await supabase
      .rpc('delete_whatsapp_number', {
        p_id: params.id,
      })

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

