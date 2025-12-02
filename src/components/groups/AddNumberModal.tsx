'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { Group, WhatsAppNumber } from '@/types'

interface AddNumberModalProps {
  isOpen: boolean
  onClose: () => void
  group: Group | null
  onSubmit: (data: Partial<WhatsAppNumber>) => Promise<void>
  isLoading?: boolean
}

export default function AddNumberModal({ 
  isOpen, 
  onClose, 
  group,
  onSubmit,
  isLoading = false 
}: AddNumberModalProps) {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [customMessage, setCustomMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await onSubmit({
      phone: phone.replace(/\D/g, ''),
      name: name || undefined,
      custom_message: customMessage || undefined,
      group_id: group?.id,
      is_active: true,
    })

    // Reset form
    setPhone('')
    setName('')
    setCustomMessage('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar Número"
      description={`Adicionar número ao grupo "${group?.name}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Número WhatsApp"
          placeholder="Ex: 5511999999999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <p className="text-xs text-text-muted -mt-4">
          Inclua o código do país (55 para Brasil)
        </p>

        <Input
          label="Nome/Identificação (opcional)"
          placeholder="Ex: João - Vendas"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">
            Mensagem Customizada (opcional)
          </label>
          <textarea
            placeholder="Mensagem adicional específica para este número..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-surface border border-surface-border rounded-xl text-white placeholder-text-muted transition-all duration-200 focus:outline-none focus:border-lime-500/50 focus:ring-2 focus:ring-lime-500/20 resize-none"
          />
          <p className="text-xs text-text-muted">
            Esta mensagem será concatenada à mensagem padrão do grupo
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            isLoading={isLoading}
          >
            Adicionar Número
          </Button>
        </div>
      </form>
    </Modal>
  )
}

