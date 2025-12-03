'use client'

import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import type { SubscriptionPlan } from '@/types'

interface PlanFormProps {
  plan?: SubscriptionPlan | null
  onSubmit: (data: Partial<SubscriptionPlan>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function PlanForm({ 
  plan, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: PlanFormProps) {
  const [name, setName] = useState(plan?.name || '')
  const [description, setDescription] = useState(plan?.description || '')
  const [price, setPrice] = useState(plan ? (plan.price_cents / 100).toString() : '0')
  const [billingCycle, setBillingCycle] = useState< 'monthly' | 'yearly' | 'lifetime'>(plan?.billing_cycle || 'monthly')
  const [isActive, setIsActive] = useState(plan?.is_active ?? true)
  const [sortOrder, setSortOrder] = useState(plan?.sort_order?.toString() || '0')
  
  // Features
  const [maxGroups, setMaxGroups] = useState(plan?.limits?.maxGroups?.toString() || '3')
  const [maxLinksPerMonth, setMaxLinksPerMonth] = useState(plan?.limits?.maxLinksPerMonth?.toString() || '100')
  const [maxTeamMembers, setMaxTeamMembers] = useState(plan?.limits?.maxTeamMembers?.toString() || '1')
  const [customDomain, setCustomDomain] = useState(plan?.features?.includes('customDomain') || false)
  const [apiAccess, setApiAccess] = useState(plan?.features?.includes('apiAccess') || false)
  const [whiteLabel, setWhiteLabel] = useState(plan?.features?.includes('whiteLabel') || false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const features: string[] = []
    if (customDomain) features.push('customDomain')
    if (apiAccess) features.push('apiAccess')
    if (whiteLabel) features.push('whiteLabel')

    const limits = {
      maxGroups: parseInt(maxGroups) || 0,
      maxLinksPerMonth: parseInt(maxLinksPerMonth) || 0,
      maxTeamMembers: parseInt(maxTeamMembers) || 0,
    }

    await onSubmit({
      name,
      description: description || undefined,
      price_cents: Math.round(parseFloat(price) * 100),
      billing_cycle: billingCycle,
      features,
      limits,
      is_active: isActive,
      sort_order: parseInt(sortOrder) || 0,
    })
  }

  const billingCycleOptions = [
    { value: 'monthly', label: 'Mensal' },
    { value: 'yearly', label: 'Anual' },
    { value: 'lifetime', label: 'Vitalício' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nome do Plano"
          placeholder="Ex: Mensal, Anual, Free"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Ordem de Exibição"
          type="number"
          placeholder="0"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Descrição
        </label>
        <textarea
          placeholder="Descrição do plano..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 bg-surface border border-surface-border rounded-xl text-white placeholder-text-muted transition-all duration-200 focus:outline-none focus:border-lime-500/50 focus:ring-2 focus:ring-lime-500/20 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Preço (R$)"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <Select
          label="Ciclo de Cobrança"
          options={billingCycleOptions}
          value={billingCycle}
          onChange={(e) => setBillingCycle(e.target.value as 'monthly' | 'yearly' | 'lifetime')}
          required
        />
      </div>

      <div className="border-t border-surface-border pt-4">
        <h4 className="text-sm font-semibold text-white mb-4">Limites</h4>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Máx. Grupos"
            type="number"
            min="0"
            placeholder="0"
            value={maxGroups}
            onChange={(e) => setMaxGroups(e.target.value)}
            required
          />
          <Input
            label="Máx. Links/Mês"
            type="number"
            min="0"
            placeholder="0"
            value={maxLinksPerMonth}
            onChange={(e) => setMaxLinksPerMonth(e.target.value)}
            required
          />
          <Input
            label="Máx. Membros"
            type="number"
            min="1"
            placeholder="1"
            value={maxTeamMembers}
            onChange={(e) => setMaxTeamMembers(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="border-t border-surface-border pt-4">
        <h4 className="text-sm font-semibold text-white mb-4">Recursos</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={customDomain}
              onChange={(e) => setCustomDomain(e.target.checked)}
              className="w-5 h-5 rounded border-surface-border bg-surface checked:bg-lime-500 checked:border-lime-500"
            />
            <span className="text-sm text-text-secondary">Domínio Customizado</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={apiAccess}
              onChange={(e) => setApiAccess(e.target.checked)}
              className="w-5 h-5 rounded border-surface-border bg-surface checked:bg-lime-500 checked:border-lime-500"
            />
            <span className="text-sm text-text-secondary">Acesso API</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={whiteLabel}
              onChange={(e) => setWhiteLabel(e.target.checked)}
              className="w-5 h-5 rounded border-surface-border bg-surface checked:bg-lime-500 checked:border-lime-500"
            />
            <span className="text-sm text-text-secondary">White Label</span>
          </label>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-5 h-5 rounded border-surface-border bg-surface checked:bg-lime-500 checked:border-lime-500"
        />
        <span className="text-sm text-text-secondary">Plano ativo</span>
      </label>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          isLoading={isLoading}
        >
          {plan ? 'Salvar Alterações' : 'Criar Plano'}
        </Button>
      </div>
    </form>
  )
}

