'use client'

import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { slugify } from '@/lib/utils'
import type { Group } from '@/types'

interface GroupFormProps {
  group?: Group | null
  onSubmit: (data: Partial<Group>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function GroupForm({ 
  group, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: GroupFormProps) {
  const [name, setName] = useState(group?.name || '')
  const [slug, setSlug] = useState(group?.slug || '')
  const [description, setDescription] = useState(group?.description || '')
  const [defaultMessage, setDefaultMessage] = useState(group?.default_message || '')
  const [isActive, setIsActive] = useState(group?.is_active ?? true)
  const [autoSlug, setAutoSlug] = useState(!group)

  useEffect(() => {
    if (autoSlug && name) {
      setSlug(slugify(name))
    }
  }, [name, autoSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await onSubmit({
      name,
      slug,
      description: description || undefined,
      default_message: defaultMessage || undefined,
      is_active: isActive,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Nome do Grupo"
        placeholder="Ex: Vendas, Suporte, Marketing..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-text-secondary">
            Slug (URL)
          </label>
          {!group && (
            <label className="flex items-center gap-2 text-xs text-text-muted">
              <input
                type="checkbox"
                checked={autoSlug}
                onChange={(e) => setAutoSlug(e.target.checked)}
                className="rounded border-surface-border bg-surface"
              />
              Gerar automaticamente
            </label>
          )}
        </div>
        <Input
          placeholder="meu-grupo"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
            setAutoSlug(false)
          }}
          disabled={group !== undefined && group !== null}
          required
        />
        <p className="text-xs text-text-muted">
          URL do link: /l/{slug || 'meu-grupo'}
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-secondary">
          Descrição (opcional)
        </label>
        <textarea
          placeholder="Descrição do grupo..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 bg-surface border border-surface-border rounded-xl text-white placeholder-text-muted transition-all duration-200 focus:outline-none focus:border-lime-500/50 focus:ring-2 focus:ring-lime-500/20 resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-secondary">
          Mensagem Padrão (opcional)
        </label>
        <textarea
          placeholder="Olá! Vi seu link e gostaria de mais informações..."
          value={defaultMessage}
          onChange={(e) => setDefaultMessage(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 bg-surface border border-surface-border rounded-xl text-white placeholder-text-muted transition-all duration-200 focus:outline-none focus:border-lime-500/50 focus:ring-2 focus:ring-lime-500/20 resize-none"
        />
        <p className="text-xs text-text-muted">
          Esta mensagem será preenchida automaticamente no WhatsApp
        </p>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-5 h-5 rounded border-surface-border bg-surface checked:bg-lime-500 checked:border-lime-500"
        />
        <span className="text-sm text-text-secondary">Grupo ativo</span>
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
          {group ? 'Salvar Alterações' : 'Criar Grupo'}
        </Button>
      </div>
    </form>
  )
}

