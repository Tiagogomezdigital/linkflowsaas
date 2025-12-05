import nodemailer from 'nodemailer'
import { createAdminClient } from '@/lib/supabase/server'

let transporter: nodemailer.Transporter | null = null
let lastConfigHash: string = ''

interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from?: string
}

/**
 * Busca configurações SMTP do banco de dados
 */
export async function getSMTPConfig(): Promise<SMTPConfig | null> {
  try {
    const supabase = createAdminClient()
    const { data: settings, error } = await supabase
      .from('system_settings_view')
      .select('*')

    if (error) {
      console.error('Error fetching SMTP config:', error)
      return null
    }

    // Transformar array em objeto
    const settingsObj: Record<string, any> = {}
    settings?.forEach((setting: any) => {
      try {
        // Tentar fazer parse se for JSON
        settingsObj[setting.key] = typeof setting.value === 'string' 
          ? (setting.value.startsWith('{') || setting.value.startsWith('[') 
              ? JSON.parse(setting.value) 
              : setting.value)
          : setting.value
      } catch {
        settingsObj[setting.key] = setting.value
      }
    })

    // Buscar configurações de email (estrutura aninhada)
    const emailConfig = settingsObj.email || {}
    
    // Se não encontrar, tentar variáveis de ambiente
    const config: SMTPConfig = {
      host: emailConfig.smtpHost || process.env.SMTP_HOST || '',
      port: parseInt(emailConfig.smtpPort || process.env.SMTP_PORT || '587'),
      secure: emailConfig.smtpPort === '465' || process.env.SMTP_PORT === '465',
      auth: {
        user: emailConfig.smtpUser || process.env.SMTP_USER || '',
        pass: emailConfig.smtpPassword || process.env.SMTP_PASSWORD || '',
      },
      from: emailConfig.smtpFrom || process.env.SMTP_FROM,
    }

    // Validar se tem configurações mínimas
    if (!config.host || !config.auth.user || !config.auth.pass) {
      return null
    }

    return config
  } catch (error) {
    console.error('Error getting SMTP config:', error)
    return null
  }
}

/**
 * Inicializa o transporter do nodemailer com as configurações do banco
 */
async function initTransporter(): Promise<nodemailer.Transporter> {
  const config = await getSMTPConfig()
  
  if (!config) {
    throw new Error('Configurações SMTP não encontradas. Configure em /admin/configuracoes')
  }

  const configHash = JSON.stringify({
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
  })
  
  // Recriar transporter apenas se configuração mudou
  if (!transporter || lastConfigHash !== configHash) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure, // true para 465, false para outras portas
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    })
    lastConfigHash = configHash
  }

  return transporter
}

/**
 * Envia um email usando as configurações SMTP salvas
 */
export async function sendEmail(options: {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}): Promise<void> {
  const config = await getSMTPConfig()
  
  if (!config) {
    throw new Error('Configurações SMTP não encontradas')
  }

  const mailer = await initTransporter()

  await mailer.sendMail({
    from: options.from || config.from || config.auth.user,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || (options.html ? options.html.replace(/<[^>]*>/g, '') : undefined),
  })
}

/**
 * Testa a conexão SMTP com as credenciais fornecidas
 */
export async function testSMTPConnection(config: {
  host: string
  port: number | string
  secure?: boolean
  auth: {
    user: string
    pass: string
  }
}): Promise<{ success: boolean; message: string }> {
  try {
    const port = typeof config.port === 'string' ? parseInt(config.port) : config.port
    
    if (isNaN(port) || port <= 0 || port > 65535) {
      return {
        success: false,
        message: 'Porta SMTP inválida',
      }
    }

    const secure = config.secure !== undefined 
      ? config.secure 
      : port === 465 // SSL na porta 465

    const testTransporter = nodemailer.createTransport({
      host: config.host,
      port: port,
      secure: secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    })

    // Verificar conexão
    await testTransporter.verify()
    
    return {
      success: true,
      message: 'Conexão SMTP bem-sucedida! As credenciais estão corretas.',
    }
  } catch (error: any) {
    console.error('SMTP test error:', error)
    
    // Mensagens de erro mais amigáveis
    let message = 'Erro ao conectar ao servidor SMTP'
    
    if (error.code === 'EAUTH') {
      message = 'Credenciais inválidas. Verifique usuário e senha.'
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      message = `Não foi possível conectar ao servidor ${config.host}:${config.port}. Verifique o host e porta.`
    } else if (error.message) {
      message = error.message
    }
    
    return {
      success: false,
      message,
    }
  }
}

