'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, CheckCircle, MessageCircle, AlertCircle, RefreshCw, Users } from 'lucide-react'

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

const STEP_DURATION = 1500 // ms para cada etapa de animação

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
    // Timer para etapa 1 -> 2
    const timer1 = setTimeout(() => {
      setStep(2)
    }, STEP_DURATION)

    // Timer para etapa 2 -> 3 e buscar dados
    const timer2 = setTimeout(() => {
      setStep(3)
      fetchRedirectInfo()
    }, STEP_DURATION * 2)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [fetchRedirectInfo])

  // Auto-redirect quando tiver os dados
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
    
    // Reiniciar o fluxo
    setTimeout(() => setStep(2), STEP_DURATION)
    setTimeout(() => {
      setStep(3)
      fetchRedirectInfo()
    }, STEP_DURATION * 2)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-[#111827] rounded-3xl p-8 shadow-2xl border border-gray-800">
          
          {/* Etapa 1: Buscando Vaga */}
          {step === 1 && (
            <div className="text-center animate-fadeIn">
              {/* Ícone */}
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                <Search className="w-10 h-10 text-white" />
              </div>
              
              {/* Título */}
              <h1 className="text-2xl font-bold text-white mb-2">
                Buscando Vaga
              </h1>
              <p className="text-gray-400 mb-8">
                Procurando vaga disponível...
              </p>
              
              {/* Status */}
              <div className="bg-[#1f2937] rounded-2xl py-4 px-6 flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-500 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-gray-400 text-sm">Verificando disponibilidade</span>
              </div>
            </div>
          )}

          {/* Etapa 2: Vaga Encontrada */}
          {step === 2 && (
            <div className="text-center animate-fadeIn">
              {/* Ícone */}
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center animate-bounce-once">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              {/* Título */}
              <h1 className="text-2xl font-bold text-white mb-2">
                Vaga Encontrada!
              </h1>
              <p className="text-emerald-400 mb-8">
                Perfeito! Temos uma vaga para você
              </p>
              
              {/* Status */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl py-4 px-6 flex items-center justify-center gap-3">
                <Users className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">Vaga Confirmada</span>
              </div>
            </div>
          )}

          {/* Etapa 3: Redirecionando */}
          {step === 3 && status !== 'error' && (
            <div className="text-center animate-fadeIn">
              {/* Ícone */}
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              
              {/* Título */}
              <h1 className="text-2xl font-bold text-white mb-2">
                Redirecionando
              </h1>
              <p className="text-gray-400 mb-6">
                Conectando com WhatsApp...
              </p>
              
              {/* Número selecionado */}
              {redirectInfo?.number && (
                <div className="bg-[#1f2937] rounded-2xl p-4 mb-6">
                  <p className="text-xl font-mono text-white font-semibold">
                    {redirectInfo.number.phoneFormatted}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {redirectInfo.number.name}
                  </p>
                </div>
              )}
              
              {/* Loading ou Status */}
              {status === 'loading' ? (
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-5 h-5 border-2 border-gray-500 border-t-emerald-500 rounded-full animate-spin" />
                  <span className="text-gray-400 text-sm">Conectando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 text-sm">Pronto!</span>
                </div>
              )}
              
              {/* Botão de ação */}
              <button
                onClick={handleManualRedirect}
                disabled={!redirectInfo?.whatsappUrl}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {redirectInfo?.whatsappUrl ? 'Ir para WhatsApp Agora' : 'Aguarde...'}
              </button>
            </div>
          )}

          {/* Estado de Erro */}
          {step === 3 && status === 'error' && (
            <div className="text-center animate-fadeIn">
              {/* Ícone */}
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              
              {/* Título */}
              <h1 className="text-2xl font-bold text-white mb-2">
                Ops! Algo deu errado
              </h1>
              <p className="text-gray-400 mb-8">
                {errorMessage}
              </p>
              
              {/* Botão de retry */}
              <button
                onClick={handleRetry}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Tentar Novamente
              </button>
            </div>
          )}
        </div>

        {/* Progress Indicators */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
            step >= 1 ? 'bg-emerald-500' : 'bg-gray-600'
          }`} />
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
            step >= 2 ? 'bg-emerald-500' : 'bg-gray-600'
          }`} />
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
            step >= 3 ? 'bg-emerald-500' : 'bg-gray-600'
          }`} />
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Powered by LinkFlow
        </p>
      </div>

      {/* Estilos de animação */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounceOnce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        
        .animate-bounce-once {
          animation: bounceOnce 0.5s ease-out;
        }
      `}</style>
    </main>
  )
}
