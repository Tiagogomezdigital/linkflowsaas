'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, LayoutGrid, List, RefreshCw } from 'lucide-react'
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

export default function GruposPage() {
  const [groups, setGroups] = useState<(Group & { total_numbers: number; active_numbers: number; total_clicks: number })[]>([])
  const [filteredGroups, setFilteredGroups] = useState<(Group & { total_numbers: number; active_numbers: number; total_clicks: number })[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddNumberModalOpen, setIsAddNumberModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  const fetchGroupsData = useCallback(
    async (mode: 'initial' | 'refresh' | 'none' = 'refresh') => {
      if (mode === 'initial') {
        setIsInitialLoading(true)
      } else if (mode === 'refresh') {
        setIsRefreshing(true)
      }

      try {
        const response = await fetch(`/api/groups?ts=${Date.now()}`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch groups')
        }

        const data = await response.json()

        // Buscar estatísticas de cliques para todos os grupos de uma vez
        let groupsWithStats = data.map((group: Group) => ({
          ...group,
          total_numbers: 0,
          active_numbers: 0,
          total_clicks: 0,
        }))

        try {
          const statsResponse = await fetch(`/api/group-stats?ts=${Date.now()}`, {
            cache: 'no-store',
          })

          if (statsResponse.ok) {
            const stats = await statsResponse.json()
            groupsWithStats = data.map((group: Group) => {
              const groupStats = stats.find((s: any) => s.id === group.id)
              return {
                ...group,
                total_numbers: groupStats?.total_numbers || 0,
                active_numbers: groupStats?.active_numbers || 0,
                total_clicks: groupStats?.total_clicks || 0,
              }
            })
          }
        } catch (error) {
          console.error('Error fetching stats:', error)
        }

        setGroups(groupsWithStats)
      } catch (error) {
        console.error('Error fetching groups:', error)
      } finally {
        if (mode === 'initial') {
          setIsInitialLoading(false)
        } else if (mode === 'refresh') {
          setIsRefreshing(false)
        }
      }
    },
    []
  )

  // Buscar grupos da API
  useEffect(() => {
    fetchGroupsData('initial')
  }, [fetchGroupsData])

  const handleRefresh = useCallback(() => {
    if (!isRefreshing) {
      fetchGroupsData('refresh')
    }
  }, [fetchGroupsData, isRefreshing])

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
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar grupo')
      }

      const newGroup = await response.json()
      
      // Recarregar grupos
      await fetchGroupsData('none')
      
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Error creating group:', error)
      alert(error instanceof Error ? error.message : 'Erro ao criar grupo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditGroup = async (data: Partial<Group>) => {
    if (!selectedGroup) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/groups/${selectedGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar grupo')
      }

      // Recarregar grupos
      await fetchGroupsData('none')
      
      setIsEditModalOpen(false)
      setSelectedGroup(null)
    } catch (error) {
      console.error('Error updating group:', error)
      alert(error instanceof Error ? error.message : 'Erro ao atualizar grupo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteGroup = async (group: Group) => {
    if (!confirm(`Tem certeza que deseja excluir o grupo "${group.name}"?`)) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir grupo')
      }

      // Recarregar grupos
      await fetchGroupsData('none')
    } catch (error) {
      console.error('Error deleting group:', error)
      alert(error instanceof Error ? error.message : 'Erro ao excluir grupo')
    } finally {
      setIsLoading(false)
    }
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              leftIcon={
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
              }
            >
              Atualizar
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Novo Grupo
            </Button>
          </div>
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
          {isInitialLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-secondary">Carregando grupos...</p>
              </div>
            </div>
          ) : filteredGroups.length === 0 ? (
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
                    // Navegar para relatórios com o grupo pré-selecionado
                    window.location.href = `/dashboard/relatorios?group=${g.id}`
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

