'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, CheckCircle, MessageCircle, AlertCircle, RefreshCw, Users, Zap } from 'lucide-react'

type Step = 1 | 2 | 3
type Status = 'loading' | 'success' | 'error'

interface NumberInfo {
  phone: string
  phoneFormatted: string
  name: string
}

interface RedirectInfo {
  success: boolean
  error?: string
  errorMessage?: string
  group?: {
    id: string
    name: string
  }
  number?: NumberInfo
  whatsappUrl?: string
}

const STEP_DURATION = 1500

export default function PublicRedirectPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  
  const [step, setStep] = useState<Step>(1)
  const [status, setStatus] = useState<Status>('loading')
  const [redirectInfo, setRedirectInfo] = useState<RedirectInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const fetchRedirectInfo = useCallback(async () => {
    try {
      const response = await fetch(`/api/redirect/${slug}/info`, {
        cache: 'no-store',
      })
      const data: RedirectInfo = await response.json()
      
      if (data.success && data.whatsappUrl) {
        setRedirectInfo(data)
        setStatus('success')
      } else {
        setErrorMessage(data.errorMessage || 'Erro ao buscar informações')
        setStatus('error')
      }
    } catch (error) {
      console.error('Error fetching redirect info:', error)
      setErrorMessage('Erro de conexão. Tente novamente.')
      setStatus('error')
    }
  }, [slug])

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(2), STEP_DURATION)
    const timer2 = setTimeout(() => {
      setStep(3)
      fetchRedirectInfo()
    }, STEP_DURATION * 2)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [fetchRedirectInfo])

  useEffect(() => {
    if (step === 3 && status === 'success' && redirectInfo?.whatsappUrl) {
      const redirectTimer = setTimeout(() => {
        window.location.href = redirectInfo.whatsappUrl!
      }, 1500)
      return () => clearTimeout(redirectTimer)
    }
  }, [step, status, redirectInfo])

  const handleManualRedirect = () => {
    if (redirectInfo?.whatsappUrl) {
      window.location.href = redirectInfo.whatsappUrl
    }
  }

  const handleRetry = () => {
    setStep(1)
    setStatus('loading')
    setErrorMessage('')
    setRedirectInfo(null)
    
    setTimeout(() => setStep(2), STEP_DURATION)
    setTimeout(() => {
      setStep(3)
      fetchRedirectInfo()
    }, STEP_DURATION * 2)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background gradient sutil */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative w-full max-w-md z-10">
        {/* Logo/Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-lime-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold text-white">LinkFlow</span>
        </div>

        {/* Card Principal */}
        <div className="bg-surface rounded-2xl p-8 border border-surface-border shadow-2xl shadow-black/50">
          
          {/* Etapa 1: Buscando Vaga */}
          {step === 1 && (
            <div className="text-center animate-fade-in">
              {/* Ícone */}
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-lime-500/10 border border-lime-500/30 flex items-center justify-center animate-pulse">
                <Search className="w-10 h-10 text-lime-400" />
              </div>
              
              {/* Título */}
              <h1 className="text-2xl font-bold text-white mb-2">
                Buscando Vaga
              </h1>
              <p className="text-text-secondary mb-8">
                Procurando vaga disponível...
              </p>
              
              {/* Status */}
              <div className="bg-background rounded-xl py-4 px-6 border border-surface-border flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-surface-border border-t-lime-500 rounded-full animate-spin" />
                <span className="text-text-muted text-sm">Verificando disponibilidade</span>
              </div>
            </div>
          )}

          {/* Etapa 2: Vaga Encontrada */}
          {step === 2 && (
            <div className="text-center animate-fade-in">
              {/* Ícone */}
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-lime-500 flex items-center justify-center animate-glow">
                <CheckCircle className="w-10 h-10 text-black" />
              </div>
              
              {/* Título */}
              <h1 className="text-2xl font-bold text-white mb-2">
                Vaga Encontrada!
              </h1>
              <p className="text-lime-400 mb-8">
                Perfeito! Temos uma vaga para você
              </p>
              
              {/* Status */}
              <div className="bg-lime-500/10 border border-lime-500/30 rounded-xl py-4 px-6 flex items-center justify-center gap-3">
                <Users className="w-5 h-5 text-lime-400" />
                <span className="text-lime-400 text-sm font-medium">Vaga Confirmada</span>
              </div>
            </div>
          )}

          {/* Etapa 3: Redirecionando */}
          {step === 3 && status !== 'error' && (
            <div className="text-center animate-fade-in">
              {/* Ícone */}
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-lime-500 flex items-center justify-center animate-glow">
                <MessageCircle className="w-10 h-10 text-black" />
              </div>
              
              {/* Título */}
              <h1 className="text-2xl font-bold text-white mb-2">
                Redirecionando
              </h1>
              <p className="text-text-secondary mb-6">
                Conectando com WhatsApp...
              </p>
              
              {/* Número selecionado */}
              {redirectInfo?.number && (
                <div className="bg-background rounded-xl p-4 mb-6 border border-surface-border">
                  <p className="text-xl font-mono text-white font-semibold tracking-wide">
                    {redirectInfo.number.phoneFormatted}
                  </p>
                  <p className="text-text-muted text-sm mt-1">
                    {redirectInfo.number.name}
                  </p>
                </div>
              )}
              
              {/* Loading ou Status */}
              {status === 'loading' ? (
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-5 h-5 border-2 border-surface-border border-t-lime-500 rounded-full animate-spin" />
                  <span className="text-text-muted text-sm">Conectando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <CheckCircle className="w-5 h-5 text-lime-400" />
                  <span className="text-lime-400 text-sm font-medium">Pronto!</span>
                </div>
              )}
              
              {/* Botão de ação */}
              <button
                onClick={handleManualRedirect}
                disabled={!redirectInfo?.whatsappUrl}
                className="w-full bg-lime-500 hover:bg-lime-400 disabled:bg-surface-hover disabled:text-text-muted disabled:cursor-not-allowed text-black font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {redirectInfo?.whatsappUrl ? 'Ir para WhatsApp Agora' : 'Aguarde...'}
              </button>
            </div>
          )}

          {/* Estado de Erro */}
          {step === 3 && status === 'error' && (
            <div className="text-center animate-fade-in">
              {/* Ícone */}
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              
              {/* Título */}
              <h1 className="text-2xl font-bold text-white mb-2">
                Ops! Algo deu errado
              </h1>
              <p className="text-text-secondary mb-8">
                {errorMessage}
              </p>
              
              {/* Botão de retry */}
              <button
                onClick={handleRetry}
                className="w-full bg-surface-hover hover:bg-surface-border text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-surface-border"
              >
                <RefreshCw className="w-5 h-5" />
                Tentar Novamente
              </button>
            </div>
          )}
        </div>

        {/* Progress Indicators */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className={`h-1.5 rounded-full transition-all duration-500 ${
            step >= 1 ? 'bg-lime-500 w-8' : 'bg-surface-border w-4'
          }`} />
          <div className={`h-1.5 rounded-full transition-all duration-500 ${
            step >= 2 ? 'bg-lime-500 w-8' : 'bg-surface-border w-4'
          }`} />
          <div className={`h-1.5 rounded-full transition-all duration-500 ${
            step >= 3 ? 'bg-lime-500 w-8' : 'bg-surface-border w-4'
          }`} />
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-xs mt-6">
          Powered by <span className="text-lime-500 font-medium">LinkFlow</span>
        </p>
      </div>
    </main>
  )
}
