import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getAuthUser()
    
    // Verificar se é super admin (por enquanto, qualquer usuário autenticado)
    // Em produção, adicionar verificação de role específico
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    // Total de empresas
    const { count: totalEmpresas } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })

    // Empresas ativas (subscription_status = 'active')
    const { count: empresasAtivas } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')

    // Total de usuários
    const { count: totalUsuarios } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Usuários ativos
    const { count: usuariosAtivos } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Total de cliques (todos os tempos)
    const { count: totalCliques } = await supabase
      .from('clicks')
      .select('*', { count: 'exact', head: true })

    // Cliques este mês
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: cliquesMes } = await supabase
      .from('clicks')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    // Distribuição por plano
    const { data: planos } = await supabase
      .from('companies')
      .select('plan_type')

    const distribuicaoPlanos = {
      free: 0,
      monthly: 0,
      annual: 0,
    }

    planos?.forEach((company: any) => {
      const plan = company.plan_type
      if (plan && plan in distribuicaoPlanos) {
        distribuicaoPlanos[plan as keyof typeof distribuicaoPlanos]++
      } else {
        distribuicaoPlanos.free++ // Empresas sem plano são Free/Trial
      }
    })

    // Novas empresas este mês
    const { count: novasEmpresasMes } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    // Novos usuários este mês
    const { count: novosUsuariosMes } = await supabase
      .from('users')
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

