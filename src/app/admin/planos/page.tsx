'use client'

import { useState } from 'react'
import { 
  CreditCard, 
  Check, 
  X,
  Edit2,
  DollarSign,
  Users,
  Building2,
  Phone,
  Infinity
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

const planos = [
  {
    id: 'free',
    name: 'Free / Trial',
    price: 0,
    billingCycle: 'grátis',
    color: 'gray',
    features: {
      maxGroups: 3,
      maxLinksPerMonth: 100,
      maxTeamMembers: 1,
      analytics: 'Básico (7 dias)',
      support: 'Email',
      customDomain: false,
      apiAccess: false,
      whiteLabel: false,
    },
    empresas: 25,
    mrr: 0,
  },
  {
    id: 'monthly',
    name: 'Mensal',
    price: 97,
    billingCycle: '/mês',
    color: 'blue',
    features: {
      maxGroups: 10,
      maxLinksPerMonth: 1000,
      maxTeamMembers: 5,
      analytics: 'Completo (30 dias)',
      support: 'Email + Chat',
      customDomain: true,
      apiAccess: true,
      whiteLabel: false,
    },
    empresas: 0,
    mrr: 0,
  },
  {
    id: 'annual',
    name: 'Anual',
    price: 970,
    billingCycle: '/ano',
    color: 'lime',
    popular: true,
    features: {
      maxGroups: 50,
      maxLinksPerMonth: 10000,
      maxTeamMembers: 20,
      analytics: 'Avançado (90 dias)',
      support: 'Prioritário',
      customDomain: true,
      apiAccess: true,
      whiteLabel: true,
    },
    empresas: 1,
    mrr: 81,
  },
]

const featureLabels: Record<string, string> = {
  maxGroups: 'Grupos',
  maxLinksPerMonth: 'Links/Mês',
  maxTeamMembers: 'Membros',
  analytics: 'Analytics',
  support: 'Suporte',
  customDomain: 'Domínio Customizado',
  apiAccess: 'Acesso API',
  whiteLabel: 'White Label',
}

export default function PlanosPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const totalMRR = planos.reduce((acc, p) => acc + p.mrr, 0)
  const totalEmpresas = planos.reduce((acc, p) => acc + p.empresas, 0)

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      gray: 'border-gray-500/30 bg-gray-500/5',
      blue: 'border-blue-500/30 bg-blue-500/5',
      lime: 'border-lime-500/30 bg-lime-500/5',
      yellow: 'border-yellow-500/30 bg-yellow-500/5',
    }
    return colors[color] || colors.gray
  }

  const getTextColorClass = (color: string) => {
    const colors: Record<string, string> = {
      gray: 'text-gray-400',
      blue: 'text-blue-400',
      lime: 'text-lime-400',
      yellow: 'text-yellow-400',
    }
    return colors[color] || colors.gray
  }

  const getBgColorClass = (color: string) => {
    const colors: Record<string, string> = {
      gray: 'bg-gray-500',
      blue: 'bg-blue-500',
      lime: 'bg-lime-500',
      yellow: 'bg-yellow-500',
    }
    return colors[color] || colors.gray
  }

  return (
    <>
      <Header
        title="Planos"
        description="Configure e gerencie os planos da plataforma"
        actions={
          <Button variant="primary">
            + Novo Plano
          </Button>
        }
      />

      {/* Stats Rápidos */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="!p-4">
          <p className="text-sm text-text-secondary">MRR Total</p>
          <p className="text-2xl font-bold text-lime-400">R$ {totalMRR.toLocaleString('pt-BR')}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-text-secondary">Total Empresas</p>
          <p className="text-2xl font-bold text-white">{totalEmpresas}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-text-secondary">Ticket Médio</p>
          <p className="text-2xl font-bold text-white">
            R$ {Math.round(totalMRR / (totalEmpresas - planos[0].empresas)).toFixed(0)}
          </p>
        </Card>
      </div>

      {/* Cards de Planos */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {planos.map((plano) => (
          <div
            key={plano.id}
            className={`relative rounded-2xl border p-6 transition-all duration-200 ${getColorClass(plano.color)} ${
              selectedPlan === plano.id ? 'ring-2 ring-lime-500' : ''
            }`}
          >
            {plano.popular && (
              <Badge variant="success" className="absolute -top-2 right-4">
                Mais Popular
              </Badge>
            )}

            {/* Header */}
            <div className="mb-4">
              <h3 className={`text-xl font-bold ${getTextColorClass(plano.color)}`}>
                {plano.name}
              </h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-white">
                  {plano.price === 0 ? 'Grátis' : `R$ ${plano.price}`}
                </span>
                {plano.price > 0 && (
                  <span className="text-text-muted">{plano.billingCycle}</span>
                )}
              </div>
            </div>

            {/* Métricas */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-surface-border">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{plano.empresas}</p>
                <p className="text-xs text-text-muted">Empresas</p>
              </div>
              <div className="text-center">
                <p className={`text-lg font-bold ${getTextColorClass(plano.color)}`}>
                  R$ {plano.mrr}
                </p>
                <p className="text-xs text-text-muted">MRR</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Grupos</span>
                <span className="text-white font-medium">
                  {plano.features.maxGroups === -1 ? <Infinity className="w-4 h-4 inline" /> : plano.features.maxGroups}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Números/Grupo</span>
                <span className="text-white font-medium">
                  {plano.features.maxNumbersPerGroup === -1 ? <Infinity className="w-4 h-4 inline" /> : plano.features.maxNumbersPerGroup}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Total Números</span>
                <span className="text-white font-medium">
                  {plano.features.maxTotalNumbers === -1 ? <Infinity className="w-4 h-4 inline" /> : plano.features.maxTotalNumbers}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Domínio Custom</span>
                {plano.features.customDomain ? (
                  <Check className="w-4 h-4 text-lime-400" />
                ) : (
                  <X className="w-4 h-4 text-text-muted" />
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">API</span>
                {plano.features.apiAccess ? (
                  <Check className="w-4 h-4 text-lime-400" />
                ) : (
                  <X className="w-4 h-4 text-text-muted" />
                )}
              </div>
            </div>

            {/* Action */}
            <Button
              variant="outline"
              className="w-full"
              leftIcon={<Edit2 className="w-4 h-4" />}
              onClick={() => setSelectedPlan(plano.id)}
            >
              Editar Plano
            </Button>
          </div>
        ))}
      </div>

      {/* Tabela Comparativa */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-6">Comparativo de Recursos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Recurso</th>
                {planos.map((plano) => (
                  <th key={plano.id} className="text-center py-3 px-4">
                    <span className={`font-semibold ${getTextColorClass(plano.color)}`}>
                      {plano.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(featureLabels).map((feature) => (
                <tr key={feature} className="border-b border-surface-border">
                  <td className="py-3 px-4 text-sm text-text-secondary">
                    {featureLabels[feature]}
                  </td>
                  {planos.map((plano) => {
                    const value = plano.features[feature as keyof typeof plano.features]
                    return (
                      <td key={plano.id} className="py-3 px-4 text-center">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Check className="w-5 h-5 text-lime-400 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-text-muted mx-auto" />
                          )
                        ) : typeof value === 'number' ? (
                          <span className="text-white font-medium">
                            {value === -1 ? 'Ilimitado' : value}
                          </span>
                        ) : (
                          <span className="text-white text-sm">{value}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

