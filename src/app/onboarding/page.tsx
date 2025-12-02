'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Check, ArrowRight, Users, Phone, BarChart3 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

const steps = [
  {
    id: 1,
    title: 'Criar seu primeiro grupo',
    description: 'Organize seus números WhatsApp em grupos',
    icon: <Users className="w-6 h-6" />,
  },
  {
    id: 2,
    title: 'Adicionar números',
    description: 'Configure os números que receberão os leads',
    icon: <Phone className="w-6 h-6" />,
  },
  {
    id: 3,
    title: 'Compartilhar link',
    description: 'Use seu link público para distribuir leads',
    icon: <BarChart3 className="w-6 h-6" />,
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [groupName, setGroupName] = useState('')
  const [groupSlug, setGroupSlug] = useState('')
  const [groupMessage, setGroupMessage] = useState('Olá! Vim através do link.')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !groupSlug.trim()) {
      setError('Preencha todos os campos')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          slug: groupSlug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
          default_message: groupMessage,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao criar grupo')
      }

      // Próximo passo
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1)
      } else {
        router.push('/dashboard/grupos')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar grupo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/dashboard/grupos')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-lime-500/10 border border-lime-500/20 mb-4">
            <Zap className="w-8 h-8 text-lime-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo ao LinkFlow!
          </h1>
          <p className="text-text-secondary">
            Vamos configurar sua conta em poucos passos
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep >= step.id
                      ? 'bg-lime-500 border-lime-500 text-white'
                      : 'bg-surface border-surface-border text-text-muted'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium text-white">{step.title}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    currentStep > step.id ? 'bg-lime-500' : 'bg-surface-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <Card className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Criar seu primeiro grupo
                </h2>
                <p className="text-text-secondary">
                  Grupos organizam seus números WhatsApp por departamento ou campanha
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Nome do Grupo"
                  placeholder="Ex: Vendas, Suporte, Marketing"
                  value={groupName}
                  onChange={(e) => {
                    setGroupName(e.target.value)
                    if (!groupSlug || groupSlug === groupSlug.toLowerCase().replace(/[^a-z0-9-]/g, '')) {
                      setGroupSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                    }
                  }}
                  leftIcon={<Users className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Slug do Grupo"
                  placeholder="vendas"
                  value={groupSlug}
                  onChange={(e) => setGroupSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  helperText="Usado no link: seuapp.com/l/seu-slug"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Mensagem Padrão
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-surface border border-surface-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    placeholder="Mensagem que será enviada ao abrir o WhatsApp"
                    value={groupMessage}
                    onChange={(e) => setGroupMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleSkip}
                  variant="secondary"
                  className="flex-1"
                >
                  Pular
                </Button>
                <Button
                  onClick={handleCreateGroup}
                  variant="primary"
                  className="flex-1"
                  isLoading={isLoading}
                >
                  Criar Grupo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-lime-500/10 border border-lime-500/20 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-lime-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Adicione números ao grupo
              </h2>
              <p className="text-text-secondary mb-6">
                Agora você pode adicionar números WhatsApp ao grupo que acabou de criar.
                Vá para a página de Números para configurar.
              </p>
              <Button
                onClick={() => router.push('/dashboard/numeros')}
                variant="primary"
                className="w-full"
              >
                Ir para Números
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                variant="secondary"
                className="w-full"
              >
                Continuar
              </Button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-lime-500/10 border border-lime-500/20 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-lime-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Pronto! Você está configurado
              </h2>
              <p className="text-text-secondary mb-6">
                Seu link público está pronto para ser compartilhado. 
                Acompanhe as estatísticas no dashboard.
              </p>
              <div className="p-4 bg-surface rounded-xl border border-surface-border">
                <p className="text-sm text-text-muted mb-2">Seu link público:</p>
                <p className="text-lime-400 font-mono break-all">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/l/{groupSlug || 'seu-grupo'}
                </p>
              </div>
              <Button
                onClick={() => router.push('/dashboard/grupos')}
                variant="primary"
                className="w-full"
              >
                Ir para Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

