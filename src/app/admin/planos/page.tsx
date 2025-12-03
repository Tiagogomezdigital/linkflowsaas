'use client'

import { useState, useEffect } from 'react'
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
import Modal from '@/components/ui/Modal'
import PlanForm from '@/components/admin/PlanForm'
import type { SubscriptionPlan } from '@/types'

interface PlanWithStats extends SubscriptionPlan {
  empresas: number
  mrr: number
}

const featureLabels: Record<string, string> = {
  maxGroups: 'Grupos',
  maxLinksPerMonth: 'Links/Mês',
  maxTeamMembers: 'Membros',
  customDomain: 'Domínio Customizado',
  apiAccess: 'Acesso API',
  whiteLabel: 'White Label',
}

export default function PlanosPage() {
  const [planos, setPlanos] = useState<PlanWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<PlanWithStats | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Buscar planos da API
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin/plans')
        if (response.ok) {
          const data = await response.json()
          setPlanos(data)
        }
      } catch (error) {
        console.error('Error fetching plans:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleCreatePlan = async (data: Partial<SubscriptionPlan>) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar plano')
      }

      // Recarregar planos
      const plansResponse = await fetch('/api/admin/plans')
      if (plansResponse.ok) {
        const plansData = await plansResponse.json()
        setPlanos(plansData)
      }

      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Error creating plan:', error)
      alert(error instanceof Error ? error.message : 'Erro ao criar plano')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditPlan = async (data: Partial<SubscriptionPlan>) => {
    if (!selectedPlan) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/plans/${selectedPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar plano')
      }

      // Recarregar planos
      const plansResponse = await fetch('/api/admin/plans')
      if (plansResponse.ok) {
        const plansData = await plansResponse.json()
        setPlanos(plansData)
      }

      setIsEditModalOpen(false)
      setSelectedPlan(null)
    } catch (error) {
      console.error('Error updating plan:', error)
      alert(error instanceof Error ? error.message : 'Erro ao atualizar plano')
    } finally {
      setIsSaving(false)
    }
  }

  const totalMRR = planos.reduce((acc, p) => acc + p.mrr, 0)
  const totalEmpresas = planos.reduce((acc, p) => acc + p.empresas, 0)

  const getColorClass = (billingCycle: string) => {
    const colors: Record<string, string> = {
      lifetime: 'border-gray-500/30 bg-gray-500/5',
      monthly: 'border-blue-500/30 bg-blue-500/5',
      yearly: 'border-lime-500/30 bg-lime-500/5',
    }
    return colors[billingCycle] || colors.lifetime
  }

  const getTextColorClass = (billingCycle: string) => {
    const colors: Record<string, string> = {
      lifetime: 'text-gray-400',
      monthly: 'text-blue-400',
      yearly: 'text-lime-400',
    }
    return colors[billingCycle] || colors.lifetime
  }

  const getBillingCycleLabel = (cycle: string) => {
    const labels: Record<string, string> = {
      lifetime: 'Grátis',
      monthly: '/mês',
      yearly: '/ano',
    }
    return labels[cycle] || ''
  }

  return (
    <>
      <Header
        title="Planos"
        description="Configure e gerencie os planos da plataforma"
        actions={
          <Button 
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
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
            R$ {totalEmpresas > 0 ? Math.round(totalMRR / totalEmpresas).toFixed(0) : '0'}
          </p>
        </Card>
      </div>

      {/* Cards de Planos */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Carregando planos...</p>
          </div>
        </div>
      ) : planos.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-text-muted">
            <p>Nenhum plano cadastrado</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Criar Primeiro Plano
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {planos.map((plano) => {
            const limits = plano.limits || {}
            const features = Array.isArray(plano.features) ? plano.features : []
            const price = plano.price_cents / 100
            
            return (
              <div
                key={plano.id}
                className={`relative rounded-2xl border p-6 transition-all duration-200 ${getColorClass(plano.billing_cycle)} ${
                  selectedPlan?.id === plano.id ? 'ring-2 ring-lime-500' : ''
                }`}
              >
                {/* Header */}
                <div className="mb-4">
                  <h3 className={`text-xl font-bold ${getTextColorClass(plano.billing_cycle)}`}>
                    {plano.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-white">
                      {price === 0 ? 'Grátis' : `R$ ${price.toLocaleString('pt-BR')}`}
                    </span>
                    {price > 0 && (
                      <span className="text-text-muted">{getBillingCycleLabel(plano.billing_cycle)}</span>
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
                    <p className={`text-lg font-bold ${getTextColorClass(plano.billing_cycle)}`}>
                      R$ {plano.mrr.toFixed(2)}
                    </p>
                    <p className="text-xs text-text-muted">MRR</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Grupos</span>
                    <span className="text-white font-medium">
                      {limits.maxGroups === -1 ? <Infinity className="w-4 h-4 inline" /> : limits.maxGroups || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Links/Mês</span>
                    <span className="text-white font-medium">
                      {limits.maxLinksPerMonth === -1 ? <Infinity className="w-4 h-4 inline" /> : (limits.maxLinksPerMonth || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Membros</span>
                    <span className="text-white font-medium">
                      {limits.maxTeamMembers === -1 ? <Infinity className="w-4 h-4 inline" /> : limits.maxTeamMembers || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Domínio Custom</span>
                    {features.includes('customDomain') ? (
                      <Check className="w-4 h-4 text-lime-400" />
                    ) : (
                      <X className="w-4 h-4 text-text-muted" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">API</span>
                    {features.includes('apiAccess') ? (
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
                  onClick={() => {
                    setSelectedPlan(plano)
                    setIsEditModalOpen(true)
                  }}
                >
                  Editar Plano
                </Button>
              </div>
            )
          })}
        </div>
      )}

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
                    <span className={`font-semibold ${getTextColorClass(plano.billing_cycle)}`}>
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
                    const limits = plano.limits || {}
                    const features = Array.isArray(plano.features) ? plano.features : []
                    
                    let value: any
                    if (feature === 'maxGroups') value = limits.maxGroups
                    else if (feature === 'maxLinksPerMonth') value = limits.maxLinksPerMonth
                    else if (feature === 'maxTeamMembers') value = limits.maxTeamMembers
                    else if (feature === 'customDomain') value = features.includes('customDomain')
                    else if (feature === 'apiAccess') value = features.includes('apiAccess')
                    else if (feature === 'whiteLabel') value = features.includes('whiteLabel')
                    else value = null

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
                            {value === -1 ? 'Ilimitado' : value.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-white text-sm">-</span>
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

      {/* Modal Criar Plano */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Plano"
        description="Crie um novo plano de assinatura"
        size="lg"
      >
        <PlanForm
          onSubmit={handleCreatePlan}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isSaving}
        />
      </Modal>

      {/* Modal Editar Plano */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedPlan(null)
        }}
        title="Editar Plano"
        description="Atualize as informações do plano"
        size="lg"
      >
        <PlanForm
          plan={selectedPlan}
          onSubmit={handleEditPlan}
          onCancel={() => {
            setIsEditModalOpen(false)
            setSelectedPlan(null)
          }}
          isLoading={isSaving}
        />
      </Modal>
    </>
  )
}

