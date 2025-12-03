'use client'

import { useState } from 'react'
import { 
  ExternalLink, 
  Copy, 
  Trash2, 
  Edit2, 
  Phone, 
  MousePointerClick, 
  Plus,
  BarChart3,
  Check
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { copyToClipboard } from '@/lib/utils'
import type { Group } from '@/types'

interface GroupCardProps {
  group: Group & {
    total_numbers?: number
    active_numbers?: number
    total_clicks?: number
  }
  onEdit?: (group: Group) => void
  onDelete?: (group: Group) => void
  onAddNumber?: (group: Group) => void
  onViewStats?: (group: Group) => void
}

export default function GroupCard({ 
  group, 
  onEdit, 
  onDelete, 
  onAddNumber,
  onViewStats 
}: GroupCardProps) {
  const [copied, setCopied] = useState(false)
  
  const publicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://linkflowsaas-alpha.vercel.app'}/l/${group.slug}`

  const handleCopy = async () => {
    await copyToClipboard(publicLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenLink = () => {
    window.open(publicLink, '_blank')
  }

  return (
    <div className="bg-surface rounded-2xl border border-surface-border p-5 transition-all duration-200 hover:border-lime-500/30 hover:shadow-lg hover:shadow-lime-500/5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-lg font-semibold text-white truncate">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-text-secondary mt-1 line-clamp-2">{group.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit?.(group)}
            className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4 text-text-muted" />
          </button>
          <button
            onClick={() => onDelete?.(group)}
            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4 text-text-muted hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant={group.is_active ? 'success' : 'danger'}>
          {group.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
        <Badge variant="outline">
          {group.active_numbers ?? 0} números
        </Badge>
      </div>

      {/* Slug */}
      <div className="mb-4">
        <Badge variant="outline" className="font-mono text-xs">
          Slug: {group.slug}
        </Badge>
      </div>

      {/* Link Público */}
      <div className="bg-background/50 rounded-xl p-3 mb-4 border border-surface-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-lime-400">Link Público</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
              title="Copiar"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-lime-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-text-muted" />
              )}
            </button>
            <button
              onClick={handleOpenLink}
              className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
              title="Abrir"
            >
              <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
            </button>
          </div>
        </div>
        <p className="text-xs text-text-muted truncate font-mono">{publicLink}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">Números Ativos</p>
            <p className="text-sm font-semibold text-white">{group.active_numbers ?? 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-text-muted" />
          <div>
            <p className="text-xs text-text-muted">Total Cliques</p>
            <p className="text-sm font-semibold text-white">{group.total_clicks ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          variant="primary" 
          size="sm" 
          className="flex-1"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => onAddNumber?.(group)}
        >
          Adicionar Número
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => onViewStats?.(group)}
        >
          <BarChart3 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

