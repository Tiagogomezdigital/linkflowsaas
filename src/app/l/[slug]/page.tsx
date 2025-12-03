import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getDeviceType, generateWhatsAppLink } from '@/lib/utils'
import { headers } from 'next/headers'

interface PageProps {
  params: { slug: string }
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Função helper para criar cliente Supabase com tratamento de erro
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('[REDIRECT] Supabase URL exists:', !!url)
  console.log('[REDIRECT] Supabase Key exists:', !!key)
  
  if (!url || !key) {
    console.error('[REDIRECT] Missing Supabase credentials')
    return null
  }
  
  return createClient(url, key, {
    db: { schema: 'public' }
  })
}

export default async function RedirectPage({ params }: PageProps) {
  const { slug } = params
  console.log('[REDIRECT] Processing slug:', slug)
  
  // Verificar variáveis de ambiente
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    console.error('[REDIRECT] Failed to create Supabase client')
    redirect('/error')
  }

  // Buscar grupo pelo slug usando view
  console.log('[REDIRECT] Fetching group for slug:', slug)
  const { data: group, error: groupError } = await supabase
    .from('groups_view')
    .select('id, name, default_message, is_active, company_id')
    .eq('slug', slug)
    .single()

  console.log('[REDIRECT] Group result:', { group, error: groupError })

  if (groupError) {
    console.error('[REDIRECT] Group error:', JSON.stringify(groupError))
    redirect('/not-found')
  }

  if (!group) {
    console.log('[REDIRECT] Group not found for slug:', slug)
    redirect('/not-found')
  }

  if (!group.is_active) {
    console.log('[REDIRECT] Group is inactive:', group.id)
    redirect('/group-inactive')
  }

  // Buscar próximo número ativo (round-robin) usando view
  console.log('[REDIRECT] Fetching numbers for group:', group.id)
  const { data: numbers, error: numbersError } = await supabase
    .from('whatsapp_numbers_view')
    .select('id, phone, custom_message, last_used_at')
    .eq('group_id', group.id)
    .eq('is_active', true)
    .order('last_used_at', { ascending: true, nullsFirst: true })
    .limit(1)

  console.log('[REDIRECT] Numbers result:', { count: numbers?.length, error: numbersError })

  if (numbersError) {
    console.error('[REDIRECT] Numbers error:', JSON.stringify(numbersError))
    redirect('/no-numbers')
  }

  if (!numbers || numbers.length === 0) {
    console.log('[REDIRECT] No active numbers for group:', group.id)
    redirect('/no-numbers')
  }

  const selectedNumber = numbers[0]
  console.log('[REDIRECT] Selected number:', selectedNumber.id, selectedNumber.phone)

  // Obter informações do request para analytics
  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  const deviceType = getDeviceType(userAgent)
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
             headersList.get('x-real-ip') || 
             'unknown'
  const referrer = headersList.get('referer') || null

  // Atualizar last_used_at e registrar clique (não bloquear se falhar)
  // Fire and forget - não aguardar resultado
  supabase.rpc('update_number_last_used', { p_id: selectedNumber.id })
  supabase.rpc('insert_click', {
    p_company_id: group.company_id,
    p_group_id: group.id,
    p_number_id: selectedNumber.id,
    p_ip_address: ip,
    p_user_agent: userAgent,
    p_device_type: deviceType,
    p_referrer: referrer,
  })

  // Montar mensagem final
  const finalMessage = [group.default_message, selectedNumber.custom_message]
    .filter(Boolean)
    .join(' ')

  // Gerar link do WhatsApp e redirecionar
  const whatsappUrl = generateWhatsAppLink(selectedNumber.phone, finalMessage)
  console.log('[REDIRECT] Final WhatsApp URL:', whatsappUrl)
  
  redirect(whatsappUrl)
}

