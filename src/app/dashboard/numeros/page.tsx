'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Edit2, 
  Trash2,
  ExternalLink,
  MoreVertical
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { formatPhone, generateWhatsAppLink } from '@/lib/utils'
import type { WhatsAppNumber, Group } from '@/types'

interface NumberFormData {
  phone: string
  name: string
  custom_message: string
  group_id: string
  is_active: boolean
}

export default function NumerosPage() {
  const [numbers, setNumbers] = useState<(WhatsAppNumber & { group?: Group })[]>([])
  const [filteredNumbers, setFilteredNumbers] = useState<(WhatsAppNumber & { group?: Group })[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedNumber, setSelectedNumber] = useState<WhatsAppNumber | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<NumberFormData>({
    phone: '',
    name: '',
    custom_message: '',
    group_id: '',
    is_active: true,
  })

  // Buscar grupos e números da API
  useEffect(() => {
    const fetchData = async () => {
      setIsInitialLoading(true)
      try {
        // Buscar grupos
        const groupsResponse = await fetch('/api/groups')
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          setGroups(groupsData)
        }

        // Buscar números
        const numbersResponse = await fetch('/api/numbers')
        if (numbersResponse.ok) {
          const numbersData = await numbersResponse.json()
          setNumbers(numbersData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter numbers
  useEffect(() => {
    let result = [...numbers]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (n) =>
          n.phone.includes(query) ||
          n.name?.toLowerCase().includes(query) ||
          n.group?.name.toLowerCase().includes(query)
      )
    }
    
    if (filterGroup) {
      result = result.filter((n) => n.group_id === filterGroup)
    }
    
    if (filterStatus) {
      result = result.filter((n) => 
        filterStatus === 'active' ? n.is_active : !n.is_active
      )
    }
    
    setFilteredNumbers(result)
  }, [searchQuery, filterGroup, filterStatus, numbers])

  const handleClearFilters = () => {
    setSearchQuery('')
    setFilterGroup('')
    setFilterStatus('')
  }

  const resetForm = () => {
    setFormData({
      phone: '',
      name: '',
      custom_message: '',
      group_id: '',
      is_active: true,
    })
  }

  const handleAddNumber = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao adicionar número')
      }

      // Recarregar números
      const numbersResponse = await fetch('/api/numbers')
      if (numbersResponse.ok) {
        const numbersData = await numbersResponse.json()
        setNumbers(numbersData)
      }
      
      setIsAddModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error adding number:', error)
      alert(error instanceof Error ? error.message : 'Erro ao adicionar número')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditNumber = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedNumber) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/numbers/${selectedNumber.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar número')
      }

      // Recarregar números
      const numbersResponse = await fetch('/api/numbers')
      if (numbersResponse.ok) {
        const numbersData = await numbersResponse.json()
        setNumbers(numbersData)
      }
      
      setIsEditModalOpen(false)
      setSelectedNumber(null)
      resetForm()
    } catch (error) {
      console.error('Error updating number:', error)
      alert(error instanceof Error ? error.message : 'Erro ao atualizar número')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNumber = async (number: WhatsAppNumber) => {
    if (!confirm(`Tem certeza que deseja excluir o número ${formatPhone(number.phone)}?`)) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/numbers/${number.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir número')
      }

      // Recarregar números
      const numbersResponse = await fetch('/api/numbers')
      if (numbersResponse.ok) {
        const numbersData = await numbersResponse.json()
        setNumbers(numbersData)
      }
    } catch (error) {
      console.error('Error deleting number:', error)
      alert(error instanceof Error ? error.message : 'Erro ao excluir número')
    } finally {
      setIsLoading(false)
    }
  }

  const openEditModal = (number: WhatsAppNumber & { group?: Group }) => {
    setSelectedNumber(number)
    setFormData({
      phone: number.phone,
      name: number.name || '',
      custom_message: number.custom_message || '',
      group_id: number.group_id,
      is_active: number.is_active,
    })
    setIsEditModalOpen(true)
  }

  const groupOptions = [
    { value: '', label: 'Todos os grupos' },
    ...groups.map((g) => ({ value: g.id, label: g.name })),
  ]

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
  ]

  return (
    <>
      <Header
        title="Números"
        description="Gestão de números de WhatsApp"
        breadcrumbs={[{ label: 'Números' }]}
        actions={
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary"
              onClick={() => {
                // Redirecionar para página de grupos onde pode gerenciar números por grupo
                window.location.href = '/dashboard/grupos'
              }}
            >
              Gerenciar por Grupo
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Adicionar Número
            </Button>
          </div>
        }
      />

      <Card>
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Phone className="w-6 h-6 text-lime-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">
                Números WhatsApp ({filteredNumbers.length})
              </h2>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar número, nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-48">
              <Select
                options={groupOptions}
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Select
                options={statusOptions}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={handleClearFilters}
            >
              Limpar Filtros
            </Button>
          </div>

          {/* Table or Empty State */}
          {isInitialLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-secondary">Carregando números...</p>
              </div>
            </div>
          ) : filteredNumbers.length === 0 ? (
            <EmptyState
              icon={<Phone className="w-8 h-8" />}
              title="Nenhum número cadastrado"
              description="Comece adicionando números de WhatsApp nos grupos."
              action={
                <Button
                  variant="primary"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Adicionar Número
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Número</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Grupo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Cliques</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNumbers.map((number) => (
                    <tr key={number.id} className="border-b border-surface-border hover:bg-surface-hover transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-text-muted" />
                          <span className="font-mono text-white">{formatPhone(number.phone)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {number.name || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" size="sm">
                          {number.group?.name || 'Sem grupo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={number.is_active ? 'success' : 'danger'} size="sm">
                          {number.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {number.click_count || 0}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => window.open(generateWhatsAppLink(number.phone), '_blank')}
                            className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                            title="Abrir WhatsApp"
                          >
                            <ExternalLink className="w-4 h-4 text-text-muted" />
                          </button>
                          <button
                            onClick={() => openEditModal(number)}
                            className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4 text-text-muted" />
                          </button>
                          <button
                            onClick={() => handleDeleteNumber(number)}
                            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-text-muted hover:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Modal Adicionar Número */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          resetForm()
        }}
        title="Adicionar Número"
        description="Adicione um novo número de WhatsApp"
      >
        <form onSubmit={handleAddNumber} className="space-y-5">
          <Input
            label="Número WhatsApp"
            placeholder="Ex: 5511999999999"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          
          <Input
            label="Nome/Identificação (opcional)"
            placeholder="Ex: João - Vendas"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          
          <Select
            label="Grupo"
            options={groups.map((g) => ({ value: g.id, label: g.name }))}
            value={formData.group_id}
            onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
            placeholder="Selecione um grupo"
            required
          />
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              Mensagem Customizada (opcional)
            </label>
            <textarea
              placeholder="Mensagem específica para este número..."
              value={formData.custom_message}
              onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-surface border border-surface-border rounded-xl text-white placeholder-text-muted transition-all duration-200 focus:outline-none focus:border-lime-500/50 focus:ring-2 focus:ring-lime-500/20 resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-surface-border bg-surface"
            />
            <span className="text-sm text-text-secondary">Número ativo</span>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false)
                resetForm()
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Adicionar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Número */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedNumber(null)
          resetForm()
        }}
        title="Editar Número"
        description="Atualize as informações do número"
      >
        <form onSubmit={handleEditNumber} className="space-y-5">
          <Input
            label="Número WhatsApp"
            placeholder="Ex: 5511999999999"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          
          <Input
            label="Nome/Identificação (opcional)"
            placeholder="Ex: João - Vendas"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          
          <Select
            label="Grupo"
            options={groups.map((g) => ({ value: g.id, label: g.name }))}
            value={formData.group_id}
            onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
            required
          />
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              Mensagem Customizada (opcional)
            </label>
            <textarea
              placeholder="Mensagem específica para este número..."
              value={formData.custom_message}
              onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-surface border border-surface-border rounded-xl text-white placeholder-text-muted transition-all duration-200 focus:outline-none focus:border-lime-500/50 focus:ring-2 focus:ring-lime-500/20 resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-surface-border bg-surface"
            />
            <span className="text-sm text-text-secondary">Número ativo</span>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsEditModalOpen(false)
                setSelectedNumber(null)
                resetForm()
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

