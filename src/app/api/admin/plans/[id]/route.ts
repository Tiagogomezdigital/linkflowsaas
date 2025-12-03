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

    // Usar RPC para atualizar
    const { data: plan, error } = await supabase
      .rpc('upsert_subscription_plan', {
        p_id: params.id,
        p_name: name,
        p_description: description,
        p_price_cents: price_cents !== undefined ? parseInt(price_cents) : null,
        p_billing_cycle: billing_cycle,
        p_features: features,
        p_limits: limits,
        p_is_active: is_active,
        p_sort_order: sort_order !== undefined ? parseInt(sort_order) : null,
      })

    if (error) {
      console.error('Error updating plan:', error)
      return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
    }

    return NextResponse.json(plan)
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

