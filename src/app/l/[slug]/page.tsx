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
  
  const supabase = createPublicSchemaClient()

  // Buscar grupo pelo slug usando view
  const { data: group, error: groupError } = await supabase
    .from('groups_view')
    .select('id, name, default_message, is_active, company_id')
    .eq('slug', slug)
    .single()

  if (groupError || !group) {
    console.log('[REDIRECT PAGE] Group not found for slug:', slug, groupError)
    redirect('/not-found')
  }

  if (!group.is_active) {
    console.log('[REDIRECT PAGE] Group is inactive:', group.id)
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

  if (numbersError) {
    console.error('[REDIRECT PAGE] Error fetching numbers:', numbersError)
    redirect('/no-numbers')
  }

  if (!numbers || numbers.length === 0) {
    console.log('[REDIRECT PAGE] No active numbers for group:', group.id)
    redirect('/no-numbers')
  }

  const selectedNumber = numbers[0]

  // Obter informações do request para analytics
  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  const deviceType = getDeviceType(userAgent)
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
             headersList.get('x-real-ip') || 
             'unknown'
  const referrer = headersList.get('referer') || null

  // Atualizar last_used_at e registrar clique (não bloquear se falhar)
  // Usando Promise.allSettled para não bloquear e ignorar erros
  Promise.allSettled([
    supabase.rpc('update_number_last_used', { p_id: selectedNumber.id }),
    supabase.rpc('insert_click', {
      p_company_id: group.company_id,
      p_group_id: group.id,
      p_number_id: selectedNumber.id,
      p_ip_address: ip,
      p_user_agent: userAgent,
      p_device_type: deviceType,
      p_referrer: referrer,
    })
  ]).then((results) => {
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`[REDIRECT PAGE] RPC ${index} failed:`, result.reason)
      }
    })
  })

  // Montar mensagem final
  const finalMessage = [group.default_message, selectedNumber.custom_message]
    .filter(Boolean)
    .join(' ')

  // Gerar link do WhatsApp e redirecionar
  const whatsappUrl = generateWhatsAppLink(selectedNumber.phone, finalMessage)
  console.log('[REDIRECT PAGE] Redirecting to:', whatsappUrl)
  
  redirect(whatsappUrl)
}

