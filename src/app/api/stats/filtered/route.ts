import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'

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

    const supabase = createServiceRoleClient()

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

    // Query base para cliques
    let clicksQuery = supabase
      .from('clicks')
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

    // Buscar grupos para os nomes
    const { data: groups } = await supabase
      .from('groups')
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

    return NextResponse.json({
      daily_clicks: dailyClicks,
      group_ranking: groupRanking,
      device_distribution: deviceDistribution,
      total_clicks: totalClicks,
    })
  } catch (error) {
    console.error('Error in POST /api/stats/filtered:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

