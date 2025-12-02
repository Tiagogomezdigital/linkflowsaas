'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Zap, 
  ArrowRight, 
  Check, 
  Users, 
  BarChart3, 
  Shield,
  Smartphone,
  Globe,
  TrendingUp
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const features = [
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Rotação Inteligente',
    description: 'Distribua leads automaticamente entre seus números WhatsApp com rotação round-robin'
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Analytics Completo',
    description: 'Acompanhe cliques, conversões e desempenho por grupo e número em tempo real'
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Multi-tenant',
    description: 'Gerencie múltiplos grupos e números com isolamento completo de dados'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Seguro e Confiável',
    description: 'RLS, autenticação JWT e isolamento por empresa garantem máxima segurança'
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Links Curtos',
    description: 'Crie links personalizados e fáceis de compartilhar para cada grupo'
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Escalável',
    description: 'Suporte para milhares de cliques por mês com planos flexíveis'
  },
]

const planos = [
  {
    id: 'free',
    name: 'Free / Trial',
    price: 0,
    period: 'grátis',
    color: 'gray',
    features: [
      '3 grupos',
      '100 links/mês',
      '1 membro da equipe',
      'Analytics básico (7 dias)',
      'Suporte por email'
    ],
    popular: false,
  },
  {
    id: 'monthly',
    name: 'Mensal',
    price: 97,
    period: '/mês',
    color: 'blue',
    features: [
      '10 grupos',
      '1.000 links/mês',
      '5 membros da equipe',
      'Analytics completo (30 dias)',
      'Domínio customizado',
      'Acesso API',
      'Suporte prioritário'
    ],
    popular: false,
  },
  {
    id: 'annual',
    name: 'Anual',
    price: 970,
    period: '/ano',
    originalPrice: 1164,
    color: 'lime',
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
    popular: true,
  },
]

export default function HomePage() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 50)
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        isScrolled ? 'bg-surface/80 backdrop-blur-lg border-b border-surface-border' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-lime-500" />
            </div>
            <span className="text-xl font-bold text-white">LinkFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="text-text-secondary hover:text-white transition-colors"
            >
              Entrar
            </button>
            <Button
              onClick={() => router.push('/checkout')}
              variant="primary"
              size="sm"
            >
              Começar Agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 border border-lime-500/20 mb-8">
            <Zap className="w-4 h-4 text-lime-500" />
            <span className="text-sm text-lime-400">Distribuição Inteligente de Leads WhatsApp</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Distribua seus leads WhatsApp
            <span className="text-lime-500"> automaticamente</span>
          </h1>
          
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
            Rotação inteligente de números, analytics completo e links curtos personalizados. 
            Aumente sua capacidade de atendimento e conversão.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/checkout')}
              variant="primary"
              size="lg"
              className="text-lg px-8"
            >
              Começar Grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => router.push('/login')}
              variant="secondary"
              size="lg"
              className="text-lg px-8"
            >
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-surface/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tudo que você precisa para gerenciar seus leads
            </h2>
            <p className="text-text-secondary text-lg">
              Ferramentas poderosas para aumentar sua capacidade de atendimento
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:border-lime-500/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Planos que crescem com você
            </h2>
            <p className="text-text-secondary text-lg">
              Escolha o plano ideal para suas necessidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {planos.map((plano) => (
              <Card
                key={plano.id}
                className={`p-8 relative ${
                  plano.popular 
                    ? 'border-lime-500 border-2 scale-105' 
                    : 'border-surface-border'
                }`}
              >
                {plano.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-lime-500 text-white text-sm font-semibold">
                    Mais Popular
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plano.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      {plano.price === 0 ? 'Grátis' : `R$ ${plano.price}`}
                    </span>
                    {plano.price > 0 && (
                      <>
                        {plano.originalPrice && (
                          <span className="text-text-muted line-through">
                            R$ {plano.originalPrice}
                          </span>
                        )}
                        <span className="text-text-secondary">{plano.period}</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plano.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-lime-500 flex-shrink-0 mt-0.5" />
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => router.push(`/checkout?plan=${plano.id}`)}
                  variant={plano.popular ? 'primary' : 'secondary'}
                  className="w-full"
                >
                  {plano.price === 0 ? 'Começar Grátis' : 'Assinar Agora'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-lime-500/10 to-green-500/10 border-y border-lime-500/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para aumentar suas conversões?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Comece grátis e veja a diferença na distribuição dos seus leads
          </p>
          <Button
            onClick={() => router.push('/checkout')}
            variant="primary"
            size="lg"
            className="text-lg px-8"
          >
            Começar Agora
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-surface-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-lime-500/10 border border-lime-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-lime-500" />
              </div>
              <span className="text-lg font-bold text-white">LinkFlow</span>
            </div>
            <p className="text-text-muted text-sm">
              © 2025 LinkFlow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
