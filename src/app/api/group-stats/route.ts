import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()

    // Buscar grupos com números
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        slug,
        whatsapp_numbers (
          id,
          is_active
        )
      `)
      .eq('company_id', user.company_id)

    if (groupsError) {
      console.error('Error fetching groups:', groupsError)
      return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
    }

    // Para cada grupo, buscar estatísticas de cliques
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(startOfWeek.getDate() - 7)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const groupStats = await Promise.all(
      (groups || []).map(async (group: any) => {
        const numbers = group.whatsapp_numbers || []

        // Buscar total de cliques
        const { count: totalClicks } = await supabase
          .from('clicks')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id)

        // Buscar cliques de hoje
        const { count: clicksToday } = await supabase
          .from('clicks')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id)
          .gte('created_at', startOfDay.toISOString())

        // Buscar cliques da semana
        const { count: clicksThisWeek } = await supabase
          .from('clicks')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id)
          .gte('created_at', startOfWeek.toISOString())

        // Buscar cliques do mês
        const { count: clicksThisMonth } = await supabase
          .from('clicks')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id)
          .gte('created_at', startOfMonth.toISOString())

        // Buscar último clique
        const { data: lastClick } = await supabase
          .from('clicks')
          .select('created_at')
          .eq('group_id', group.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          id: group.id,
          name: group.name,
          slug: group.slug,
          total_numbers: numbers.length,
          active_numbers: numbers.filter((n: any) => n.is_active).length,
          total_clicks: totalClicks || 0,
          clicks_today: clicksToday || 0,
          clicks_this_week: clicksThisWeek || 0,
          clicks_this_month: clicksThisMonth || 0,
          last_click_at: lastClick?.created_at || null,
        }
      })
    )

    return NextResponse.json(groupStats)
  } catch (error) {
    console.error('Error in GET /api/group-stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

