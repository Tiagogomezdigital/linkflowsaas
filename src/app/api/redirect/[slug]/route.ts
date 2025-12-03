import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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

function buildRedirectUrl(baseUrl: string, path: string, reason?: string) {
  try {
    const url = new URL(path, baseUrl)
    if (reason) {
      url.searchParams.set('reason', reason)
    }
    return url.toString()
  } catch {
    return `${baseUrl}${path}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const requestUrl = new URL(request.url)
  const { slug } = params
  console.log('[REDIRECT API] Request for slug:', slug)
  console.log('[REDIRECT API] Request URL:', request.url)
  
  const baseUrl = getBaseUrl(request)
  console.log('[REDIRECT API] Base URL:', baseUrl)
  const debugMode = requestUrl.searchParams.get('debug') === '1'
  
  if (!slug) {
    console.error('[REDIRECT API] No slug provided')
    if (debugMode) {
      return NextResponse.json({ error: 'missing-slug' }, { status: 400 })
    }
    return NextResponse.redirect(buildRedirectUrl(baseUrl, '/not-found', 'missing-slug'))
  }
  
  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('[REDIRECT API] Supabase URL exists:', !!supabaseUrl)
  console.log('[REDIRECT API] Supabase Key exists:', !!supabaseKey)
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('[REDIRECT API] Missing environment variables')
    if (debugMode) {
      return NextResponse.json(
        { error: 'missing-env', supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey },
        { status: 500 }
      )
    }
    return NextResponse.redirect(buildRedirectUrl(baseUrl, '/error', 'missing-env'))
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: 'public' }
    })
    console.log('[REDIRECT API] Supabase client created')

    // Buscar grupo pelo slug usando view
    console.log('[REDIRECT API] Fetching group for slug:', slug)
    const { data: group, error: groupError } = await supabase
      .from('groups_view')
      .select('id, name, default_message, is_active, company_id')
      .eq('slug', slug)
      .single()
    
    console.log('[REDIRECT API] Group query result:', { group: group?.id, error: groupError?.message })

    if (groupError) {
      console.error('[REDIRECT API] Error fetching group:', groupError)
      if (debugMode) {
        return NextResponse.json({ error: 'group-error', details: groupError }, { status: 404 })
      }
      return NextResponse.redirect(buildRedirectUrl(baseUrl, '/not-found', 'group-error'))
    }

    if (!group) {
      console.log('[REDIRECT API] Group not found for slug:', slug)
      if (debugMode) {
        return NextResponse.json({ error: 'group-not-found' }, { status: 404 })
      }
      return NextResponse.redirect(buildRedirectUrl(baseUrl, '/not-found', 'no-group'))
    }

    console.log('[REDIRECT API] Group found:', group.name, 'active:', group.is_active)

    if (!group.is_active) {
      if (debugMode) {
        return NextResponse.json({ error: 'group-inactive' }, { status: 400 })
      }
      return NextResponse.redirect(buildRedirectUrl(baseUrl, '/group-inactive', 'inactive-group'))
    }

    // Buscar próximo número ativo (round-robin) usando view
    console.log('[REDIRECT API] Fetching numbers for group:', group.id)
    const { data: numbers, error: numbersError } = await supabase
      .from('whatsapp_numbers_view')
      .select('id, phone, custom_message, last_used_at')
      .eq('group_id', group.id)
      .eq('is_active', true)
      .order('last_used_at', { ascending: true, nullsFirst: true })
      .limit(1)

    console.log('[REDIRECT API] Numbers query result:', { count: numbers?.length, error: numbersError?.message })

    if (numbersError || !numbers || numbers.length === 0) {
      console.log('[REDIRECT API] No numbers found')
      if (debugMode) {
        return NextResponse.json({ error: 'no-numbers', details: numbersError }, { status: 404 })
      }
      return NextResponse.redirect(buildRedirectUrl(baseUrl, '/no-numbers', 'no-numbers'))
    }

    const selectedNumber = numbers[0]
    console.log('[REDIRECT API] Selected number:', selectedNumber.phone)

    // Atualizar last_used_at e registrar clique (fire and forget)
    const userAgent = request.headers.get('user-agent') || ''
    const deviceType = getDeviceType(userAgent)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const referrer = request.headers.get('referer') || null

    // Não bloquear o redirect
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
    console.log('[REDIRECT API] Redirecting to:', whatsappUrl)

    return NextResponse.redirect(whatsappUrl, 302)
  } catch (error) {
    console.error('[REDIRECT API] Unexpected error:', error)
    if (debugMode) {
      return NextResponse.json(
        { error: 'unexpected', message: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      )
    }
    return NextResponse.redirect(buildRedirectUrl(baseUrl, '/error', 'unexpected'))
  }
}

