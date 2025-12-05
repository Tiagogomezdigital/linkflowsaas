import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    // Verificar se é admin - retorna 401 ou 403 se não for
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error.error }, { status: auth.error.status })
    }

    const supabase = createAdminClient()

    // Total de empresas
    const { count: totalEmpresas } = await supabase
      .from('companies_view')
      .select('*', { count: 'exact', head: true })

    // Empresas ativas (subscription_status = 'active')
    const { count: empresasAtivas } = await supabase
      .from('companies_view')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')

    // Total de usuários
    const { count: totalUsuarios } = await supabase
      .from('users_view')
      .select('*', { count: 'exact', head: true })

    // Usuários ativos
    const { count: usuariosAtivos } = await supabase
      .from('users_view')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Total de cliques (todos os tempos)
    // Usar data direta em vez de count para garantir precisão
    const { data: allClicks } = await supabase
      .from('clicks_view')
      .select('id')
    
    const totalCliques = allClicks?.length || 0

    // Cliques este mês
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: clicksThisMonth } = await supabase
      .from('clicks_view')
      .select('id')
      .gte('created_at', startOfMonth.toISOString())
    
    const cliquesMes = clicksThisMonth?.length || 0

    // Distribuição por plano (excluindo empresas admin)
    const { data: planos } = await supabase
      .from('companies_view')
      .select('plan_type, name')

    const distribuicaoPlanos = {
      free: 0,
      monthly: 0,
      annual: 0,
    }

    planos?.forEach((company: any) => {
      // Excluir empresas admin da contagem de planos
      const isAdminCompany = company.name && (
        company.name.toLowerCase().includes('admin') ||
        company.name.toLowerCase() === 'admin company'
      )
      
      if (isAdminCompany) {
        return // Não contar empresas admin
      }

      const plan = company.plan_type
      if (plan && plan in distribuicaoPlanos) {
        distribuicaoPlanos[plan as keyof typeof distribuicaoPlanos]++
      } else {
        distribuicaoPlanos.free++ // Empresas sem plano são Free/Trial
      }
    })

    // Novas empresas este mês
    const { count: novasEmpresasMes } = await supabase
      .from('companies_view')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    // Novos usuários este mês
    const { count: novosUsuariosMes } = await supabase
      .from('users_view')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    return NextResponse.json({
      empresas: {
        total: totalEmpresas || 0,
        ativas: empresasAtivas || 0,
        novasMes: novasEmpresasMes || 0,
      },
      usuarios: {
        total: totalUsuarios || 0,
        ativos: usuariosAtivos || 0,
        novosMes: novosUsuariosMes || 0,
      },
      cliques: {
        total: totalCliques || 0,
        mes: cliquesMes || 0,
      },
      planos: distribuicaoPlanos,
    })
  } catch (error) {
    console.error('Error in GET /api/admin/stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

