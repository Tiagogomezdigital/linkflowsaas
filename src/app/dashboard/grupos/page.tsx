'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, LayoutGrid, List } from 'lucide-react'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import GroupCard from '@/components/groups/GroupCard'
import GroupForm from '@/components/groups/GroupForm'
import AddNumberModal from '@/components/groups/AddNumberModal'
import type { Group, WhatsAppNumber } from '@/types'

// Dados mock para demonstração
const mockGroups: (Group & { total_numbers: number; active_numbers: number; total_clicks: number })[] = [
  {
    id: '1',
    company_id: '1',
    name: 'Grupo Teste Guilherme',
    slug: 'grupo-teste-guilherme',
    description: 'Grupo de teste para testar adição de números',
    default_message: 'Olá! Vi seu anúncio e gostaria de mais informações.',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_numbers: 5,
    active_numbers: 3,
    total_clicks: 127,
  },
  {
    id: '2',
    company_id: '1',
    name: 'Form Test Group 1763981674072',
    slug: 'form-test-group-1763981674072',
    description: 'Test group from form page',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_numbers: 0,
    active_numbers: 0,
    total_clicks: 0,
  },
  {
    id: '3',
    company_id: '1',
    name: 'Form Test Group 1763981673211',
    slug: 'form-test-group-1763981673211',
    description: 'Test group from form page',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_numbers: 0,
    active_numbers: 0,
    total_clicks: 0,
  },
]

export default function GruposPage() {
  const [groups, setGroups] = useState(mockGroups)
  const [filteredGroups, setFilteredGroups] = useState(mockGroups)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [isLoading, setIsLoading] = useState(false)
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddNumberModalOpen, setIsAddNumberModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  // Filter groups by search
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      setFilteredGroups(
        groups.filter(
          (g) =>
            g.name.toLowerCase().includes(query) ||
            g.slug.toLowerCase().includes(query) ||
            g.description?.toLowerCase().includes(query)
        )
      )
    } else {
      setFilteredGroups(groups)
    }
  }, [searchQuery, groups])

  const handleCreateGroup = async (data: Partial<Group>) => {
    setIsLoading(true)
    try {
      // Simular chamada API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      const newGroup = {
        ...data,
        id: Date.now().toString(),
        company_id: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_numbers: 0,
        active_numbers: 0,
        total_clicks: 0,
      } as Group & { total_numbers: number; active_numbers: number; total_clicks: number }
      
      setGroups((prev) => [newGroup, ...prev])
      setIsCreateModalOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditGroup = async (data: Partial<Group>) => {
    if (!selectedGroup) return
    
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      setGroups((prev) =>
        prev.map((g) =>
          g.id === selectedGroup.id ? { ...g, ...data, updated_at: new Date().toISOString() } : g
        )
      )
      setIsEditModalOpen(false)
      setSelectedGroup(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteGroup = async (group: Group) => {
    if (!confirm(`Tem certeza que deseja excluir o grupo "${group.name}"?`)) return
    
    setGroups((prev) => prev.filter((g) => g.id !== group.id))
  }

  const handleAddNumber = async (data: Partial<WhatsAppNumber>) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Atualizar contagem de números do grupo
      setGroups((prev) =>
        prev.map((g) =>
          g.id === selectedGroup?.id
            ? { ...g, total_numbers: g.total_numbers + 1, active_numbers: g.active_numbers + 1 }
            : g
        )
      )
      
      setIsAddNumberModalOpen(false)
      setSelectedGroup(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header
        title="Grupos"
        description="Gerencie seus grupos de WhatsApp"
        breadcrumbs={[{ label: 'Grupos' }]}
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Novo Grupo
          </Button>
        }
      />

      {/* Lista de Grupos */}
      <Card>
        <div className="flex flex-col gap-6">
          {/* Header da Lista */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Lista de Grupos</h2>
              <p className="text-sm text-text-secondary mt-1">
                Todos os grupos cadastrados no sistema
              </p>
            </div>

            {/* Toggle View */}
            <div className="flex items-center gap-1 p-1 bg-background rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-surface text-white'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm">Tabela</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-lime-500 text-black'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-sm">Cards</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <Input
            placeholder="Pesquisar grupos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          {/* Groups Grid/List */}
          {filteredGroups.length === 0 ? (
            <EmptyState
              icon={<LayoutGrid className="w-8 h-8" />}
              title="Nenhum grupo encontrado"
              description={
                searchQuery
                  ? 'Tente ajustar sua busca'
                  : 'Comece criando seu primeiro grupo de WhatsApp'
              }
              action={
                !searchQuery && (
                  <Button
                    variant="primary"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Criar Grupo
                  </Button>
                )
              }
            />
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onEdit={(g) => {
                    setSelectedGroup(g)
                    setIsEditModalOpen(true)
                  }}
                  onDelete={handleDeleteGroup}
                  onAddNumber={(g) => {
                    setSelectedGroup(g)
                    setIsAddNumberModalOpen(true)
                  }}
                  onViewStats={(g) => {
                    // TODO: Navegar para relatórios filtrado por grupo
                    console.log('Ver stats do grupo:', g.id)
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Slug</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Números</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Cliques</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.map((group) => (
                    <tr key={group.id} className="border-b border-surface-border hover:bg-surface-hover">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-white">{group.name}</p>
                          {group.description && (
                            <p className="text-sm text-text-muted truncate max-w-xs">{group.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-background px-2 py-1 rounded">{group.slug}</code>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          group.is_active 
                            ? 'bg-lime-500/10 text-lime-400' 
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {group.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{group.active_numbers}</td>
                      <td className="py-3 px-4 text-text-secondary">{group.total_clicks}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedGroup(group)
                              setIsAddNumberModalOpen(true)
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedGroup(group)
                              setIsEditModalOpen(true)
                            }}
                          >
                            Editar
                          </Button>
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

      {/* Modal Criar Grupo */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Grupo"
        description="Crie um novo grupo de WhatsApp para distribuição de leads"
      >
        <GroupForm
          onSubmit={handleCreateGroup}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Modal Editar Grupo */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedGroup(null)
        }}
        title="Editar Grupo"
        description="Atualize as informações do grupo"
      >
        <GroupForm
          group={selectedGroup}
          onSubmit={handleEditGroup}
          onCancel={() => {
            setIsEditModalOpen(false)
            setSelectedGroup(null)
          }}
          isLoading={isLoading}
        />
      </Modal>

      {/* Modal Adicionar Número */}
      <AddNumberModal
        isOpen={isAddNumberModalOpen}
        onClose={() => {
          setIsAddNumberModalOpen(false)
          setSelectedGroup(null)
        }}
        group={selectedGroup}
        onSubmit={handleAddNumber}
        isLoading={isLoading}
      />
    </>
  )
}

