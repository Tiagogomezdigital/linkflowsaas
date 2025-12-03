import { NextResponse } from 'next/server'
import { createPublicSchemaClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createPublicSchemaClient()

    // Buscar grupos usando view
    const { data: groups, error: groupsError } = await supabase
      .from('groups_view')
      .select('id, name, slug')
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
        // Buscar números do grupo usando view
        const { data: numbers } = await supabase
          .from('whatsapp_numbers_view')
          .select('id, is_active')
          .eq('group_id', group.id)

        // Buscar TODOS os cliques do grupo (mais confiável que count)
        const { data: allClicks } = await supabase
          .from('clicks_view')
          .select('id, created_at')
          .eq('group_id', group.id)
        
        const clicksArray = allClicks || []
        const totalClicks = clicksArray.length

        // Filtrar cliques por período
        const clicksToday = clicksArray.filter((c: any) => 
          new Date(c.created_at) >= startOfDay
        ).length

        const clicksThisWeek = clicksArray.filter((c: any) => 
          new Date(c.created_at) >= startOfWeek
        ).length

        const clicksThisMonth = clicksArray.filter((c: any) => 
          new Date(c.created_at) >= startOfMonth
        ).length

        // Buscar último clique (ordenar array já buscado)
        const sortedClicks = [...clicksArray].sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        const lastClickAt = sortedClicks[0]?.created_at || null

        return {
          id: group.id,
          name: group.name,
          slug: group.slug,
          total_numbers: (numbers || []).length,
          active_numbers: (numbers || []).filter((n: any) => n.is_active).length,
          total_clicks: totalClicks,
          clicks_today: clicksToday,
          clicks_this_week: clicksThisWeek,
          clicks_this_month: clicksThisMonth,
          last_click_at: lastClickAt,
        }
      })
    )

    return NextResponse.json(groupStats)
  } catch (error) {
    console.error('Error in GET /api/group-stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

