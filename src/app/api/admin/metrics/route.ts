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

    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || '7d'

    // Calcular datas baseado no período
    const now = new Date()
    const startDate = new Date()
    
    switch (periodo) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '12m':
        startDate.setMonth(now.getMonth() - 12)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    const supabase = createAdminClient()

    // 1. Novas empresas por dia (últimos 7 dias)
    const empresasNovas: number[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const { count } = await supabase
        .schema('public')
        .from('companies_view')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDay.toISOString())

      empresasNovas.push(count || 0)
    }

    // 2. Novos usuários por dia (últimos 7 dias)
    const usuariosNovos: number[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const { count } = await supabase
        .schema('public')
        .from('users_view')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDay.toISOString())

      usuariosNovos.push(count || 0)
    }

    // 3. Cliques por dia (últimos 7 dias)
    const cliquesTotal: number[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const { count } = await supabase
        .schema('public')
        .from('clicks_view')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDay.toISOString())

      cliquesTotal.push(count || 0)
    }

    // 4. MRR por dia (últimos 7 dias) - calcular baseado em empresas ativas e planos
    const mrr: number[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      // Buscar empresas ativas neste dia
      const { data: companies } = await supabase
        .schema('public')
        .from('companies_view')
        .select('plan_type')
        .lte('created_at', nextDay.toISOString())
        .eq('subscription_status', 'active')

      let dailyMRR = 0
      if (companies) {
        // Buscar preços dos planos
        const { data: plans } = await supabase
          .schema('public')
          .from('subscription_plans_view')
          .select('billing_cycle, price_cents')

        const monthlyPlan = plans?.find(p => p.billing_cycle === 'monthly')
        const yearlyPlan = plans?.find(p => p.billing_cycle === 'yearly')

        const monthlyCount = companies.filter(c => c.plan_type === 'monthly').length
        const yearlyCount = companies.filter(c => c.plan_type === 'annual').length

        if (monthlyPlan) {
          dailyMRR += (monthlyPlan.price_cents / 100) * monthlyCount
        }
        if (yearlyPlan) {
          dailyMRR += ((yearlyPlan.price_cents / 100) / 12) * yearlyCount
        }
      }

      mrr.push(Math.round(dailyMRR * 100) / 100)
    }

    // 5. Distribuição por dispositivo
    const { data: clicks } = await supabase
      .from('clicks_view')
      .select('device_type')
      .gte('created_at', startDate.toISOString())

    const deviceCounts: Record<string, number> = {}
    clicks?.forEach((click: any) => {
      const device = click.device_type || 'desktop'
      deviceCounts[device] = (deviceCounts[device] || 0) + 1
    })

    const totalClicks = clicks?.length || 0
    const dispositivos = [
      {
        tipo: 'Mobile',
        count: deviceCounts['mobile'] || 0,
        percentage: totalClicks > 0 ? Math.round(((deviceCounts['mobile'] || 0) / totalClicks) * 100) : 0,
        icon: 'Smartphone',
      },
      {
        tipo: 'Desktop',
        count: deviceCounts['desktop'] || 0,
        percentage: totalClicks > 0 ? Math.round(((deviceCounts['desktop'] || 0) / totalClicks) * 100) : 0,
        icon: 'Monitor',
      },
      {
        tipo: 'Tablet',
        count: deviceCounts['tablet'] || 0,
        percentage: totalClicks > 0 ? Math.round(((deviceCounts['tablet'] || 0) / totalClicks) * 100) : 0,
        icon: 'Tablet',
      },
    ].filter(d => d.count > 0)

    // 6. Top empresas por cliques
    const { data: topCompaniesData } = await supabase
      .from('clicks_view')
      .select('company_id')
      .gte('created_at', startDate.toISOString())

    const companyClicks: Record<string, number> = {}
    topCompaniesData?.forEach((click: any) => {
      const companyId = click.company_id
      if (companyId) {
        companyClicks[companyId] = (companyClicks[companyId] || 0) + 1
      }
    })

    // Buscar nomes das empresas
    const companyIds = Object.keys(companyClicks).slice(0, 5)
    const companyNames: Record<string, string> = {}
    
    if (companyIds.length > 0) {
      const { data: companies } = await supabase
        .schema('public')
        .from('companies_view')
        .select('id, name')
        .in('id', companyIds)

      companies?.forEach((company: any) => {
        companyNames[company.id] = company.name
      })
    }

    // Buscar grupos por empresa para calcular growth
    const topEmpresas = await Promise.all(
      Object.entries(companyClicks)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(async ([companyId, count]) => {
          const { count: grupos } = await supabase
            .schema('public')
            .from('groups_view')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)

          // Calcular growth (comparar com período anterior)
          const periodDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          const previousStart = new Date(startDate)
          previousStart.setDate(previousStart.getDate() - periodDays)

          const { count: previousClicks } = await supabase
            .schema('public')
            .from('clicks_view')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .gte('created_at', previousStart.toISOString())
            .lt('created_at', startDate.toISOString())

          const growth = previousClicks && previousClicks > 0
            ? Math.round(((count - previousClicks) / previousClicks) * 100)
            : 0

          return {
            nome: companyNames[companyId] || 'Sem nome',
            cliques: count,
            grupos: grupos || 0,
            growth,
          }
        })
    )

    // 7. Distribuição geográfica (baseado em cliques)
    const { data: clicksGeo } = await supabase
      .from('clicks_view')
      .select('country, company_id')
      .gte('created_at', startDate.toISOString())

    const geoCounts: Record<string, Set<string>> = {}
    clicksGeo?.forEach((click: any) => {
      const country = click.country || 'Outros'
      const companyId = click.company_id
      if (!geoCounts[country]) {
        geoCounts[country] = new Set()
      }
      if (companyId) {
        geoCounts[country].add(companyId)
      }
    })

    const totalCompaniesGeo = Object.values(geoCounts).reduce((sum, set) => sum + set.size, 0)
    const topRegioes = Object.entries(geoCounts)
      .map(([nome, companies]) => ({
        nome,
        empresas: companies.size,
        percentage: totalCompaniesGeo > 0 ? Math.round((companies.size / totalCompaniesGeo) * 100) : 0,
      }))
      .sort((a, b) => b.empresas - a.empresas)
      .slice(0, 5)

    // Adicionar "Outros" se necessário
    if (topRegioes.length < Object.keys(geoCounts).length) {
      const othersCount = Object.values(geoCounts)
        .slice(5)
        .reduce((sum, set) => sum + set.size, 0)
      if (othersCount > 0) {
        topRegioes.push({
          nome: 'Outros',
          empresas: othersCount,
          percentage: totalCompaniesGeo > 0 ? Math.round((othersCount / totalCompaniesGeo) * 100) : 0,
        })
      }
    }

    // 8. Funil de conversão (baseado em planos)
    const { data: allCompanies } = await supabase
      .from('companies_view')
      .select('plan_type, subscription_status')

    const trialCount = allCompanies?.filter(c => c.subscription_status === 'trial' || !c.plan_type).length || 0
    const monthlyCount = allCompanies?.filter(c => c.plan_type === 'monthly').length || 0
    const annualCount = allCompanies?.filter(c => c.plan_type === 'annual').length || 0
    const totalActive = monthlyCount + annualCount

    const trialToStarter = trialCount > 0 ? Math.round((totalActive / (trialCount + totalActive)) * 100) : 0
    const starterToPro = monthlyCount > 0 ? Math.round((annualCount / (monthlyCount + annualCount)) * 100) : 0
    const proToEnterprise = 0 // Não temos plano enterprise ainda

    // 9. Churn rate
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const { count: cancelledLastMonth } = await supabase
      .from('companies_view')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'canceled')
      .gte('updated_at', lastMonth.toISOString())

    const { count: totalActiveCompanies } = await supabase
      .from('companies_view')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')

    const churnRate = totalActiveCompanies && totalActiveCompanies > 0
      ? Math.round(((cancelledLastMonth || 0) / totalActiveCompanies) * 100 * 10) / 10
      : 0

    // Calcular crescimento percentual (comparar com período anterior)
    const periodDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const previousStart = new Date(startDate)
    previousStart.setDate(previousStart.getDate() - periodDays)

    // Empresas no período anterior
    const { count: empresasAnteriores } = await supabase
      .from('companies_view')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', startDate.toISOString())

    const empresasAtuais = empresasNovas.reduce((a, b) => a + b, 0)
    const crescimentoEmpresas = empresasAnteriores && empresasAnteriores > 0
      ? Math.round(((empresasAtuais - empresasAnteriores) / empresasAnteriores) * 100)
      : empresasAtuais > 0 ? 100 : 0

    // Usuários no período anterior
    const { count: usuariosAnteriores } = await supabase
      .from('users_view')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', startDate.toISOString())

    const usuariosAtuais = usuariosNovos.reduce((a, b) => a + b, 0)
    const crescimentoUsuarios = usuariosAnteriores && usuariosAnteriores > 0
      ? Math.round(((usuariosAtuais - usuariosAnteriores) / usuariosAnteriores) * 100)
      : usuariosAtuais > 0 ? 100 : 0

    // Cliques no período anterior
    const { count: cliquesAnteriores } = await supabase
      .from('clicks_view')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', startDate.toISOString())

    const cliquesAtuais = cliquesTotal.reduce((a, b) => a + b, 0)
    const crescimentoCliques = cliquesAnteriores && cliquesAnteriores > 0
      ? Math.round(((cliquesAtuais - cliquesAnteriores) / cliquesAnteriores) * 100)
      : cliquesAtuais > 0 ? 100 : 0

    // MRR no período anterior
    const mrrAtual = mrr.length > 0 ? mrr[mrr.length - 1] : 0
    const mrrAnterior = mrr.length > 1 ? mrr[0] : 0
    const crescimentoMRR = mrrAnterior > 0
      ? Math.round(((mrrAtual - mrrAnterior) / mrrAnterior) * 100)
      : mrrAtual > 0 ? 100 : 0

    return NextResponse.json({
      empresasNovas,
      usuariosNovos,
      cliquesTotal,
      mrr,
      dispositivos,
      topEmpresas,
      topRegioes,
      trialToStarter,
      starterToPro,
      proToEnterprise,
      churnRate,
      churnEmpresas: cancelledLastMonth || 0,
      crescimentoEmpresas,
      crescimentoUsuarios,
      crescimentoCliques,
      crescimentoMRR,
    })
  } catch (error) {
    console.error('Error in GET /api/admin/metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

