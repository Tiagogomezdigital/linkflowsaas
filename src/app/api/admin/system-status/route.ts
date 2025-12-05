import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { getSMTPConfig, testSMTPConnection } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface ServiceStatus {
  name: string
  connected: boolean
  message: string
  latency?: number
}

export async function GET() {
  try {
    // Verificar se é admin
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error.error }, { status: auth.error.status })
    }

    const services: ServiceStatus[] = []

    // 1. Verificar Supabase
    const supabaseStart = Date.now()
    try {
      const supabase = createAdminClient()
      
      // Testar query simples
      const { data, error } = await supabase
        .from('companies_view')
        .select('id')
        .limit(1)

      const supabaseLatency = Date.now() - supabaseStart

      if (error) {
        services.push({
          name: 'Supabase',
          connected: false,
          message: `Erro: ${error.message}`,
        })
      } else {
        services.push({
          name: 'Supabase',
          connected: true,
          message: 'Conectado e funcionando',
          latency: supabaseLatency,
        })
      }
    } catch (error: any) {
      services.push({
        name: 'Supabase',
        connected: false,
        message: `Erro de conexão: ${error.message || 'Desconhecido'}`,
      })
    }

    // 2. Verificar Redis Cache (se configurado)
    // Por enquanto, verificamos apenas se há variável de ambiente
    const redisStart = Date.now()
    try {
      const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL
      
      if (redisUrl) {
        // Tentar fazer ping básico (se implementado)
        // Por enquanto, apenas verificamos se está configurado
        services.push({
          name: 'Redis Cache',
          connected: true,
          message: 'Configurado (não testado)',
          latency: Date.now() - redisStart,
        })
      } else {
        services.push({
          name: 'Redis Cache',
          connected: false,
          message: 'Não configurado (opcional)',
        })
      }
    } catch (error: any) {
      services.push({
        name: 'Redis Cache',
        connected: false,
        message: `Erro: ${error.message || 'Não disponível'}`,
      })
    }

    // 3. Verificar Email SMTP
    const smtpStart = Date.now()
    try {
      const smtpConfig = await getSMTPConfig()
      
      if (!smtpConfig) {
        services.push({
          name: 'Email (SMTP)',
          connected: false,
          message: 'Configurações SMTP não encontradas',
        })
      } else {
        // Testar conexão SMTP
        const testResult = await testSMTPConnection({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          auth: {
            user: smtpConfig.auth.user,
            pass: smtpConfig.auth.pass,
          },
        })

        const smtpLatency = Date.now() - smtpStart

        services.push({
          name: 'Email (SMTP)',
          connected: testResult.success,
          message: testResult.success 
            ? `Conectado (${smtpConfig.host}:${smtpConfig.port})`
            : testResult.message,
          latency: smtpLatency,
        })
      }
    } catch (error: any) {
      services.push({
        name: 'Email (SMTP)',
        connected: false,
        message: `Erro: ${error.message || 'Não foi possível verificar'}`,
      })
    }

    // Calcular status geral
    const allConnected = services.every(s => s.connected)
    const someConnected = services.some(s => s.connected)

    return NextResponse.json({
      services,
      overall: {
        status: allConnected ? 'healthy' : someConnected ? 'degraded' : 'down',
        connected: allConnected,
        total: services.length,
        connectedCount: services.filter(s => s.connected).length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error checking system status:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar status do sistema' },
      { status: 500 }
    )
  }
}

