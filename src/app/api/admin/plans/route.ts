import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    const { data: plans, error } = await supabase
      .from('subscription_plans')
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
          .from('companies')
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

    const supabase = createServiceRoleClient()

    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .insert({
        name,
        description,
        price_cents: parseInt(price_cents),
        currency: 'BRL',
        billing_cycle,
        features,
        limits,
        is_active,
        sort_order: parseInt(sort_order),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating plan:', error)
      return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
    }

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

