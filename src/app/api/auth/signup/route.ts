import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { signJWT, setAuthCookie } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { DEFAULT_LIMITS } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      company_name,
      company_slug,
      user_name,
      user_email,
      password,
      plan_type,
    } = body

    // Validações
    if (!company_name || !company_slug || !user_name || !user_email || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    if (!/^[a-z0-9-]+$/.test(company_slug)) {
      return NextResponse.json(
        { error: 'Slug deve conter apenas letras minúsculas, números e hífens' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user_email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Verificar se slug já existe
    const { data: existingSlug } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', company_slug.toLowerCase())
      .single()

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug já está em uso. Escolha outro.' },
        { status: 409 }
      )
    }

    // Verificar se email já existe
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', user_email.toLowerCase())
      .single()

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email já está cadastrado' },
        { status: 409 }
      )
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10)

    // Criar empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: company_name,
        slug: company_slug.toLowerCase(),
        plan_type: plan_type || null,
        subscription_status: plan_type ? 'active' : 'trial',
      })
      .select()
      .single()

    if (companyError || !company) {
      console.error('Error creating company:', companyError)
      return NextResponse.json(
        { error: 'Erro ao criar empresa' },
        { status: 500 }
      )
    }

    // Criar usuário owner
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: user_email.toLowerCase(),
        name: user_name,
        password_hash: passwordHash,
        company_id: company.id,
        role: 'owner',
        is_active: true,
      })
      .select()
      .single()

    if (userError || !user) {
      // Rollback: deletar empresa se usuário falhar
      await supabase.from('companies').delete().eq('id', company.id)
      console.error('Error creating user:', userError)
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    // Criar tenant_limits baseado no plano
    const limits = plan_type === 'monthly' 
      ? DEFAULT_LIMITS.monthly
      : plan_type === 'annual'
      ? DEFAULT_LIMITS.annual
      : DEFAULT_LIMITS.free

    // Buscar ou criar plano correspondente
    let planId: string | null = null
    
    if (plan_type) {
      // Buscar plano existente
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('billing_cycle', plan_type === 'monthly' ? 'monthly' : 'yearly')
        .eq('is_active', true)
        .single()

      if (plan) {
        planId = plan.id
      }
    } else {
      // Para plano free, buscar ou criar plano "Free"
      const { data: freePlan } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('billing_cycle', 'lifetime')
        .eq('name', 'Free')
        .single()

      if (freePlan) {
        planId = freePlan.id
      } else {
        // Criar plano Free se não existir
        const { data: newPlan } = await supabase
          .from('subscription_plans')
          .insert({
            name: 'Free',
            description: 'Plano gratuito',
            price_cents: 0,
            billing_cycle: 'lifetime',
            features: [],
            limits: {},
            is_active: true,
            sort_order: 0,
          })
          .select()
          .single()

        if (newPlan) {
          planId = newPlan.id
        }
      }
    }

    // Criar tenant_limits
    if (planId) {
      await supabase.from('tenant_limits').insert({
        company_id: company.id,
        plan_id: planId,
        max_groups: limits.maxGroups,
        max_links_per_month: limits.maxLinksPerMonth,
        max_custom_domains: limits.maxCustomDomains,
        max_team_members: limits.maxTeamMembers,
        current_groups: 0,
        current_links_this_month: 0,
        current_custom_domains: 0,
        current_team_members: 1,
      })
    }

    // Gerar JWT e fazer login automático
    const token = await signJWT({
      sub: user.id,
      email: user.email,
      name: user.name || '',
      company_id: user.company_id,
      role: user.role,
    })

    // Definir cookie
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      company_id: company.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/auth/signup:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

