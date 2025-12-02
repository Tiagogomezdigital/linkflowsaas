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

    // Buscar grupos com estatísticas
    const { data: groups, error } = await supabase
      .from('groups')
      .select(`
        *,
        whatsapp_numbers!left (
          id,
          is_active
        )
      `)
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching groups:', error)
      return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
    }

    // Calcular estatísticas para cada grupo
    const groupsWithStats = groups.map((group: any) => {
      const numbers = group.whatsapp_numbers || []
      return {
        ...group,
        total_numbers: numbers.length,
        active_numbers: numbers.filter((n: any) => n.is_active).length,
        whatsapp_numbers: undefined, // Remover do response
      }
    })

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

    // Verificar limite do plano usando tenant_limits
    const { data: tenantLimits } = await supabase
      .from('tenant_limits')
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
      .from('groups')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      )
    }

    // Criar grupo
    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        company_id: user.company_id,
        name,
        slug,
        description,
        default_message,
        is_active,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating group:', error)
      return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
    }

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/groups:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

