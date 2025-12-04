import { NextRequest, NextResponse } from 'next/server'
import { createPublicSchemaClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      startDate, 
      endDate, 
      groupIds = [],
      period = 'today' // today, yesterday, last7days, last30days, thisMonth, lastMonth
    } = body

    const supabase = createPublicSchemaClient()

    // Calcular datas baseado no período
    let start: Date
    let end: Date = new Date()
    end.setHours(23, 59, 59, 999)

    const now = new Date()

    switch (period) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'yesterday':
        start = new Date(now)
        start.setDate(start.getDate() - 1)
        start.setHours(0, 0, 0, 0)
        end = new Date(start)
        end.setHours(23, 59, 59, 999)
        break
      case 'last7days':
        start = new Date(now)
        start.setDate(start.getDate() - 7)
        start.setHours(0, 0, 0, 0)
        break
      case 'last30days':
        start = new Date(now)
        start.setDate(start.getDate() - 30)
        start.setHours(0, 0, 0, 0)
        break
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end = new Date(now.getFullYear(), now.getMonth(), 0)
        end.setHours(23, 59, 59, 999)
        break
      default:
        if (startDate && endDate) {
          start = new Date(startDate)
          end = new Date(endDate)
        } else {
          start = new Date(now.setHours(0, 0, 0, 0))
        }
    }

    // Query base para cliques usando view
    let clicksQuery = supabase
      .from('clicks_view')
      .select('*')
      .eq('company_id', user.company_id)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())

    if (groupIds.length > 0) {
      clicksQuery = clicksQuery.in('group_id', groupIds)
    }

    const { data: clicks, error: clicksError } = await clicksQuery

    if (clicksError) {
      console.error('Error fetching clicks:', clicksError)
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    // Buscar grupos para os nomes usando view
    const { data: groups } = await supabase
      .from('groups_view')
      .select('id, name')
      .eq('company_id', user.company_id)

    const groupMap = new Map(groups?.map(g => [g.id, g.name]) || [])

    // Calcular cliques por dia
    const dailyClicksMap = new Map<string, number>()
    clicks?.forEach(click => {
      const date = click.created_at.split('T')[0]
      dailyClicksMap.set(date, (dailyClicksMap.get(date) || 0) + 1)
    })

    const dailyClicks = Array.from(dailyClicksMap.entries())
      .map(([date, count]) => ({ date, clicks: count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calcular ranking de grupos
    const groupClicksMap = new Map<string, number>()
    clicks?.forEach(click => {
      groupClicksMap.set(click.group_id, (groupClicksMap.get(click.group_id) || 0) + 1)
    })

    const groupRanking = Array.from(groupClicksMap.entries())
      .map(([groupId, count]) => ({
        group_id: groupId,
        group_name: groupMap.get(groupId) || 'Unknown',
        clicks: count,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)

    // Calcular distribuição por dispositivo
    const deviceMap = new Map<string, number>()
    clicks?.forEach(click => {
      const device = click.device_type || 'unknown'
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1)
    })

    const totalClicks = clicks?.length || 0
    const deviceDistribution = Array.from(deviceMap.entries())
      .map(([deviceType, count]) => ({
        device_type: deviceType,
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // Calcular distribuição por navegador
    const browserMap = new Map<string, number>()
    clicks?.forEach(click => {
      const browser = click.browser || 'unknown'
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1)
    })

    const browserDistribution = Array.from(browserMap.entries())
      .map(([browser, count]) => ({
        browser,
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // Calcular distribuição por sistema operacional
    const osMap = new Map<string, number>()
    clicks?.forEach(click => {
      const os = click.os || 'unknown'
      osMap.set(os, (osMap.get(os) || 0) + 1)
    })

    const osDistribution = Array.from(osMap.entries())
      .map(([os, count]) => ({
        os,
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // Calcular cliques por hora do dia
    const hourlyClicksMap = new Map<number, number>()
    clicks?.forEach(click => {
      const date = new Date(click.created_at)
      const hour = date.getHours()
      hourlyClicksMap.set(hour, (hourlyClicksMap.get(hour) || 0) + 1)
    })

    const hourlyClicks = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      clicks: hourlyClicksMap.get(i) || 0,
    }))

    // Buscar números de WhatsApp para ranking
    const { data: numbers } = await supabase
      .from('whatsapp_numbers_view')
      .select('id, phone, name')
      .eq('company_id', user.company_id)

    const numberMap = new Map(numbers?.map(n => [n.id, { phone: n.phone, name: n.name }]) || [])

    // Calcular ranking de números de WhatsApp
    const numberClicksMap = new Map<string, number>()
    clicks?.forEach(click => {
      if (click.number_id) {
        numberClicksMap.set(click.number_id, (numberClicksMap.get(click.number_id) || 0) + 1)
      }
    })

    const numberRanking = Array.from(numberClicksMap.entries())
      .map(([numberId, count]) => {
        const numberInfo = numberMap.get(numberId)
        return {
          number_id: numberId,
          phone: numberInfo?.phone || 'unknown',
          name: numberInfo?.name || 'Sem nome',
          clicks: count,
        }
      })
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)

    // Calcular análise de campanhas UTM
    const utmSourceMap = new Map<string, number>()
    const utmMediumMap = new Map<string, number>()
    const utmCampaignMap = new Map<string, number>()
    
    clicks?.forEach(click => {
      if (click.utm_source) {
        utmSourceMap.set(click.utm_source, (utmSourceMap.get(click.utm_source) || 0) + 1)
      }
      if (click.utm_medium) {
        utmMediumMap.set(click.utm_medium, (utmMediumMap.get(click.utm_medium) || 0) + 1)
      }
      if (click.utm_campaign) {
        utmCampaignMap.set(click.utm_campaign, (utmCampaignMap.get(click.utm_campaign) || 0) + 1)
      }
    })

    const utmSourceDistribution = Array.from(utmSourceMap.entries())
      .map(([source, count]) => ({
        source,
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    const utmMediumDistribution = Array.from(utmMediumMap.entries())
      .map(([medium, count]) => ({
        medium,
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    const utmCampaignDistribution = Array.from(utmCampaignMap.entries())
      .map(([campaign, count]) => ({
        campaign,
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // Calcular análise de referrers
    const referrerMap = new Map<string, number>()
    clicks?.forEach(click => {
      if (click.referrer) {
        try {
          const url = new URL(click.referrer)
          const domain = url.hostname.replace('www.', '')
          referrerMap.set(domain, (referrerMap.get(domain) || 0) + 1)
        } catch {
          referrerMap.set('invalid', (referrerMap.get('invalid') || 0) + 1)
        }
      } else {
        referrerMap.set('direct', (referrerMap.get('direct') || 0) + 1)
      }
    })

    const referrerDistribution = Array.from(referrerMap.entries())
      .map(([referrer, count]) => ({
        referrer,
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calcular comparação com período anterior
    let previousPeriodStart: Date
    let previousPeriodEnd: Date
    
    switch (period) {
      case 'today':
        previousPeriodStart = new Date(now)
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 1)
        previousPeriodStart.setHours(0, 0, 0, 0)
        previousPeriodEnd = new Date(previousPeriodStart)
        previousPeriodEnd.setHours(23, 59, 59, 999)
        break
      case 'yesterday':
        previousPeriodStart = new Date(now)
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 2)
        previousPeriodStart.setHours(0, 0, 0, 0)
        previousPeriodEnd = new Date(previousPeriodStart)
        previousPeriodEnd.setHours(23, 59, 59, 999)
        break
      case 'last7days':
        previousPeriodStart = new Date(now)
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 14)
        previousPeriodStart.setHours(0, 0, 0, 0)
        previousPeriodEnd = new Date(now)
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 7)
        previousPeriodEnd.setHours(23, 59, 59, 999)
        break
      case 'last30days':
        previousPeriodStart = new Date(now)
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 60)
        previousPeriodStart.setHours(0, 0, 0, 0)
        previousPeriodEnd = new Date(now)
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 30)
        previousPeriodEnd.setHours(23, 59, 59, 999)
        break
      case 'thisMonth':
        previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        previousPeriodEnd.setHours(23, 59, 59, 999)
        break
      case 'lastMonth':
        previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        previousPeriodEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0)
        previousPeriodEnd.setHours(23, 59, 59, 999)
        break
      default:
        previousPeriodStart = start
        previousPeriodEnd = end
    }

    // Buscar cliques do período anterior
    let previousClicksQuery = supabase
      .from('clicks_view')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', user.company_id)
      .gte('created_at', previousPeriodStart.toISOString())
      .lte('created_at', previousPeriodEnd.toISOString())

    if (groupIds.length > 0) {
      previousClicksQuery = previousClicksQuery.in('group_id', groupIds)
    }

    const { count: previousTotalClicks } = await previousClicksQuery

    const previousTotal = previousTotalClicks || 0
    const growth = previousTotal > 0 
      ? Math.round(((totalClicks - previousTotal) / previousTotal) * 100) 
      : totalClicks > 0 ? 100 : 0

    return NextResponse.json({
      daily_clicks: dailyClicks,
      group_ranking: groupRanking,
      device_distribution: deviceDistribution,
      browser_distribution: browserDistribution,
      os_distribution: osDistribution,
      hourly_clicks: hourlyClicks,
      number_ranking: numberRanking,
      utm_source_distribution: utmSourceDistribution,
      utm_medium_distribution: utmMediumDistribution,
      utm_campaign_distribution: utmCampaignDistribution,
      referrer_distribution: referrerDistribution,
      total_clicks: totalClicks,
      previous_period_clicks: previousTotal,
      growth_percentage: growth,
    })
  } catch (error) {
    console.error('Error in POST /api/stats/filtered:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

