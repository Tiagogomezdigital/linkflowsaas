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
 * Valida e corrige erros comuns no hostname SMTP
 */
function validateAndFixHostname(host: string): { host: string; warnings: string[] } {
  const warnings: string[] = []
  let fixedHost = host.trim().toLowerCase()
  
  // Correções comuns de digitação
  const commonMistakes: Record<string, string> = {
    'smpt.gmail.com': 'smtp.gmail.com',
    'smtp.gmai.com': 'smtp.gmail.com',
    'smtp.gmail.co': 'smtp.gmail.com',
    'smpt.outlook.com': 'smtp.outlook.com',
    'smpt.office365.com': 'smtp.office365.com',
  }
  
  if (commonMistakes[fixedHost]) {
    warnings.push(`Hostname corrigido de "${host}" para "${commonMistakes[fixedHost]}"`)
    fixedHost = commonMistakes[fixedHost]
  }
  
  // Validar formato básico
  if (!fixedHost.includes('.')) {
    warnings.push('Hostname parece inválido (não contém ponto)')
  }
  
  return { host: fixedHost, warnings }
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
}): Promise<{ success: boolean; message: string; warnings?: string[] }> {
  try {
    // Validar e corrigir hostname
    const { host: validatedHost, warnings } = validateAndFixHostname(config.host)
    
    const port = typeof config.port === 'string' ? parseInt(config.port) : config.port
    
    if (isNaN(port) || port <= 0 || port > 65535) {
      return {
        success: false,
        message: 'Porta SMTP inválida. Deve ser um número entre 1 e 65535',
        warnings,
      }
    }

    const secure = config.secure !== undefined 
      ? config.secure 
      : port === 465 // SSL na porta 465

    const testTransporter = nodemailer.createTransport({
      host: validatedHost,
      port: port,
      secure: secure,
      auth: {
        user: config.auth.user.trim(),
        pass: config.auth.pass,
      },
      // Timeout para evitar travamentos
      connectionTimeout: 10000, // 10 segundos
      greetingTimeout: 10000,
      socketTimeout: 10000,
    })

    // Verificar conexão
    await testTransporter.verify()
    
    let successMessage = 'Conexão SMTP bem-sucedida! As credenciais estão corretas.'
    if (warnings.length > 0) {
      successMessage += `\n\n⚠️ Avisos: ${warnings.join('; ')}`
    }
    
    return {
      success: true,
      message: successMessage,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  } catch (error: any) {
    console.error('SMTP test error:', error)
    
    // Validar hostname novamente para detectar erros de digitação
    const { host: validatedHost, warnings } = validateAndFixHostname(config.host)
    const allWarnings = [...warnings]
    
    // Mensagens de erro mais amigáveis
    let message = 'Erro ao conectar ao servidor SMTP'
    
    if (error.code === 'EAUTH') {
      message = 'Credenciais inválidas. Verifique usuário e senha.'
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      message = `Não foi possível conectar ao servidor ${validatedHost}:${config.port}. Verifique o host e porta.`
    } else if (error.code === 'EDNS' || error.code === 'ENOTFOUND' || error.errno === -16) {
      // Erro de DNS (hostname não encontrado)
      if (validatedHost !== config.host.trim().toLowerCase()) {
        message = `Hostname "${config.host}" não encontrado. Você quis dizer "${validatedHost}"? Verifique a digitação.`
        allWarnings.push(`Hostname original "${config.host}" pode estar incorreto`)
      } else {
        message = `Hostname "${validatedHost}" não encontrado. Verifique se está correto. Exemplos: smtp.gmail.com, smtp.outlook.com`
      }
    } else if (error.code === 'ECONNRESET') {
      message = `Conexão resetada pelo servidor ${validatedHost}. Verifique se a porta ${config.port} está correta.`
    } else if (error.message) {
      message = error.message
      // Adicionar sugestão se for erro de DNS
      if (error.message.includes('getaddrinfo') || error.message.includes('ENOTFOUND')) {
        message += `\n\n💡 Dica: Verifique se o hostname está correto. Exemplos:\n- Gmail: smtp.gmail.com\n- Outlook: smtp-mail.outlook.com\n- Office365: smtp.office365.com`
      }
    }
    
    return {
      success: false,
      message,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
    }
  }
}

