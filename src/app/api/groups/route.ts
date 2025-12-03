import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    // Buscar grupos com estatísticas usando view
    const { data: groups, error } = await supabase
      .schema('public')
      .from('groups_view')
      .select('*')
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching groups:', error)
      return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
    }

    // Buscar números de WhatsApp para cada grupo
    const groupsWithStats = await Promise.all(
      (groups || []).map(async (group: any) => {
        const { data: numbers } = await supabase
          .schema('public')
          .from('whatsapp_numbers_view')
          .select('id, is_active')
          .eq('group_id', group.id)

        return {
          ...group,
          total_numbers: numbers?.length || 0,
          active_numbers: numbers?.filter((n: any) => n.is_active).length || 0,
        }
      })
    )

    return NextResponse.json(groupsWithStats)
  } catch (error) {
    console.error('Error in GET /api/groups:', error)
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
    const { name, slug, description, default_message, is_active = true } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Verificar limite do plano usando tenant_limits_view
    const { data: tenantLimits } = await supabase
      .schema('public')
      .from('tenant_limits_view')
      .select('max_groups, current_groups')
      .eq('company_id', user.company_id)
      .single()

    if (tenantLimits) {
      if (tenantLimits.current_groups >= tenantLimits.max_groups) {
        return NextResponse.json(
          { error: 'PLAN_LIMIT_REACHED', message: `Limite de ${tenantLimits.max_groups} grupos atingido` },
          { status: 403 }
        )
      }
    }

    // Verificar se slug já existe
    const { data: existingSlug } = await supabase
      .schema('public')
      .from('groups_view')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      )
    }

    // Criar grupo usando RPC
    const { data: groupResult, error } = await supabase
      .rpc('insert_group', {
        p_company_id: user.company_id,
        p_name: name,
        p_slug: slug,
        p_description: description || null,
        p_default_message: default_message || null,
        p_is_active: is_active,
      })

    if (error) {
      console.error('Error creating group:', error)
      console.error('RPC params:', { company_id: user.company_id, name, slug })
      return NextResponse.json({ 
        error: 'Failed to create group',
        details: error.message 
      }, { status: 500 })
    }

    // A função RPC retorna JSON
    const groupData = Array.isArray(groupResult) ? groupResult[0] : groupResult

    if (!groupData) {
      return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
    }

    // Buscar grupo criado da view para garantir formato correto
    const { data: createdGroup, error: fetchError } = await supabase
      .schema('public')
      .from('groups_view')
      .select('*')
      .eq('id', groupData.id)
      .single()

    if (fetchError || !createdGroup) {
      console.error('Error fetching created group:', fetchError)
      return NextResponse.json(groupData, { status: 201 })
    }

    // Atualizar contador de grupos no tenant_limits
    await supabase.rpc('increment_group_count', {
      p_company_id: user.company_id
    })

    return NextResponse.json(createdGroup, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/groups:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

