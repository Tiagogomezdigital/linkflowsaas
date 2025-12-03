import { redirect } from 'next/navigation'
import { createPublicSchemaClient } from '@/lib/supabase/server'
import { getDeviceType, generateWhatsAppLink } from '@/lib/utils'
import { headers } from 'next/headers'

interface PageProps {
  params: { slug: string }
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function RedirectPage({ params }: PageProps) {
  const { slug } = params
  
  try {
    const supabase = createPublicSchemaClient()

    // Buscar grupo pelo slug usando view
    const { data: group, error: groupError } = await supabase
      .from('groups_view')
      .select('id, name, default_message, is_active, company_id')
      .eq('slug', slug)
      .single()

    if (groupError || !group) {
      redirect('/not-found')
    }

    if (!group.is_active) {
      redirect('/group-inactive')
    }

    // Buscar próximo número ativo (round-robin) usando view
    const { data: numbers, error: numbersError } = await supabase
      .from('whatsapp_numbers_view')
      .select('id, phone, custom_message, last_used_at')
      .eq('group_id', group.id)
      .eq('is_active', true)
      .order('last_used_at', { ascending: true, nullsFirst: true })
      .limit(1)

    if (numbersError || !numbers || numbers.length === 0) {
      redirect('/no-numbers')
    }

    const selectedNumber = numbers[0]

    // Atualizar last_used_at usando RPC (não bloquear se falhar)
    try {
      await supabase
        .rpc('update_number_last_used', {
          p_id: selectedNumber.id,
        })
    } catch (updateError) {
      // Continuar mesmo se falhar
    }

    // Obter informações do request para analytics
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || ''
    const deviceType = getDeviceType(userAgent)
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
               headersList.get('x-real-ip') || 
               'unknown'
    const referrer = headersList.get('referer') || null

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
      // Continuar mesmo se falhar
    }

    // Montar mensagem final
    const finalMessage = [group.default_message, selectedNumber.custom_message]
      .filter(Boolean)
      .join(' ')

    // Gerar link do WhatsApp e redirecionar
    const whatsappUrl = generateWhatsAppLink(selectedNumber.phone, finalMessage)
    redirect(whatsappUrl)
  } catch (error) {
    console.error('Error in redirect page:', error)
    redirect('/error')
  }
}

