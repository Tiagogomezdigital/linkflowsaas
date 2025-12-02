'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap, Check, ArrowLeft, Lock, Mail, User, Building2, Globe } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const planos = [
  {
    id: 'free',
    name: 'Free / Trial',
    price: 0,
    period: 'grátis',
    features: [
      '3 grupos',
      '100 links/mês',
      '1 membro da equipe',
      'Analytics básico (7 dias)',
      'Suporte por email'
    ],
  },
  {
    id: 'monthly',
    name: 'Mensal',
    price: 97,
    period: '/mês',
    features: [
      '10 grupos',
      '1.000 links/mês',
      '5 membros da equipe',
      'Analytics completo (30 dias)',
      'Domínio customizado',
      'Acesso API',
      'Suporte prioritário'
    ],
  },
  {
    id: 'annual',
    name: 'Anual',
    price: 970,
    period: '/ano',
    originalPrice: 1164,
    features: [
      '50 grupos',
      '10.000 links/mês',
      '20 membros da equipe',
      'Analytics avançado (90 dias)',
      'Domínio customizado',
      'Acesso API',
      'White Label',
      'Suporte prioritário'
    ],
  },
]

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPlanId, setSelectedPlanId] = useState<string>('free')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Dados do formulário
  const [companyName, setCompanyName] = useState('')
  const [companySlug, setCompanySlug] = useState('')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const plan = searchParams.get('plan')
    if (plan && ['free', 'monthly', 'annual'].includes(plan)) {
      setSelectedPlanId(plan)
    }
  }, [searchParams])

  const selectedPlan = planos.find(p => p.id === selectedPlanId) || planos[0]

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleCompanyNameChange = (value: string) => {
    setCompanyName(value)
    if (!companySlug || companySlug === generateSlug(companyName)) {
      setCompanySlug(generateSlug(value))
    }
  }

  const validateForm = () => {
    if (!companyName.trim()) {
      setError('Nome da empresa é obrigatório')
      return false
    }
    if (!companySlug.trim()) {
      setError('Slug da empresa é obrigatório')
      return false
    }
    if (!/^[a-z0-9-]+$/.test(companySlug)) {
      setError('Slug deve conter apenas letras minúsculas, números e hífens')
      return false
    }
    if (!userName.trim()) {
      setError('Nome do usuário é obrigatório')
      return false
    }
    if (!userEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      setError('Email válido é obrigatório')
      return false
    }
    if (!password || password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      return false
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          company_slug: companySlug,
          user_name: userName,
          user_email: userEmail,
          password,
          plan_type: selectedPlanId === 'free' ? null : selectedPlanId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta')
      }

      // Se for plano pago, redirecionar para checkout do AbacatePay
      if (selectedPlanId !== 'free') {
        // TODO: Integrar com AbacatePay
        router.push(`/checkout/payment?company_id=${data.company_id}`)
      } else {
        // Plano grátis - fazer login automático
        router.push('/dashboard/grupos')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-surface-border bg-surface/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime-500/10 border border-lime-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-lime-500" />
            </div>
            <span className="text-lg font-bold text-white">LinkFlow</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Crie sua conta
              </h1>
              <p className="text-text-secondary">
                Preencha os dados abaixo para começar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados da Empresa */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-lime-500" />
                  <h2 className="text-lg font-semibold text-white">Dados da Empresa</h2>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Nome da Empresa"
                    placeholder="Minha Empresa"
                    value={companyName}
                    onChange={(e) => handleCompanyNameChange(e.target.value)}
                    leftIcon={<Building2 className="w-4 h-4" />}
                    required
                  />

                  <div>
                    <Input
                      label="Slug da Empresa"
                      placeholder="minha-empresa"
                      value={companySlug}
                      onChange={(e) => setCompanySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      leftIcon={<Globe className="w-4 h-4" />}
                      required
                      helperText="Usado na URL: seuapp.com/l/seu-slug"
                    />
                  </div>
                </div>
              </Card>

              {/* Dados do Usuário */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-lime-500" />
                  <h2 className="text-lg font-semibold text-white">Dados do Usuário</h2>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Nome Completo"
                    placeholder="João Silva"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    leftIcon={<User className="w-4 h-4" />}
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="seu@email.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" />}
                    required
                  />

                  <Input
                    label="Senha"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" />}
                    required
                    helperText="Mínimo de 6 caracteres"
                  />

                  <Input
                    label="Confirmar Senha"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" />}
                    required
                  />
                </div>
              </Card>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                {selectedPlanId === 'free' ? 'Criar Conta Grátis' : 'Continuar para Pagamento'}
              </Button>
            </form>
          </div>

          {/* Resumo do Plano */}
          <div className="lg:sticky lg:top-4 h-fit">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Resumo do Plano</h2>

              {/* Seleção de Plano */}
              <div className="space-y-3 mb-6">
                {planos.map((plano) => (
                  <button
                    key={plano.id}
                    onClick={() => setSelectedPlanId(plano.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedPlanId === plano.id
                        ? 'border-lime-500 bg-lime-500/10'
                        : 'border-surface-border hover:border-surface-border/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{plano.name}</span>
                      {selectedPlanId === plano.id && (
                        <Check className="w-5 h-5 text-lime-500" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        {plano.price === 0 ? 'Grátis' : `R$ ${plano.price}`}
                      </span>
                      {plano.price > 0 && (
                        <>
                          {plano.originalPrice && (
                            <span className="text-sm text-text-muted line-through">
                              R$ {plano.originalPrice}
                            </span>
                          )}
                          <span className="text-sm text-text-secondary">{plano.period}</span>
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Features do Plano Selecionado */}
              <div className="border-t border-surface-border pt-6">
                <h3 className="font-semibold text-white mb-4">Inclui:</h3>
                <ul className="space-y-2">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-lime-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Segurança */}
              <div className="mt-6 pt-6 border-t border-surface-border flex items-center gap-2 text-sm text-text-muted">
                <Lock className="w-4 h-4" />
                <span>Pagamento seguro e criptografado</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

