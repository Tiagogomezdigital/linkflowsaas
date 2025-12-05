import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { testSMTPConnection } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Verificar se é admin
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error.error }, { status: auth.error.status })
    }

    const body = await request.json()
    const { smtpHost, smtpPort, smtpUser, smtpPassword } = body

    // Validação básica
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      return NextResponse.json(
        { error: 'Todos os campos SMTP são obrigatórios (Host, Port, User, Password)' },
        { status: 400 }
      )
    }

    // Validar porta
    const port = parseInt(smtpPort)
    if (isNaN(port) || port <= 0 || port > 65535) {
      return NextResponse.json(
        { error: 'Porta SMTP inválida. Deve ser um número entre 1 e 65535' },
        { status: 400 }
      )
    }

    // Testar conexão SMTP real
    const result = await testSMTPConnection({
      host: smtpHost.trim(),
      port: port,
      secure: port === 465, // SSL na porta 465
      auth: {
        user: smtpUser.trim(),
        pass: smtpPassword,
      },
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        warnings: result.warnings,
      })
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.message,
          warnings: result.warnings,
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error in POST /api/admin/settings/test-smtp:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Erro interno do servidor ao testar conexão SMTP' 
      },
      { status: 500 }
    )
  }
}

