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
      .from('subscription_plans')
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
      .from('subscription_plans')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price_cents !== undefined) updateData.price_cents = parseInt(price_cents)
    if (billing_cycle !== undefined) {
      if (!['monthly', 'yearly', 'lifetime'].includes(billing_cycle)) {
        return NextResponse.json(
          { error: 'Invalid billing_cycle' },
          { status: 400 }
        )
      }
      updateData.billing_cycle = billing_cycle
    }
    if (features !== undefined) updateData.features = features
    if (limits !== undefined) updateData.limits = limits
    if (is_active !== undefined) updateData.is_active = is_active
    if (sort_order !== undefined) updateData.sort_order = parseInt(sort_order)

    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

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
      .from('subscription_plans')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Verificar se há empresas usando este plano
    const { count: companiesUsingPlan } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', params.id)

    if (companiesUsingPlan && companiesUsingPlan > 0) {
      return NextResponse.json(
        { error: 'Cannot delete plan that is in use by companies' },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', params.id)

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

