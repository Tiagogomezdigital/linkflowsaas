import { NextRequest, NextResponse } from 'next/server'
import { createPublicSchemaClient } from '@/lib/supabase/server'
import { getDeviceType, generateWhatsAppLink } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    console.log('Redirect request for slug:', slug)
    
    const supabase = createPublicSchemaClient()

    // Buscar grupo pelo slug usando view
    const { data: group, error: groupError } = await supabase
      .from('groups_view')
      .select('id, name, default_message, is_active, company_id')
      .eq('slug', slug)
      .single()

    if (groupError) {
      console.error('Error fetching group:', groupError)
      const notFoundUrl = new URL('/not-found', request.url)
      return NextResponse.redirect(notFoundUrl.toString())
    }

    if (!group) {
      console.log('Group not found for slug:', slug)
      const notFoundUrl = new URL('/not-found', request.url)
      return NextResponse.redirect(notFoundUrl.toString())
    }

    if (!group.is_active) {
      console.log('Group is inactive:', group.id)
      const inactiveUrl = new URL('/group-inactive', request.url)
      return NextResponse.redirect(inactiveUrl.toString())
    }

    // Buscar próximo número ativo (round-robin) usando view
    const { data: numbers, error: numbersError } = await supabase
      .from('whatsapp_numbers_view')
      .select('id, phone, custom_message, last_used_at')
      .eq('group_id', group.id)
      .eq('is_active', true)
      .order('last_used_at', { ascending: true, nullsFirst: true })
      .limit(1)

    if (numbersError) {
      console.error('Error fetching numbers:', numbersError)
      const noNumbersUrl = new URL('/no-numbers', request.url)
      return NextResponse.redirect(noNumbersUrl.toString())
    }

    if (!numbers || numbers.length === 0) {
      console.log('No active numbers found for group:', group.id)
      const noNumbersUrl = new URL('/no-numbers', request.url)
      return NextResponse.redirect(noNumbersUrl.toString())
    }

    const selectedNumber = numbers[0]

    // Atualizar last_used_at usando RPC (não bloquear se falhar)
    try {
      await supabase
        .rpc('update_number_last_used', {
          p_id: selectedNumber.id,
        })
    } catch (updateError) {
      console.error('Error updating last_used_at:', updateError)
      // Continuar mesmo se falhar
    }

    // Obter informações do request para analytics
    const userAgent = request.headers.get('user-agent') || ''
    const deviceType = getDeviceType(userAgent)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const referrer = request.headers.get('referer') || null

    // Registrar clique usando RPC (não bloquear se falhar)
    try {
      await supabase.rpc('insert_click', {
        p_company_id: group.company_id,
        p_group_id: group.id,
        p_number_id: selectedNumber.id,
        p_ip_address: ip,
        p_user_agent: userAgent,
        p_device_type: deviceType,
        p_referrer: referrer,
      })
    } catch (clickError) {
      console.error('Error inserting click:', clickError)
      // Continuar mesmo se falhar
    }

    // Montar mensagem final
    const finalMessage = [group.default_message, selectedNumber.custom_message]
      .filter(Boolean)
      .join(' ')

    // Gerar link do WhatsApp e redirecionar
    const whatsappUrl = generateWhatsAppLink(selectedNumber.phone, finalMessage)
    console.log('Redirecting to WhatsApp:', whatsappUrl)

    return NextResponse.redirect(whatsappUrl)
  } catch (error) {
    console.error('Error in redirect:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    const errorUrl = new URL('/error', request.url)
    return NextResponse.redirect(errorUrl.toString())
  }
}

