import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getDeviceType, generateWhatsAppLink, formatPhone } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Esta rota retorna informações do grupo/número em JSON
// para ser usada pela página de transição animada
// O registro de clique é feito aqui para garantir que seja contado

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  
  if (!slug) {
    return NextResponse.json({ 
      success: false, 
      error: 'missing-slug',
      errorMessage: 'Link inválido'
    }, { status: 400 })
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ 
      success: false, 
      error: 'config-error',
      errorMessage: 'Erro de configuração do sistema'
    }, { status: 500 })
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: 'public' }
    })

    // Buscar grupo pelo slug
    const { data: group, error: groupError } = await supabase
      .from('groups_view')
      .select('id, name, default_message, is_active, company_id')
      .eq('slug', slug)
      .single()

    if (groupError || !group) {
      return NextResponse.json({ 
        success: false, 
        error: 'group-not-found',
        errorMessage: 'Link não encontrado'
      }, { status: 404 })
    }

    if (!group.is_active) {
      return NextResponse.json({ 
        success: false, 
        error: 'group-inactive',
        errorMessage: 'Este link está temporariamente indisponível'
      }, { status: 400 })
    }

    // Buscar próximo número ativo (round-robin)
    const { data: numbers, error: numbersError } = await supabase
      .from('whatsapp_numbers_view')
      .select('id, phone, name, custom_message, last_used_at')
      .eq('group_id', group.id)
      .eq('is_active', true)
      .order('last_used_at', { ascending: true, nullsFirst: true })
      .limit(1)

    if (numbersError || !numbers || numbers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'no-numbers',
        errorMessage: 'Nenhum atendente disponível no momento'
      }, { status: 404 })
    }

    const selectedNumber = numbers[0]

    // Registrar clique e atualizar last_used_at
    const userAgent = request.headers.get('user-agent') || ''
    const deviceType = getDeviceType(userAgent)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const referrer = request.headers.get('referer') || null

    // Executar RPCs em paralelo
    try {
      await Promise.allSettled([
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
      ])
    } catch (error) {
      console.error('[REDIRECT INFO] Error recording click:', error)
      // Continuar mesmo se houver erro ao registrar clique
    }

    // Montar mensagem final
    const finalMessage = [group.default_message, selectedNumber.custom_message]
      .filter(Boolean)
      .join(' ')

    // Gerar link do WhatsApp
    const whatsappUrl = generateWhatsAppLink(selectedNumber.phone, finalMessage)

    return NextResponse.json({
      success: true,
      group: {
        id: group.id,
        name: group.name,
      },
      number: {
        id: selectedNumber.id,
        phone: selectedNumber.phone,
        phoneFormatted: formatPhone(selectedNumber.phone),
        name: selectedNumber.name || 'Atendente',
      },
      whatsappUrl,
    })
  } catch (error) {
    console.error('[REDIRECT INFO] Unexpected error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'unexpected',
      errorMessage: 'Erro inesperado. Tente novamente.'
    }, { status: 500 })
  }
}

