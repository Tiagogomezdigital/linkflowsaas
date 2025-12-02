import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
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

    const supabase = createServiceRoleClient()

    const { data: group, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', params.id)
      .eq('company_id', user.company_id)
      .single()

    if (error || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error('Error in GET /api/groups/[id]:', error)
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
    const { name, description, default_message, is_active } = body

    const supabase = createServiceRoleClient()

    // Verificar se grupo pertence à empresa
    const { data: existingGroup } = await supabase
      .from('groups')
      .select('id')
      .eq('id', params.id)
      .eq('company_id', user.company_id)
      .single()

    if (!existingGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const { data: group, error } = await supabase
      .from('groups')
      .update({
        name,
        description,
        default_message,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating group:', error)
      return NextResponse.json({ error: 'Failed to update group' }, { status: 500 })
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error('Error in PUT /api/groups/[id]:', error)
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

    // Verificar se grupo pertence à empresa
    const { data: existingGroup } = await supabase
      .from('groups')
      .select('id')
      .eq('id', params.id)
      .eq('company_id', user.company_id)
      .single()

    if (!existingGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Deletar números associados primeiro
    await supabase
      .from('whatsapp_numbers')
      .delete()
      .eq('group_id', params.id)

    // Deletar grupo
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting group:', error)
      return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/groups/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

