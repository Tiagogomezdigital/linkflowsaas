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
    let { data: tenantLimits } = await supabase
      .schema('public')
      .from('tenant_limits_view')
      .select('max_groups, current_groups, plan_id')
      .eq('company_id', user.company_id)
      .single()

    // Se não existir tenant_limits, criar com limites padrão do plano free
    if (!tenantLimits) {
      try {
        // Buscar plano Free
        const { data: freePlan } = await supabase
          .schema('public')
          .from('subscription_plans_view')
          .select('id, limits')
          .eq('billing_cycle', 'lifetime')
          .single()

        if (freePlan) {
          const limits = freePlan.limits || { maxGroups: 3, maxLinksPerMonth: 100, maxTeamMembers: 1 }
          
          // Criar tenant_limits usando RPC
          const { data: newLimitsResult, error: createLimitsError } = await supabase
            .rpc('create_tenant_limits', {
              p_company_id: user.company_id,
              p_plan_id: freePlan.id,
              p_max_groups: limits.maxGroups || 3,
              p_max_links_per_month: limits.maxLinksPerMonth || 100,
              p_max_team_members: limits.maxTeamMembers || 1,
            })

          if (!createLimitsError && newLimitsResult) {
            const newLimits = newLimitsResult.create_tenant_limits || newLimitsResult
            tenantLimits = {
              max_groups: newLimits.max_groups || limits.maxGroups || 3,
              current_groups: newLimits.current_groups || 0,
              plan_id: freePlan.id,
            }
          } else {
            // Fallback: usar limites do plano
            tenantLimits = {
              max_groups: limits.maxGroups || 3,
              current_groups: 0,
              plan_id: freePlan.id,
            }
          }
        } else {
          // Fallback: usar limites padrão
          tenantLimits = {
            max_groups: 3,
            current_groups: 0,
            plan_id: null,
          }
        }
      } catch (error) {
        console.error('Error creating tenant_limits:', error)
        // Fallback: usar limites padrão
        tenantLimits = {
          max_groups: 3,
          current_groups: 0,
          plan_id: null,
        }
      }
    }

    // Verificar limite
    if (tenantLimits.current_groups >= tenantLimits.max_groups) {
      return NextResponse.json(
        { error: 'PLAN_LIMIT_REACHED', message: `Limite de ${tenantLimits.max_groups} grupos atingido` },
        { status: 403 }
      )
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
    const rpcParams = {
      p_company_id: user.company_id,
      p_name: name,
      p_slug: slug,
    }

    // Adicionar parâmetros opcionais apenas se definidos
    if (description) rpcParams.p_description = description
    if (default_message) rpcParams.p_default_message = default_message
    if (is_active !== undefined) rpcParams.p_is_active = is_active

    console.log('Calling insert_group RPC with params:', rpcParams)

    const { data: groupResult, error } = await supabase
      .rpc('insert_group', rpcParams)

    if (error) {
      console.error('Error creating group:', error)
      console.error('RPC params:', rpcParams)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json({ 
        error: 'Failed to create group',
        details: error.message || 'Unknown error'
      }, { status: 500 })
    }

    console.log('RPC result:', groupResult)

    // A função RPC retorna JSON, mas pode vir envolvido em um objeto com a chave da função
    let groupData = null
    if (groupResult) {
      // Se retornar como objeto com chave 'insert_group'
      if (groupResult.insert_group) {
        groupData = groupResult.insert_group
      } 
      // Se retornar como array
      else if (Array.isArray(groupResult)) {
        groupData = groupResult[0]
      } 
      // Se retornar como objeto direto
      else if (typeof groupResult === 'object' && groupResult.id) {
        groupData = groupResult
      } 
      // Se retornar como string JSON
      else if (typeof groupResult === 'string') {
        try {
          const parsed = JSON.parse(groupResult)
          groupData = parsed.insert_group || parsed
        } catch (e) {
          console.error('Error parsing groupResult:', e)
        }
      }
    }

    if (!groupData || !groupData.id) {
      console.error('Invalid group data returned:', groupResult)
      return NextResponse.json({ 
        error: 'Failed to create group',
        details: 'Invalid response from server',
        debug: { groupResult, groupData }
      }, { status: 500 })
    }

    // Buscar grupo criado da view para garantir formato correto
    const { data: createdGroup, error: fetchError } = await supabase
      .schema('public')
      .from('groups_view')
      .select('*')
      .eq('id', groupData.id)
      .single()

    if (fetchError) {
      console.error('Error fetching created group:', fetchError)
      // Retornar dados do RPC mesmo assim
      return NextResponse.json({
        ...groupData,
        total_numbers: 0,
        active_numbers: 0,
      }, { status: 201 })
    }

    // Atualizar contador de grupos no tenant_limits (se existir)
    try {
      const { error: incrementError } = await supabase.rpc('increment_group_count', {
        p_company_id: user.company_id
      })
      if (incrementError) {
        console.log('Could not increment group count:', incrementError)
      }
    } catch (error) {
      // Ignorar erro se tenant_limits não existir ainda
      console.log('Could not increment group count:', error)
    }

    return NextResponse.json({
      ...createdGroup,
      total_numbers: 0,
      active_numbers: 0,
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/groups:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

