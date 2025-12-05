'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Globe, 
  Mail, 
  Bell, 
  Shield,
  Database,
  Webhook,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function ConfiguracoesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isTestingSMTP, setIsTestingSMTP] = useState(false)
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // Configurações gerais
  const [appName, setAppName] = useState('LinkFlow')
  const [appUrl, setAppUrl] = useState('https://linkflowsaas.vercel.app')
  const [supportEmail, setSupportEmail] = useState('suporte@linkflow.com')

  // Configurações de email
  const [smtpHost, setSmtpHost] = useState('smtp.resend.com')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPassword, setSmtpPassword] = useState('')
  const [smtpFrom, setSmtpFrom] = useState('noreply@linkflow.com')

  // Configurações de trial
  const [trialDays, setTrialDays] = useState('14')
  const [maxTrialGroups, setMaxTrialGroups] = useState('2')
  const [maxTrialNumbers, setMaxTrialNumbers] = useState('10')

  // Carregar configurações ao montar componente
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin/settings')
        if (response.ok) {
          const settings = await response.json()
          
          if (settings.general) {
            setAppName(settings.general.appName || 'LinkFlow')
            setAppUrl(settings.general.appUrl || 'https://linkflowsaas.vercel.app')
            setSupportEmail(settings.general.supportEmail || 'suporte@linkflow.com')
          }
          
          if (settings.email) {
            setSmtpHost(settings.email.smtpHost || 'smtp.resend.com')
            setSmtpPort(settings.email.smtpPort || '587')
            setSmtpUser(settings.email.smtpUser || '')
            setSmtpPassword(settings.email.smtpPassword || '')
            setSmtpFrom(settings.email.smtpFrom || 'noreply@linkflow.com')
          }
          
          if (settings.trial) {
            setTrialDays(settings.trial.trialDays?.toString() || '14')
            setMaxTrialGroups(settings.trial.maxTrialGroups?.toString() || '2')
            setMaxTrialNumbers(settings.trial.maxTrialNumbers?.toString() || '10')
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const settings = {
        general: {
          appName,
          appUrl,
          supportEmail,
        },
        email: {
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPassword,
          smtpFrom,
        },
        trial: {
          trialDays: parseInt(trialDays),
          maxTrialGroups: parseInt(maxTrialGroups),
          maxTrialNumbers: parseInt(maxTrialNumbers),
        },
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar configurações')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Erro ao salvar configurações. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Header
        title="Configurações"
        description="Configure as opções globais do sistema"
        actions={
          <Button
            variant="primary"
            leftIcon={isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        }
      />

      {saved && (
        <div className="mb-6 p-4 bg-lime-500/10 border border-lime-500/20 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-lime-400" />
          <span className="text-lime-400">Configurações salvas com sucesso!</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Configurações Gerais */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Configurações Gerais</h3>
              <p className="text-sm text-text-muted">Informações básicas da aplicação</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Nome da Aplicação"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
            <Input
              label="URL da Aplicação"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
            />
            <Input
              label="Email de Suporte"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </div>
        </Card>

        {/* Configurações de Email */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Configurações de Email</h3>
              <p className="text-sm text-text-muted">SMTP para envio de emails transacionais</p>
            </div>
            {smtpTestResult ? (
              <Badge 
                variant={smtpTestResult.success ? "success" : "danger"} 
                className="ml-auto"
              >
                {smtpTestResult.success ? "Conectado" : "Erro"}
              </Badge>
            ) : (
              <Badge variant="default" className="ml-auto">Não testado</Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input
              label="SMTP Host"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="smtp.gmail.com"
            />
            <Input
              label="SMTP Port"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              placeholder="587 ou 465"
            />
            <Input
              label="SMTP User (Email)"
              type="email"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="seu-email@gmail.com"
            />
            <Input
              label="SMTP Password"
              type="password"
              value={smtpPassword}
              onChange={(e) => setSmtpPassword(e.target.value)}
              placeholder="Senha de App do Gmail"
            />
            <Input
              label="Email Remetente"
              type="email"
              value={smtpFrom}
              onChange={(e) => setSmtpFrom(e.target.value)}
              placeholder="noreply@linkflow.com"
            />
          </div>

          <div className="mt-4 space-y-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
                  setSmtpTestResult({
                    success: false,
                    message: 'Preencha todos os campos SMTP antes de testar'
                  })
                  return
                }

                setIsTestingSMTP(true)
                setSmtpTestResult(null)

                try {
                  const response = await fetch('/api/admin/settings/test-smtp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      smtpHost,
                      smtpPort,
                      smtpUser,
                      smtpPassword,
                    }),
                  })

                  const data = await response.json()
                  
                  if (data.success) {
                    setSmtpTestResult({
                      success: true,
                      message: data.message || 'Conexão SMTP testada com sucesso!'
                    })
                  } else {
                    setSmtpTestResult({
                      success: false,
                      message: data.error || 'Falha ao testar conexão SMTP'
                    })
                  }
                } catch (error: any) {
                  console.error('Error testing SMTP:', error)
                  setSmtpTestResult({
                    success: false,
                    message: error.message || 'Erro ao testar conexão SMTP'
                  })
                } finally {
                  setIsTestingSMTP(false)
                }
              }}
              disabled={isTestingSMTP}
            >
              {isTestingSMTP ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Testando...
                </>
              ) : (
                'Testar Conexão'
              )}
            </Button>

            {smtpTestResult && (
              <div className={`p-3 rounded-lg flex items-start gap-3 ${
                smtpTestResult.success 
                  ? 'bg-lime-500/10 border border-lime-500/20' 
                  : 'bg-red-500/10 border border-red-500/20'
              }`}>
                {smtpTestResult.success ? (
                  <CheckCircle className="w-5 h-5 text-lime-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    smtpTestResult.success ? 'text-lime-400' : 'text-red-400'
                  }`}>
                    {smtpTestResult.success ? '✅ Sucesso' : '❌ Erro'}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {smtpTestResult.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Configurações de Trial */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-lime-500/10">
              <Shield className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Configurações de Trial</h3>
              <p className="text-sm text-text-muted">Limites do período de teste gratuito</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <Input
              label="Dias de Trial"
              type="number"
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
            />
            <Input
              label="Máx. Grupos (Trial)"
              type="number"
              value={maxTrialGroups}
              onChange={(e) => setMaxTrialGroups(e.target.value)}
            />
            <Input
              label="Máx. Números (Trial)"
              type="number"
              value={maxTrialNumbers}
              onChange={(e) => setMaxTrialNumbers(e.target.value)}
            />
          </div>
        </Card>

        {/* Status do Sistema */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Database className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Status do Sistema</h3>
              <p className="text-sm text-text-muted">Conexões e serviços</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-background/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Supabase</span>
                <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              </div>
              <Badge variant="success">Conectado</Badge>
            </div>
            <div className="p-4 bg-background/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Redis Cache</span>
                <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              </div>
              <Badge variant="success">Conectado</Badge>
            </div>
            <div className="p-4 bg-background/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Email (SMTP)</span>
                <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              </div>
              <Badge variant="success">Conectado</Badge>
            </div>
          </div>
        </Card>

        {/* Webhooks */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Webhook className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Webhooks</h3>
              <p className="text-sm text-text-muted">Integrações e notificações externas</p>
            </div>
            <Badge variant="default" className="ml-auto">Em breve</Badge>
          </div>

          <div className="p-8 text-center bg-background/50 rounded-xl">
            <Webhook className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">
              Webhooks estarão disponíveis em breve.
            </p>
            <p className="text-sm text-text-muted mt-2">
              Você poderá receber notificações de eventos como novos cadastros, upgrades de plano, etc.
            </p>
          </div>
        </Card>

        {/* Notificações */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Bell className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Notificações Admin</h3>
              <p className="text-sm text-text-muted">Receba alertas sobre eventos importantes</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-background/50 rounded-xl cursor-pointer">
              <div>
                <p className="text-white font-medium">Novos cadastros</p>
                <p className="text-sm text-text-muted">Receber email quando nova empresa se cadastrar</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-surface-border bg-surface"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-background/50 rounded-xl cursor-pointer">
              <div>
                <p className="text-white font-medium">Upgrades de plano</p>
                <p className="text-sm text-text-muted">Receber email quando empresa fizer upgrade</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-surface-border bg-surface"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-background/50 rounded-xl cursor-pointer">
              <div>
                <p className="text-white font-medium">Cancelamentos</p>
                <p className="text-sm text-text-muted">Receber email quando empresa cancelar</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-surface-border bg-surface"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-background/50 rounded-xl cursor-pointer">
              <div>
                <p className="text-white font-medium">Relatório semanal</p>
                <p className="text-sm text-text-muted">Receber resumo semanal de métricas</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-surface-border bg-surface"
              />
            </label>
          </div>
        </Card>
      </div>
    </>
  )
}

