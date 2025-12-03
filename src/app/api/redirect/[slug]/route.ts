import { NextRequest, NextResponse } from 'next/server'
import { createPublicSchemaClient } from '@/lib/supabase/server'
import { getDeviceType, generateWhatsAppLink } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getBaseUrl(request: NextRequest): string {
  try {
    const url = new URL(request.url)
    return `${url.protocol}//${url.host}`
  } catch {
    // Fallback se não conseguir construir URL
    return request.url.split('/api')[0] || 'https://linkflowsaas.vercel.app'
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  console.log('[REDIRECT] Request for slug:', slug)
  console.log('[REDIRECT] Request URL:', request.url)
  
  const baseUrl = getBaseUrl(request)
  console.log('[REDIRECT] Base URL:', baseUrl)
  
  // Verificar variáveis de ambiente
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[REDIRECT] Missing environment variables')
    return NextResponse.redirect(`${baseUrl}/error`)
  }
  
  try {
    const supabase = createPublicSchemaClient()
    console.log('[REDIRECT] Supabase client created')

    // Buscar grupo pelo slug usando view
    console.log('[REDIRECT] Fetching group...')
    const { data: group, error: groupError } = await supabase
      .from('groups_view')
      .select('id, name, default_message, is_active, company_id')
      .eq('slug', slug)
      .single()

    if (groupError) {
      console.error('[REDIRECT] Error fetching group:', JSON.stringify(groupError, null, 2))
      return NextResponse.redirect(`${baseUrl}/not-found`)
    }

    if (!group) {
      console.log('[REDIRECT] Group not found for slug:', slug)
      return NextResponse.redirect(`${baseUrl}/not-found`)
    }

    console.log('[REDIRECT] Group found:', { id: group.id, name: group.name, is_active: group.is_active })

    if (!group.is_active) {
      console.log('[REDIRECT] Group is inactive:', group.id)
      return NextResponse.redirect(`${baseUrl}/group-inactive`)
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

    if (numbersError) {
      console.error('[REDIRECT] Error fetching numbers:', JSON.stringify(numbersError, null, 2))
      return NextResponse.redirect(`${baseUrl}/no-numbers`)
    }

    console.log('[REDIRECT] Numbers found:', numbers?.length || 0)

    if (!numbers || numbers.length === 0) {
      console.log('[REDIRECT] No active numbers found for group:', group.id)
      return NextResponse.redirect(`${baseUrl}/no-numbers`)
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
    console.log('[REDIRECT] Redirecting to WhatsApp:', whatsappUrl)

    return NextResponse.redirect(whatsappUrl)
  } catch (error) {
    console.error('[REDIRECT] Unexpected error:', error)
    console.error('[REDIRECT] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    })
    return NextResponse.redirect(`${baseUrl}/error`)
  }
}

