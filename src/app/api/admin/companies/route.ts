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

    const { searchParams } = new URL(request.url)
    const plan = searchParams.get('plan')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const supabase = createServiceRoleClient()

    let query = supabase
      .schema('public')
      .from('companies_view')
      .select('*')
      .order('created_at', { ascending: false })

    if (plan) {
      query = query.eq('plan_type', plan)
    }

    if (status) {
      query = query.eq('subscription_status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`)
    }

    const { data: companies, error } = await query

    if (error) {
      console.error('Error fetching companies:', error)
      return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
    }

    // Buscar estatísticas para cada empresa
    const companiesWithStats = await Promise.all(
      (companies || []).map(async (company: any) => {
        const { count: clicks } = await supabase
          .schema('public')
          .from('clicks_view')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)

        const { count: users } = await supabase
          .schema('public')
          .from('users_view')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)

        const { count: groups } = await supabase
          .schema('public')
          .from('groups_view')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)

        return {
          ...company,
          users_count: users || 0,
          groups_count: groups || 0,
          clicks_count: clicks || 0,
        }
      })
    )

    return NextResponse.json(companiesWithStats)
  } catch (error) {
    console.error('Error in GET /api/admin/companies:', error)
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
    const { name, slug, plan_type = 'trial', subscription_status = 'trial' } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Verificar se slug já existe
    const { data: existingSlug } = await supabase
      .schema('public')
      .from('companies_view')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      )
    }

    // Usar RPC para inserir
    const { data: company, error } = await supabase
      .rpc('upsert_company', {
        p_id: null,
        p_name: name,
        p_slug: slug,
        p_plan_type: plan_type,
        p_subscription_status: subscription_status,
      })

    if (error) {
      console.error('Error creating company:', error)
      return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
    }

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/companies:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

