import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Verificar se é admin
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error.error }, { status: auth.error.status })
    }

    const supabase = createAdminClient()

    const { data: plans, error } = await supabase
      .from('subscription_plans_view')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching plans:', error)
      return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
    }

    // Buscar estatísticas de empresas por plano
    const plansWithStats = await Promise.all(
      (plans || []).map(async (plan: any) => {
        // Contar empresas com este plano
        const { count: empresas } = await supabase
          .schema('public')
          .from('companies_view')
          .select('*', { count: 'exact', head: true })
          .eq('plan_type', plan.billing_cycle === 'monthly' ? 'monthly' : plan.billing_cycle === 'yearly' ? 'annual' : null)

        // Calcular MRR
        let mrr = 0
        if (plan.billing_cycle === 'monthly') {
          mrr = (plan.price_cents / 100) * (empresas || 0)
        } else if (plan.billing_cycle === 'yearly') {
          mrr = ((plan.price_cents / 100) / 12) * (empresas || 0)
        }

        return {
          ...plan,
          empresas: empresas || 0,
          mrr: Math.round(mrr * 100) / 100,
        }
      })
    )

    return NextResponse.json(plansWithStats)
  } catch (error) {
    console.error('Error in GET /api/admin/plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se é admin
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error.error }, { status: auth.error.status })
    }

    const body = await request.json()
    const { 
      name, 
      description, 
      price_cents, 
      billing_cycle, 
      features = [], 
      limits = {},
      is_active = true,
      sort_order = 0
    } = body

    if (!name || price_cents === undefined || !billing_cycle) {
      return NextResponse.json(
        { error: 'Name, price_cents and billing_cycle are required' },
        { status: 400 }
      )
    }

    if (!['monthly', 'yearly', 'lifetime'].includes(billing_cycle)) {
      return NextResponse.json(
        { error: 'Invalid billing_cycle. Must be monthly, yearly or lifetime' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: planResult, error } = await supabase
      .rpc('upsert_subscription_plan', {
        p_id: null,
        p_name: name,
        p_description: description,
        p_price_cents: parseInt(price_cents),
        p_currency: 'BRL',
        p_billing_cycle: billing_cycle,
        p_features: features,
        p_limits: limits,
        p_is_active: is_active,
        p_sort_order: parseInt(sort_order),
      })

    if (error) {
      console.error('Error creating plan:', error)
      return NextResponse.json({ 
        error: 'Failed to create plan',
        details: error.message 
      }, { status: 500 })
    }

    // A função RPC retorna JSON, então pode ser um objeto ou array
    const planData = Array.isArray(planResult) ? planResult[0] : planResult

    if (!planData) {
      return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
    }

    // Buscar plano criado da view para garantir formato correto
    const { data: createdPlan, error: fetchError } = await supabase
      .from('subscription_plans_view')
      .select('*')
      .eq('id', planData.id)
      .single()

    if (fetchError || !createdPlan) {
      console.error('Error fetching created plan:', fetchError)
      return NextResponse.json(planData, { status: 201 })
    }

    return NextResponse.json(createdPlan, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

