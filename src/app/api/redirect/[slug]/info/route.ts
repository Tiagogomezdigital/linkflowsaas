import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getDeviceType, generateWhatsAppLink, formatPhone } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

// Função para extrair browser do user-agent
function getBrowser(userAgent: string): string {
  if (!userAgent) return 'unknown'
  
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Edg/')) return 'Edge'
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera'
  if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'Internet Explorer'
  
  return 'other'
}

// Função para extrair OS do user-agent
function getOS(userAgent: string): string {
  if (!userAgent) return 'unknown'
  
  if (userAgent.includes('Windows')) return 'Windows'
  if (userAgent.includes('Mac OS') || userAgent.includes('Macintosh')) return 'macOS'
  if (userAgent.includes('Linux') && !userAgent.includes('Android')) return 'Linux'
  if (userAgent.includes('Android')) return 'Android'
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS'
  
  return 'other'
}

// Esta rota retorna informações do grupo/número em JSON
// para ser usada pela página de transição animada
// O registro de clique é feito aqui para garantir que seja contado

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const requestId = Math.random().toString(36).substring(7)
  const { slug } = params
  
  console.log(`[REDIRECT INFO ${requestId}] Nova requisição para slug: ${slug}`)
  
  if (!slug) {
    return NextResponse.json({ 
      success: false, 
      error: 'missing-slug',
      errorMessage: 'Link inválido'
    }, { status: 400 })
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ 
      success: false, 
      error: 'config-error',
      errorMessage: 'Erro de configuração do sistema'
    }, { status: 500 })
  }
  
  try {
    // Criar cliente Supabase fresco a cada requisição (sem cache)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'public' },
      global: {
        headers: {
          'x-request-id': requestId,
        },
      },
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
    const browser = getBrowser(userAgent)
    const os = getOS(userAgent)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const referrer = request.headers.get('referer') || null
    
    // Capturar parâmetros UTM da URL original
    const url = new URL(request.url)
    const utmSource = url.searchParams.get('utm_source') || null
    const utmMedium = url.searchParams.get('utm_medium') || null
    const utmCampaign = url.searchParams.get('utm_campaign') || null

    // Usar INSERT direto para garantir que não há cache
    console.log(`[REDIRECT INFO ${requestId}] Inserindo clique:`, {
      company_id: group.company_id,
      group_id: group.id,
      number_id: selectedNumber.id,
      device_type: deviceType,
      browser,
      os,
    })
    
    // INSERT direto na tabela clicks (usando view que aponta para redirect.clicks)
    const { data: clickData, error: clickError } = await supabase
      .from('clicks_view')
      .insert({
        company_id: group.company_id,
        group_id: group.id,
        number_id: selectedNumber.id,
        ip_address: ip,
        user_agent: userAgent,
        device_type: deviceType,
        referrer: referrer,
        browser: browser,
        os: os,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      })
      .select('id, created_at')
      .single()
    
    if (clickError) {
      console.error(`[REDIRECT INFO ${requestId}] Erro ao inserir clique:`, clickError)
    } else {
      console.log(`[REDIRECT INFO ${requestId}] Clique inserido com sucesso:`, clickData)
    }
    
    // Atualizar last_used_at do número
    const { error: updateError } = await supabase
      .from('whatsapp_numbers_view')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', selectedNumber.id)
    
    if (updateError) {
      console.error(`[REDIRECT INFO ${requestId}] Erro ao atualizar last_used:`, updateError)
    }

    // Montar mensagem final
    const finalMessage = [group.default_message, selectedNumber.custom_message]
      .filter(Boolean)
      .join(' ')

    // Gerar link do WhatsApp
    const whatsappUrl = generateWhatsAppLink(selectedNumber.phone, finalMessage)

    const response = NextResponse.json({
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
      _clickId: clickData?.id || null,
      _clickCreatedAt: clickData?.created_at || null,
      _requestId: requestId,
      _timestamp: new Date().toISOString(),
    })
    
    // Headers anti-cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('[REDIRECT INFO] Unexpected error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'unexpected',
      errorMessage: 'Erro inesperado. Tente novamente.'
    }, { status: 500 })
  }
}

