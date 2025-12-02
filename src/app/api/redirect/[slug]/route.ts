import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getDeviceType, generateWhatsAppLink } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const supabase = createServiceRoleClient()

    // Buscar grupo pelo slug
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name, default_message, is_active, company_id')
      .eq('slug', slug)
      .single()

    if (groupError || !group) {
      return NextResponse.redirect(new URL('/not-found', request.url))
    }

    if (!group.is_active) {
      return NextResponse.redirect(new URL('/group-inactive', request.url))
    }

    // Buscar próximo número ativo (round-robin)
    const { data: numbers, error: numbersError } = await supabase
      .from('whatsapp_numbers')
      .select('id, phone, custom_message, last_used_at')
      .eq('group_id', group.id)
      .eq('is_active', true)
      .order('last_used_at', { ascending: true, nullsFirst: true })
      .limit(1)

    if (numbersError || !numbers || numbers.length === 0) {
      return NextResponse.redirect(new URL('/no-numbers', request.url))
    }

    const selectedNumber = numbers[0]

    // Atualizar last_used_at
    await supabase
      .from('whatsapp_numbers')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', selectedNumber.id)

    // Obter informações do request para analytics
    const userAgent = request.headers.get('user-agent') || ''
    const deviceType = getDeviceType(userAgent)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const referrer = request.headers.get('referer') || null

    // Registrar clique
    await supabase.from('clicks').insert({
      company_id: group.company_id,
      group_id: group.id,
      number_id: selectedNumber.id,
      ip_address: ip,
      user_agent: userAgent,
      device_type: deviceType,
      referrer: referrer,
    })

    // Montar mensagem final
    const finalMessage = [group.default_message, selectedNumber.custom_message]
      .filter(Boolean)
      .join(' ')

    // Gerar link do WhatsApp e redirecionar
    const whatsappUrl = generateWhatsAppLink(selectedNumber.phone, finalMessage)

    return NextResponse.redirect(whatsappUrl)
  } catch (error) {
    console.error('Error in redirect:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
}

