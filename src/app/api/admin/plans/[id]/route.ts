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

    const { data: plan, error } = await supabase
      .schema('public')
      .from('subscription_plans_view')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error in GET /api/admin/plans/[id]:', error)
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
    const { 
      name, 
      description, 
      price_cents, 
      billing_cycle, 
      features, 
      limits,
      is_active,
      sort_order
    } = body

    const supabase = createServiceRoleClient()

    // Verificar se plano existe
    const { data: existingPlan } = await supabase
      .schema('public')
      .from('subscription_plans_view')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    if (billing_cycle !== undefined && !['monthly', 'yearly', 'lifetime'].includes(billing_cycle)) {
      return NextResponse.json(
        { error: 'Invalid billing_cycle' },
        { status: 400 }
      )
    }

    // Preparar parâmetros para RPC (não enviar undefined, apenas valores definidos)
    const rpcParams: any = {
      p_id: params.id,
    }

    if (name !== undefined) rpcParams.p_name = name
    if (description !== undefined) rpcParams.p_description = description
    if (price_cents !== undefined) rpcParams.p_price_cents = parseInt(price_cents)
    if (billing_cycle !== undefined) rpcParams.p_billing_cycle = billing_cycle
    if (features !== undefined) rpcParams.p_features = features
    if (limits !== undefined) rpcParams.p_limits = limits
    if (is_active !== undefined) rpcParams.p_is_active = is_active
    if (sort_order !== undefined) rpcParams.p_sort_order = parseInt(sort_order)

    // Usar RPC para atualizar
    const { data: plan, error } = await supabase
      .rpc('upsert_subscription_plan', rpcParams)

    if (error) {
      console.error('Error updating plan:', error)
      console.error('RPC params:', rpcParams)
      return NextResponse.json({ 
        error: 'Failed to update plan',
        details: error.message 
      }, { status: 500 })
    }

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found or update failed' }, { status: 404 })
    }

    // Buscar plano atualizado da view para garantir formato correto
    const { data: updatedPlan, error: fetchError } = await supabase
      .schema('public')
      .from('subscription_plans_view')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !updatedPlan) {
      console.error('Error fetching updated plan:', fetchError)
      // Retornar dados do RPC mesmo assim
      return NextResponse.json(plan)
    }

    return NextResponse.json(updatedPlan)
  } catch (error) {
    console.error('Error in PUT /api/admin/plans/[id]:', error)
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

    // Verificar se plano existe
    const { data: existingPlan } = await supabase
      .schema('public')
      .from('subscription_plans_view')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Verificar se há empresas usando este plano
    // Por enquanto, permitir exclusão - em produção, verificar subscriptions
    
    // Usar RPC para deletar
    const { data: deleted, error } = await supabase
      .rpc('delete_subscription_plan', {
        p_id: params.id
      })

    if (!deleted) {
      return NextResponse.json({ error: 'Plan not found or could not be deleted' }, { status: 404 })
    }

    if (error) {
      console.error('Error deleting plan:', error)
      return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/plans/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

